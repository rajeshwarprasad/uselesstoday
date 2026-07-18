const crypto = require("crypto");
const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const { logActivity } = require("../realtime");
const { sendMail } = require("../utils/email");

const generateInvite = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    if (req.boardAccess.role !== "owner" && req.boardAccess.role !== "admin")
        throw ApiError.forbidden("Only owners or admins can create invite links");

    const { role: reqRole, email: inviteEmail } = req.body;
    const role = reqRole === "admin" ? "admin" : "member";
    const expiresInDays = Math.min(Math.max(parseInt(req.body.expiresInDays, 10) || 7, 1), 30);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const { rows } = await query(
        "INSERT INTO board_invites (board_id, token, role, created_by, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, token, role, expires_at, created_at",
        [boardId, token, role, req.user.id, expiresAt.toISOString()]
    );

    const invite = rows[0];
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const link = `${baseUrl}/invite/${invite.token}`;

    await logActivity(
        boardId,
        req.user.id,
        "invite.created",
        `${req.user.name} created an invite link`,
        { inviteId: invite.id, role }
    );

    // Send email if email provided
    if (inviteEmail) {
        const boardTitle = (await query("SELECT title FROM boards WHERE id = $1", [boardId])).rows[0]?.title;
        try {
            await sendMail({
                to: inviteEmail,
                subject: `You're invited to join "${boardTitle}" on FlowUpBoard`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                        <h2 style="color: #1a1a2e; margin-bottom: 16px;">You're invited!</h2>
                        <p style="color: #555; line-height: 1.6;">
                            <strong>${req.user.name}</strong> has invited you to join the board <strong>"${boardTitle}"</strong> on FlowUpBoard.
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
        } catch (err) { console.error("Invite email failed:", err.message); }
    }

    res.status(201).json({ invite: { ...invite, link } });
});

const listInvites = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const { rows } = await query(
        "SELECT i.id, i.token, i.role, i.expires_at, i.created_at, u.name AS created_by_name FROM board_invites i LEFT JOIN users u ON u.id = i.created_by WHERE i.board_id = $1 ORDER BY i.created_at DESC",
        [boardId]
    );

    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const invites = rows.map((inv) => ({
        ...inv,
        link: `${baseUrl}/invite/${inv.token}`,
        expired: inv.expires_at && new Date(inv.expires_at) < new Date(),
    }));

    res.json({ invites });
});

const getInvite = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { rows } = await query(
        "SELECT i.id, i.board_id, i.role, i.expires_at, b.title AS board_title, b.color AS board_color FROM board_invites i JOIN boards b ON b.id = i.board_id WHERE i.token = $1",
        [token]
    );

    if (!rows.length) throw ApiError.notFound("Invalid or expired invite link");

    const invite = rows[0];
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
        throw ApiError.badRequest("This invite link has expired");

    res.json({ invite });
});

const acceptInvite = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { rows } = await query(
        "SELECT i.*, b.title AS board_title, b.company_id FROM board_invites i JOIN boards b ON b.id = i.board_id WHERE i.token = $1",
        [token]
    );

    if (!rows.length) throw ApiError.notFound("Invalid invite link");

    const invite = rows[0];
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
        throw ApiError.badRequest("This invite link has expired");

    const existingBoard = await query(
        "SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2",
        [invite.board_id, req.user.id]
    );

    if (!existingBoard.rows.length) {
        await query(
            "INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)",
            [invite.board_id, req.user.id, invite.role]
        );
    }

    const existingCompany = await query(
        "SELECT 1 FROM company_members WHERE company_id = $1 AND user_id = $2",
        [invite.company_id, req.user.id]
    );

    if (!existingCompany.rows.length) {
        await query(
            "INSERT INTO company_members (company_id, user_id, role) VALUES ($1, $2, 'member')",
            [invite.company_id, req.user.id]
        );
    }

    await logActivity(
        invite.board_id,
        req.user.id,
        "member.joined",
        `${req.user.name} joined via invite link`,
        { role: invite.role }
    );

    res.json({ board: { id: invite.board_id, title: invite.board_title } });
});

const deleteInvite = asyncHandler(async (req, res) => {
    const { inviteId } = req.params;
    const { boardId } = req.params;
    if (req.boardAccess.role !== "owner" && req.boardAccess.role !== "admin")
        throw ApiError.forbidden("Only owners or admins can revoke invite links");

    await query("DELETE FROM board_invites WHERE id = $1 AND board_id = $2", [inviteId, boardId]);
    res.json({ success: true });
});

module.exports = { generateInvite, listInvites, getInvite, acceptInvite, deleteInvite };
