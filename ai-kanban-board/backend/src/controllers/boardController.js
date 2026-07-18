const { query, withTransaction } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const { emitToBoard, logActivity } = require("../realtime");

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Review", "Done"];

const listBoards = asyncHandler(async (req, res) => {
    const companyId = req.query.company_id;
    if (!companyId) throw ApiError.badRequest("company_id is required");

    const { rows } = await query(
        "SELECT b.*," +
            "(b.owner_id = $1) AS is_owner," +
            "(SELECT COUNT(*) FROM tasks t WHERE t.board_id = b.id) AS task_count," +
            "(SELECT COUNT(*) FROM board_members m WHERE m.board_id = b.id) AS member_count" +
        " FROM boards b" +
        " LEFT JOIN board_members mm ON mm.board_id = b.id AND mm.user_id = $1" +
        " WHERE b.company_id = $2 AND (b.owner_id = $1 OR mm.user_id = $1)" +
        " ORDER BY b.updated_at DESC",
        [req.user.id, companyId]
    );
    res.json({ boards: rows });
});

const createBoard = asyncHandler(async (req, res) => {
    const title = (req.body.title || "").trim();
    const description = (req.body.description || "").trim() || null;
    const color = req.body.color || "#6366f1";
    const companyId = req.body.company_id;
    if (!title) throw ApiError.badRequest("Board title is required");
    if (!companyId) throw ApiError.badRequest("company_id is required");

    // Verify user belongs to this company
    const memberCheck = await query(
        "SELECT 1 FROM company_members WHERE company_id = $1 AND user_id = $2",
        [companyId, req.user.id]
    );
    if (!memberCheck.rows.length) throw ApiError.forbidden("You are not a member of this company");

    const board = await withTransaction(async (client) => {
        const { rows } = await client.query(
            "INSERT INTO boards (title, description, color, owner_id, company_id)" +
            " VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, description, color, req.user.id, companyId]
        );
        const newBoard = rows[0];

        await client.query(
            "INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, 'owner')",
            [newBoard.id, req.user.id]
        );

        for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
            await client.query(
                "INSERT INTO columns (board_id, title, position) VALUES ($1, $2, $3)",
                [newBoard.id, DEFAULT_COLUMNS[i], (i + 1) * 1000]
            );
        }

        return newBoard;
    });

    res.status(201).json({ board });
});

const getBoard = asyncHandler(async (req, res) => {
    const boardId = req.params.boardId;

    const [boardRes, columnsRes, tasksRes, membersRes] = await Promise.all([
        query("SELECT * FROM boards WHERE id = $1", [boardId]),
        query("SELECT * FROM columns WHERE board_id = $1 ORDER BY position ASC", [boardId]),
        query(
            "SELECT t.*," +
            " a.name AS assignee_name, a.email AS assignee_email, a.avatar_url AS assignee_avatar" +
            " FROM tasks t" +
            " LEFT JOIN users a ON a.id = t.assignee_id" +
            " WHERE t.board_id = $1" +
            " ORDER BY t.position ASC",
            [boardId]
        ),
        query(
            "SELECT u.id, u.name, u.email, u.avatar_url, m.role, m.joined_at" +
            " FROM board_members m" +
            " JOIN users u ON u.id = m.user_id" +
            " WHERE m.board_id = $1" +
            " ORDER BY m.joined_at ASC",
            [boardId]
        ),
    ]);

    res.json({
        board: boardRes.rows[0],
        columns: columnsRes.rows,
        tasks: tasksRes.rows,
        members: membersRes.rows,
        role: req.boardAccess.role,
    });
});

const updateBoard = asyncHandler(async (req, res) => {
    if (req.boardAccess.role !== "owner") throw ApiError.forbidden("Only the board owner can update the board");
    const { title, description, color } = req.body;
    const { rows } = await query(
        "UPDATE boards" +
        " SET title = COALESCE($2, title)," +
        " description = COALESCE($3, description)," +
        " color = COALESCE($4, color)," +
        " updated_at = NOW()" +
        " WHERE id = $1" +
        " RETURNING *",
        [req.boardAccess.id, title ?? null, description ?? null, color ?? null]
    );
    emitToBoard(req.boardAccess.id, "board_updated", rows[0]);
    res.json({ board: rows[0] });
});

const deleteBoard = asyncHandler(async (req, res) => {
    if (req.boardAccess.role !== "owner")
        throw ApiError.forbidden("Only the board owner can delete the board");
    await query("DELETE FROM boards WHERE id = $1", [req.boardAccess.id]);
    emitToBoard(req.boardAccess.id, "board_deleted", { boardId: req.boardAccess.id });
    res.json({ message: "Board deleted successfully" });
});

const getActivity = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const { rows } = await query(
        "SELECT act.*, u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar" +
        " FROM activities act" +
        " LEFT JOIN users u ON u.id = act.user_id" +
        " WHERE act.board_id = $1" +
        " ORDER BY act.created_at DESC" +
        " LIMIT $2",
        [req.boardAccess.id, limit]
    );
    res.json({ activities: rows });
});

const addMember = asyncHandler(async (req, res) => {
    if (req.boardAccess.role !== "owner" && req.boardAccess.role !== "admin")
        throw ApiError.forbidden("Only the board owner or admin can add members");

    const email = (req.body.email || "").trim().toLowerCase();
    const role = req.body.role === "admin" ? "admin" : "member";
    if (!email) throw ApiError.badRequest("Member email is required");

    const userRes = await query("SELECT id, name, email, avatar_url FROM users WHERE email = $1", [email]);
    const user = userRes.rows[0];
    if (!user) throw ApiError.notFound("No user found with that email");

    // Auto-add user to the board's company if not already a member
    if (req.boardAccess.company_id) {
        const companyCheck = await query(
            "SELECT 1 FROM company_members WHERE company_id = $1 AND user_id = $2",
            [req.boardAccess.company_id, user.id]
        );
        if (!companyCheck.rows.length) {
            await query(
                "INSERT INTO company_members (company_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING",
                [req.boardAccess.company_id, user.id]
            );
        }
    }

    await query(
        "INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)" +
        " ON CONFLICT (board_id, user_id) DO UPDATE SET role = EXCLUDED.role",
        [req.boardAccess.id, user.id, role]
    );

    await logActivity(
        req.boardAccess.id,
        req.user.id,
        "member.added",
        `${req.user.name} added ${user.name} to the board`,
        { memberId: user.id }
    );

    res.status(201).json({ member: { ...user, role } });
});

const removeMember = asyncHandler(async (req, res) => {
    if (req.boardAccess.role !== "owner" && req.boardAccess.role !== "admin")
        throw ApiError.forbidden("Only owners or admins can remove members");
    const { userId } = req.params;
    if (userId === req.boardAccess.owner_id) throw ApiError.badRequest("Cannot remove the board owner");

    await query(
        "DELETE FROM board_members WHERE board_id = $1 AND user_id = $2",
        [req.boardAccess.id, userId]
    );
    res.json({ success: true });
});

module.exports = {
    listBoards,
    createBoard,
    getBoard,
    updateBoard,
    deleteBoard,
    getActivity,
    addMember,
    removeMember,
};
