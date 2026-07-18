const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const { emitToBoard } = require("../realtime");

const createColumn = asyncHandler(async (req, res) => {
    if (req.boardAccess.role !== "owner") throw ApiError.forbidden("Only the board owner can create columns");

    const title = (req.body.title || "").trim();
    if (!title) throw ApiError.badRequest("Column title is required");

    const posRes = await query(
        "SELECT COALESCE(MAX(position), 0) + 1000 AS pos FROM columns WHERE board_id = $1",
        [req.boardAccess.id]
    );
    const { rows } = await query(
        "INSERT INTO columns (board_id, title, position) VALUES ($1, $2, $3) RETURNING *",
        [req.boardAccess.id, title, posRes.rows[0].pos]
    );
    emitToBoard(req.boardAccess.id, "column:created", rows[0]);
    res.status(201).json({ column: rows[0] });
});

const updateColumn = asyncHandler(async (req, res) => {
    const { title, position } = req.body;
    const { rows } = await query(
        "UPDATE columns" +
        " SET title = COALESCE($3, title)," +
        " position = COALESCE($4, position)" +
        " WHERE id = $1 AND board_id = $2" +
        " RETURNING *",
        [req.params.columnId, req.boardAccess.id, title ?? null, position ?? null]
    );
    if (!rows.length) throw ApiError.notFound("Column not found");
    emitToBoard(req.boardAccess.id, "column:updated", rows[0]);
    res.json({ column: rows[0] });
});

const deleteColumn = asyncHandler(async (req, res) => {
    if (req.boardAccess.role !== "owner") throw ApiError.forbidden("Only the board owner can delete columns");

    const colCheck = await query(
        "SELECT id, position FROM columns WHERE id = $1 AND board_id = $2",
        [req.params.columnId, req.boardAccess.id]
    );
    if (!colCheck.rows.length) throw ApiError.notFound("Column not found");

    const defaultCheck = await query(
        "SELECT id FROM columns WHERE board_id = $1 ORDER BY position ASC LIMIT 4",
        [req.boardAccess.id]
    );
    const defaultIds = defaultCheck.rows.map((r) => r.id);
    if (defaultIds.includes(req.params.columnId)) throw ApiError.badRequest("Default columns cannot be deleted");

    const result = await query(
        "DELETE FROM columns WHERE id = $1 AND board_id = $2",
        [req.params.columnId, req.boardAccess.id]
    );
    if (!result.rowCount) throw ApiError.notFound("Column not found");
    emitToBoard(req.boardAccess.id, "column:deleted", { id: req.params.columnId });
    res.json({ success: true });
});

module.exports = { createColumn, updateColumn, deleteColumn };
