const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");

const requireCompanyAccess = asyncHandler(async (req, res, next) => {
    const companyId =
        req.params.companyId || req.body.company_id || req.query.company_id;

    if (!companyId) throw ApiError.badRequest("Company ID is required");

    const { rows } = await query(
        "SELECT cm.role, c.created_by" +
        " FROM company_members cm" +
        " JOIN companies c ON c.id = cm.company_id" +
        " WHERE cm.company_id = $1 AND cm.user_id = $2",
        [companyId, req.user.id]
    );

    if (!rows.length) {
        throw ApiError.forbidden("You do not have access to this company");
    }

    const m = rows[0];
    const isOwner = m.created_by === req.user.id;

    req.companyAccess = {
        id: companyId,
        role: isOwner ? "owner" : m.role,
        created_by: m.created_by,
    };
    next();
});

module.exports = requireCompanyAccess;
