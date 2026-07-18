const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");

const requireBoardAccess = asyncHandler(async (req, res, next) => {
    const boardId = 
    req.params.boardId || req.body.board_id || req.query.board_id;

    if (!boardId) throw ApiError.badRequest("Board ID is required");

    // First check board membership or ownership
    const { rows } = await query(
        "SELECT bm.*, b.owner_id, b.company_id FROM board_members bm JOIN boards b ON b.id = bm.board_id WHERE bm.board_id = $1 AND bm.user_id = $2",
        [boardId, req.user.id]
    );

    if (!rows.length) {
        const ownerCheck = await query(
            "SELECT id, owner_id, company_id FROM boards WHERE id = $1",
            [boardId]
        );
        if (!ownerCheck.rows.length) throw ApiError.notFound("Board is not found.");
        if (ownerCheck.rows[0].owner_id === req.user.id) {
            // Verify owner is also a company member
            if (ownerCheck.rows[0].company_id) {
                const cmCheck = await query(
                    "SELECT 1 FROM company_members WHERE company_id = $1 AND user_id = $2",
                    [ownerCheck.rows[0].company_id, req.user.id]
                );
                if (!cmCheck.rows.length) throw ApiError.forbidden("You are not a member of this board's company.");
            }
            req.boardAccess = { id: boardId, owner_id: req.user.id, role: "owner", company_id: ownerCheck.rows[0].company_id };
            return next();
        }
        throw ApiError.forbidden("You do not have permission to access this board.");
    }
   
    const member = rows[0];
    const isOwner = member.owner_id === req.user.id;
    if (!isOwner && !member.role) {
        throw ApiError.forbidden("You do not have permission to access this board.");
    }

    req.boardAccess = { 
        id: boardId,
        owner_id: member.owner_id,
        role: isOwner ? "owner" : member.role,
        company_id: member.company_id,
    };
    next();
});

module.exports = requireBoardAccess;
