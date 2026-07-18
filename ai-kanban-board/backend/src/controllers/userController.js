const { query } = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

const searchUsers = asyncHandler(async (req, res) => {
    const q = (req.query.q || "").trim();
    const companyId = req.query.company_id;
    if (q.length < 2) return res.json({ users: [] });

    if (companyId) {
        // Scope to company members
        const { rows } = await query(
            "SELECT u.id, u.name, u.email, u.avatar_url" +
            " FROM users u" +
            " JOIN company_members cm ON cm.user_id = u.id AND cm.company_id = $2" +
            " WHERE (u.name ILIKE $1 OR u.email ILIKE $1)" +
            " ORDER BY u.name ASC LIMIT 10",
            [`%${q}%`, companyId]
        );
        res.json({ users: rows });
    } else {
        const { rows } = await query(
            "SELECT id, name, email, avatar_url FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY name ASC LIMIT 10",
            [`%${q}%`],
        );
        res.json({ users: rows });
    }
});

module.exports = { searchUsers };
