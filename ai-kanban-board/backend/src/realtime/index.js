const { pool, query } = require("../config/db");

let io = null;

const setIo = (instance) => {
    io = instance;
};

const boardRoom = (boardId) => `board:${boardId}`;

const emitToBoard = (boardId, event, payload) => {
    if (io) io.to(boardRoom(boardId)).emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
    if (io) io.to(`user:${userId}`).emit(event, payload);
};

const logActivity = async (boardIdOrObj, userId, action, message, metadata) => {
    if (typeof boardIdOrObj === "object" && boardIdOrObj !== null) {
        ({ boardId: boardIdOrObj, userId, action, message, metadata } = boardIdOrObj);
    }
    const { rows } = await query(
        `INSERT INTO activities (board_id, user_id, action, message, metadata) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, board_id, user_id, action, message, metadata, created_at`,
        [boardIdOrObj, userId || null, action, message, metadata ? JSON.stringify(metadata) : null]
    );
    const activity = rows[0];
    emitToBoard(boardIdOrObj, "activity:new", activity);
    return activity;
};

module.exports = {
    setIo,
    boardRoom,
    emitToBoard,
    emitToUser,
    logActivity
};
