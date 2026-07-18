const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const { emitToBoard, emitToUser, logActivity } = require("../realtime");
const { createNotification } = require("../controllers/notificationController");

const PRIORITIES = ["low", "medium", "high", "urgent"];

const fetchTask = async (taskId) => {
    const { rows } = await query (
        `SELECT t.*,
                 a.name AS assignee_name, a.email AS assignee_email, a.avatar_url AS assignee_avatar
            FROM tasks t
            LEFT JOIN users a ON a.id = t.assignee_id
            WHERE t.id = $1`,
        [taskId]
    );
    return rows[0];
};

const ensureColumnInBoard = async (columnId, boardId) => {
    const { rows } = await query(
        "SELECT id FROM columns WHERE id = $1 AND board_id = $2",
        [columnId, boardId]
    );
    if (!rows.length) throw ApiError.badRequest("Column not belong to this board");
};

const listTasks = asyncHandler(async (req, res) => {
    const filters = [ "t.board_id = $1"];
    const params = [req.boardAccess.id];

    if (req.query.priority) {
        params.push(req.query.priority);
        filters.push(`t.priority = $${params.length}`);
    }
    if (req.query.assignee) {
        params.push(req.query.assignee);
        filters.push(`t.assignee_id = $${params.length}`);
    }
    if (req.query.column) {
        params.push(req.query.column);
        filters.push(`t.column_id = $${params.length}`);
    }
    if (req.query.q) {
        params.push(`%${req.query.q}%`);
        filters.push(`(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
    }

    const { rows } = await query(
        `SELECT t.*,
                a.name AS assignee_name, a.email AS assignee_email, a.avatar_url AS assignee_avatar
            FROM tasks t
            LEFT JOIN users a ON a.id = t.assignee_id
            WHERE ${filters.join(" AND ")}
            ORDER BY t.position ASC`,
        params
    );
    res.json({ tasks: rows });
});

const createTask = asyncHandler(async (req, res) =>{
    const { column_id, title: rawTitle, description, due_date, start_date, assignee_id } = req.body;
    const title = (rawTitle || "").trim();
    const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : "medium";

    if (!title) throw ApiError.badRequest("Task title is required");
    if (!column_id) throw ApiError.badRequest("column_id is required");
    await ensureColumnInBoard(column_id, req.boardAccess.id);

    const posRes = await query(
        "SELECT COALESCE(MAX(position), 0) + 1000 AS pos FROM tasks WHERE column_id = $1",
        [column_id]
    );
    
    const { rows } = await query(
        `INSERT INTO tasks (board_id, column_id, title, description, priority, start_date, due_date, assignee_id, position, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
            req.boardAccess.id,
            column_id,
            title,
            description || null,
            priority,
            start_date || new Date().toISOString(),
            due_date || null,
            assignee_id || null,
            posRes.rows[0].pos,
            req.user.id,
        ]
    );

    const task = await fetchTask(rows[0].id);
    emitToBoard(req.boardAccess.id, "task:created", task);
    await logActivity({
        boardId: req.boardAccess.id,
        userId: req.user.id,
        action: "task.created",
        message: `${req.user.name} created "${task.title}"`,
        metadata: { taskId: task.id },
    });
    res.status(201).json({ task });
});

const updateTask = asyncHandler(async (req, res) => {
    const { title, description, priority, due_date, start_date, assignee_id } = req.body;
    if (priority !== undefined && !PRIORITIES.includes(priority))
        throw ApiError.badRequest("Invalid Priority");

    const { rows } = await query(
        `UPDATE tasks
            SET title       = COALESCE($3, title),
                description = COALESCE($4, description),
                priority    = COALESCE($5, priority),
                start_date  = COALESCE($6, start_date),
                due_date    = COALESCE($7, due_date),
                assignee_id = $8,
                updated_at  = now()
        WHERE id = $1 AND board_id =$2
        RETURNING id`,
    [
        req.params.taskId,
        req.boardAccess.id,
        title ?? null,
        description ?? null,
        priority ?? null,
        start_date ?? null,
        due_date ?? null,
        assignee_id === undefined ? null : assignee_id,
    ]
    );
    if (!rows.length) throw ApiError.notFound("Task not found");

    const task = await fetchTask(rows[0].id);
    emitToBoard(req.boardAccess.id, "task:updated", task);

    // Notify board members (except the editor) about task edit
    try {
        const { rows: members } = await query(
            "SELECT user_id FROM board_members WHERE board_id = $1 AND user_id != $2",
            [req.boardAccess.id, req.user.id]
        );
        // Also notify the task assignee if different from editor
        if (task.assignee_id && task.assignee_id !== req.user.id) {
            const alreadyNotified = members.some((m) => m.user_id === task.assignee_id);
            if (!alreadyNotified) members.push({ user_id: task.assignee_id });
        }
        // Also notify board owner if not editor
        if (req.boardAccess.owner_id !== req.user.id) {
            const alreadyNotified = members.some((m) => m.user_id === req.boardAccess.owner_id);
            if (!alreadyNotified) members.push({ user_id: req.boardAccess.owner_id });
        }

        const boardTitle = (await query("SELECT title FROM boards WHERE id = $1", [req.boardAccess.id])).rows[0]?.title;
        for (const m of members) {
            const notif = await createNotification(m.user_id, {
                type: "task_edited",
                title: `Task "${task.title}" was edited`,
                message: `Edited by ${req.user.name} in board "${boardTitle}"`,
                boardId: req.boardAccess.id,
                taskId: task.id,
            });
            emitToUser(m.user_id, "notification:new", notif);
        }
    } catch { /* notification failure is non-blocking */ }

    res.json({ task });
});

const moveTask = asyncHandler(async (req, res) => {
    const { column_id, position } = req.body;
    if (!column_id || position === undefined)
        throw ApiError.badRequest("Column_Id and position are required");
    await ensureColumnInBoard(column_id, req.boardAccess.id);

    const prevRes = await query(
        `SELECT t.column_id, c.title FROM tasks t JOIN columns c ON c.id = t.column_id WHERE t.id = $1 AND t.board_id = $2`,
        [req.params.taskId, req.boardAccess.id]
    );
    if (!prevRes.rows.length) throw ApiError.notFound("Task not found");
    const moveColumns = prevRes.rows[0].column_id !== column_id;

    const { rows } = await query(
        `UPDATE tasks
            SET column_id =$3, position =$4, updated_at = now()
        WHERE id =$1 AND board_id =$2
        RETURNING id`,
    [req.params.taskId, req.boardAccess.id, column_id, position]
    );

    const task = await fetchTask(rows[0].id);
    emitToBoard(req.boardAccess.id, "task:moved", task);

    if (moveColumns) {
        const colRes = await query("SELECT title FROM columns WHERE id =$1", [column_id]);
        await logActivity({
            boardId: req.boardAccess.id,
            userId: req.user.id,
            action: "task.moved",
            message: `${req.user.name} moved "${task.title}" to ${colRes.rows[0].title}`,
            metadata: { taskId: task.id, columnId: column_id },
        });
    }
    res.json({ task });
});

const deleteTask = asyncHandler(async (req, res) => {
    const { rows } = await query(
        "DELETE FROM tasks WHERE id =$1 AND board_id =$2 RETURNING title",
        [req.params.taskId, req.boardAccess.id]
    );
    if (!rows.length) throw ApiError.notFound("Task not found");

    emitToBoard(req.boardAccess.id, "task:deleted", { id: req.params.taskId });
    await logActivity({
        boardId: req.boardAccess.id,
        userId: req.user.id,
        action: "task.deleted",
        message: `${req.user.name} deleted "${rows[0].title}"`,
        metadata: { taskId: req.params.taskId },
    });
    res.json({ success: true });
});

const moveToBoard = asyncHandler(async (req, res) => {
    const { target_board_id, target_column_id, position } = req.body;
    if (!target_board_id || !target_column_id || position === undefined)
        throw ApiError.badRequest("target_board_id, target_column_id, and position are required");

    // Verify user has access to target board
    const targetAccess = await query(
        "SELECT bm.role, b.owner_id FROM board_members bm JOIN boards b ON b.id = bm.board_id WHERE bm.board_id = $1 AND bm.user_id = $2",
        [target_board_id, req.user.id]
    );
    let targetRole = "member";
    if (!targetAccess.rows.length) {
        const ownerCheck = await query("SELECT owner_id FROM boards WHERE id = $1", [target_board_id]);
        if (!ownerCheck.rows.length) throw ApiError.notFound("Target board not found");
        if (ownerCheck.rows[0].owner_id !== req.user.id)
            throw ApiError.forbidden("You do not have access to the target board");
        targetRole = "owner";
    } else {
        targetRole = targetAccess.rows[0].role;
    }

    // Verify target column belongs to target board
    const colCheck = await query(
        "SELECT id, title FROM columns WHERE id = $1 AND board_id = $2",
        [target_column_id, target_board_id]
    );
    if (!colCheck.rows.length) throw ApiError.badRequest("Column does not belong to the target board");

    // Fetch the task from source board
    const prevRes = await query(
        "SELECT t.*, b.title AS source_board_title FROM tasks t JOIN boards b ON b.id = t.board_id WHERE t.id = $1 AND t.board_id = $2",
        [req.params.taskId, req.boardAccess.id]
    );
    if (!prevRes.rows.length) throw ApiError.notFound("Task not found");

    const task = prevRes.rows[0];
    const sourceBoardId = req.boardAccess.id;

    // Move task to target board
    const { rows } = await query(
        `UPDATE tasks
            SET board_id = $3, column_id = $4, position = $5, updated_at = now()
        WHERE id = $1 AND board_id = $2
        RETURNING id`,
        [req.params.taskId, sourceBoardId, target_board_id, target_column_id, position]
    );
    if (!rows.length) throw ApiError.notFound("Task not found");

    // Fetch updated task with assignee info
    const updatedTask = await fetchTask(rows[0].id);

    // Emit to both boards
    emitToBoard(sourceBoardId, "task:deleted", { id: req.params.taskId });
    emitToBoard(target_board_id, "task:created", updatedTask);

    // Log activity on both boards
    const targetBoardTitle = (await query("SELECT title FROM boards WHERE id = $1", [target_board_id])).rows[0]?.title;
    await logActivity({
        boardId: sourceBoardId,
        userId: req.user.id,
        action: "task.moved",
        message: `${req.user.name} moved "${task.title}" to board "${targetBoardTitle}"`,
        metadata: { taskId: task.id, targetBoardId: target_board_id },
    });
    await logActivity({
        boardId: target_board_id,
        userId: req.user.id,
        action: "task.created",
        message: `${req.user.name} moved "${task.title}" from board "${task.source_board_title}"`,
        metadata: { taskId: task.id, sourceBoardId },
    });

    res.json({ task: updatedTask });
});

module.exports = { listTasks, createTask, updateTask, moveTask, deleteTask, moveToBoard };
