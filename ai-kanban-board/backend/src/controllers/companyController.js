const crypto = require("crypto");
const { query, withTransaction } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const { sendMail } = require("../utils/email");

const slugify = (text) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) + "-" + crypto.randomBytes(3).toString("hex");

/* ── List companies the current user belongs to ────────────────────────── */
const listCompanies = asyncHandler(async (req, res) => {
    const { rows } = await query(
        "SELECT c.*, cm.role AS my_role," +
        " (SELECT COUNT(*) FROM company_members WHERE company_id = c.id) AS member_count," +
        " (SELECT COUNT(*) FROM boards WHERE company_id = c.id) AS board_count" +
        " FROM companies c" +
        " JOIN company_members cm ON cm.company_id = c.id AND cm.user_id = $1" +
        " ORDER BY c.created_at ASC",
        [req.user.id]
    );
    res.json({ companies: rows });
});

/* ── Create a new company ──────────────────────────────────────────────── */
const createCompany = asyncHandler(async (req, res) => {
    const name = (req.body.name || "").trim();
    const description = (req.body.description || "").trim() || null;
    if (!name) throw ApiError.badRequest("Company name is required");

    const slug = slugify(name);

    const company = await withTransaction(async (client) => {
        const { rows } = await client.query(
            "INSERT INTO companies (name, slug, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, slug, description, req.user.id]
        );
        const c = rows[0];

        await client.query(
            "INSERT INTO company_members (company_id, user_id, role) VALUES ($1, $2, 'owner')",
            [c.id, req.user.id]
        );

        return c;
    });

    res.status(201).json({ company, my_role: "owner" });
});

/* ── Get single company ────────────────────────────────────────────────── */
const getCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { rows } = await query(
        "SELECT c.*, cm.role AS my_role," +
        " (SELECT COUNT(*) FROM company_members WHERE company_id = c.id) AS member_count," +
        " (SELECT COUNT(*) FROM boards WHERE company_id = c.id) AS board_count" +
        " FROM companies c" +
        " JOIN company_members cm ON cm.company_id = c.id AND cm.user_id = $2" +
        " WHERE c.id = $1",
        [companyId, req.user.id]
    );
    if (!rows.length) throw ApiError.notFound("Company not found");
    res.json({ company: rows[0] });
});

/* ── Update company ────────────────────────────────────────────────────── */
const updateCompany = asyncHandler(async (req, res) => {
    if (req.companyAccess.role !== "owner" && req.companyAccess.role !== "admin")
        throw ApiError.forbidden("Only the owner or admins can update the company");

    const { companyId } = req.params;
    const { name, description } = req.body;

    const { rows } = await query(
        "UPDATE companies" +
        " SET name = COALESCE($2, name)," +
        " description = COALESCE($3, description)," +
        " updated_at = NOW()" +
        " WHERE id = $1" +
        " RETURNING *",
        [companyId, name ?? null, description ?? null]
    );
    res.json({ company: rows[0] });
});

/* ── Delete company (owner only) ───────────────────────────────────────── */
const deleteCompany = asyncHandler(async (req, res) => {
    if (req.companyAccess.role !== "owner")
        throw ApiError.forbidden("Only the owner can delete the company");

    const { companyId } = req.params;
    await withTransaction(async (client) => {
        await client.query("DELETE FROM company_members WHERE company_id = $1", [companyId]);
        await client.query("DELETE FROM company_invites WHERE company_id = $1", [companyId]);
        await client.query("DELETE FROM companies WHERE id = $1", [companyId]);
    });
    res.json({ message: "Company deleted" });
});

/* ── List members ──────────────────────────────────────────────────────── */
const listMembers = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { rows } = await query(
        "SELECT u.id, u.name, u.email, u.avatar_url, cm.role, cm.joined_at" +
        " FROM company_members cm" +
        " JOIN users u ON u.id = cm.user_id" +
        " WHERE cm.company_id = $1" +
        " ORDER BY cm.joined_at ASC",
        [companyId]
    );
    res.json({ members: rows });
});

/* ── Add member by email ───────────────────────────────────────────────── */
const addMember = asyncHandler(async (req, res) => {
    if (req.companyAccess.role !== "owner" && req.companyAccess.role !== "admin")
        throw ApiError.forbidden("Only the owner or admins can add members");

    const { companyId } = req.params;
    const email = (req.body.email || "").trim().toLowerCase();
    const role = req.body.role === "admin" ? "admin" : "member";
    if (!email) throw ApiError.badRequest("Email is required");

    const userRes = await query("SELECT id, name, email, avatar_url FROM users WHERE email = $1", [email]);
    if (!userRes.rows.length) throw ApiError.notFound("No user found with that email");
    const user = userRes.rows[0];

    await query(
        "INSERT INTO company_members (company_id, user_id, role) VALUES ($1, $2, $3)" +
        " ON CONFLICT (company_id, user_id) DO UPDATE SET role = EXCLUDED.role",
        [companyId, user.id, role]
    );

    res.status(201).json({ member: { ...user, role } });
});

/* ── Remove member ─────────────────────────────────────────────────────── */
const removeMember = asyncHandler(async (req, res) => {
    if (req.companyAccess.role !== "owner" && req.companyAccess.role !== "admin")
        throw ApiError.forbidden("Only the owner or admins can remove members");

    const { companyId, userId } = req.params;

    const ownerCheck = await query(
        "SELECT created_by FROM companies WHERE id = $1",
        [companyId]
    );
    if (ownerCheck.rows.length && ownerCheck.rows[0].created_by === userId)
        throw ApiError.badRequest("Cannot remove the company owner");

    await query(
        "DELETE FROM company_members WHERE company_id = $1 AND user_id = $2",
        [companyId, userId]
    );
    res.json({ success: true });
});

/* ── Generate invite link ──────────────────────────────────────────────── */
const generateInvite = asyncHandler(async (req, res) => {
    if (req.companyAccess.role !== "owner" && req.companyAccess.role !== "admin")
        throw ApiError.forbidden("Only the owner or admins can generate invites");

    const { companyId } = req.params;
    const { role: reqRole, email: inviteEmail } = req.body;
    const role = reqRole === "admin" ? "admin" : "member";
    const expiresInDays = Math.min(Math.max(parseInt(req.body.expiresInDays, 10) || 7, 1), 30);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const { rows } = await query(
        "INSERT INTO company_invites (company_id, token, role, created_by, expires_at)" +
        " VALUES ($1, $2, $3, $4, $5) RETURNING id, token, role, expires_at, created_at",
        [companyId, token, role, req.user.id, expiresAt.toISOString()]
    );

    const invite = rows[0];
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const link = `${baseUrl}/company-invite/${invite.token}`;

    // Send email if email provided
    if (inviteEmail) {
        const companyName = (await query("SELECT name FROM companies WHERE id = $1", [companyId])).rows[0]?.name;
        try {
            await sendMail({
                to: inviteEmail,
                subject: `You're invited to join "${companyName}" on FlowUpBoard`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                        <h2 style="color: #1a1a2e; margin-bottom: 16px;">You're invited!</h2>
                        <p style="color: #555; line-height: 1.6;">
                            <strong>${req.user.name}</strong> has invited you to join the company <strong>"${companyName}"</strong> on FlowUpBoard.
                        </p>
                        <p style="color: #555; line-height: 1.6;">
                            Role: <strong style="text-transform: capitalize;">${role}</strong><br>
                            Expires: <strong>${expiresAt.toLocaleDateString()}</strong>
                        </p>
                        <a href="${link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                            Accept Invitation
                        </a>
                        <p style="color: #999; font-size: 12px; margin-top: 24px;">
                            If the button doesn't work, copy this link: ${link}
                        </p>
                    </div>
                `,
            });
        } catch (err) { console.error("Company invite email failed:", err.message); }
    }

    res.status(201).json({ invite: { ...invite, link } });
});

/* ── List invites ──────────────────────────────────────────────────────── */
const listInvites = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { rows } = await query(
        "SELECT i.id, i.token, i.role, i.expires_at, i.created_at, u.name AS created_by_name" +
        " FROM company_invites i" +
        " LEFT JOIN users u ON u.id = i.created_by" +
        " WHERE i.company_id = $1" +
        " ORDER BY i.created_at DESC",
        [companyId]
    );

    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const invites = rows.map((inv) => ({
        ...inv,
        link: `${baseUrl}/company-invite/${inv.token}`,
        expired: inv.expires_at && new Date(inv.expires_at) < new Date(),
    }));

    res.json({ invites });
});

/* ── Revoke invite ─────────────────────────────────────────────────────── */
const deleteInvite = asyncHandler(async (req, res) => {
    const { companyId, inviteId } = req.params;
    await query("DELETE FROM company_invites WHERE id = $1 AND company_id = $2", [inviteId, companyId]);
    res.json({ success: true });
});

/* ── Public: get invite details by token ───────────────────────────────── */
const getInvite = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { rows } = await query(
        "SELECT i.id, i.company_id, i.role, i.expires_at," +
        " c.name AS company_name, c.slug AS company_slug" +
        " FROM company_invites i" +
        " JOIN companies c ON c.id = i.company_id" +
        " WHERE i.token = $1",
        [token]
    );

    if (!rows.length) throw ApiError.notFound("Invalid or expired invite link");
    const invite = rows[0];
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
        throw ApiError.badRequest("This invite link has expired");

    res.json({ invite });
});

/* ── Auth required: accept company invite ──────────────────────────────── */
const acceptInvite = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { rows } = await query(
        "SELECT i.*, c.name AS company_name FROM company_invites i" +
        " JOIN companies c ON c.id = i.company_id" +
        " WHERE i.token = $1",
        [token]
    );

    if (!rows.length) throw ApiError.notFound("Invalid invite link");
    const invite = rows[0];
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
        throw ApiError.badRequest("This invite link has expired");

    const existing = await query(
        "SELECT 1 FROM company_members WHERE company_id = $1 AND user_id = $2",
        [invite.company_id, req.user.id]
    );

    if (!existing.rows.length) {
        await query(
            "INSERT INTO company_members (company_id, user_id, role) VALUES ($1, $2, $3)",
            [invite.company_id, req.user.id, invite.role]
        );
    }

    res.json({
        company: { id: invite.company_id, name: invite.company_name },
    });
});

module.exports = {
    listCompanies,
    createCompany,
    getCompany,
    updateCompany,
    deleteCompany,
    listMembers,
    addMember,
    removeMember,
    generateInvite,
    listInvites,
    deleteInvite,
    getInvite,
    acceptInvite,
};
