const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { query } = require("../config/db");
const { signToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const { sendMail } = require("../utils/email");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;
const loginAttempts = new Map();

const publicuser = (u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar_url: u.avatar_url,
    created_at: u.created_at,
});

/* ── Query companies for a user (shared between register/login/me) ───── */
const getUserCompanies = async (userId) => {
    const { rows } = await query(
        "SELECT c.id, c.name, c.slug, cm.role" +
        " FROM companies c" +
        " JOIN company_members cm ON cm.company_id = c.id" +
        " WHERE cm.user_id = $1" +
        " ORDER BY c.created_at ASC",
        [userId]
    );
    return rows;
};

const register = asyncHandler(async (req, res) => {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!name) throw ApiError.badRequest("Name is required");
    if (!EMAIL_REGEX.test(email)) throw ApiError.badRequest("A valid email address is required");
    if (!password || !PASSWORD_REGEX.test(password)) 
        throw ApiError.badRequest("Password must be at least 6 characters with uppercase, lowercase, and a number");

    const existting = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existting.rows.length > 0) throw ApiError.conflict("Email is already registered");

    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
        `INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3) 
        RETURNING id, name, email, avatar_url, created_at`,
        [name, email, password_hash]
    );

    const user = rows[0];
    const companies = await getUserCompanies(user.id);
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    res.status(201).json({ user: { ...publicuser(user), companies }, token });
});

const login = asyncHandler(async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) throw ApiError.badRequest("Email and password are required");

    const attempt = loginAttempts.get(email);
    if (attempt && attempt.lockedUntil > Date.now()) {
        const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
        throw ApiError.forbidden(`Account locked. Try again in ${remaining} minute(s)`);
    }

    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user) throw ApiError.unauthorized("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        const current = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
        current.count += 1;
        if (current.count >= MAX_LOGIN_ATTEMPTS) {
            current.lockedUntil = Date.now() + LOCKOUT_TIME;
            current.count = 0;
        }
        loginAttempts.set(email, current);
        throw ApiError.unauthorized("Invalid email or password");
    }

    loginAttempts.delete(email);

    const companies = await getUserCompanies(user.id);
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    res.json({ user: { ...publicuser(user), companies }, token });
});

const me = asyncHandler(async (req, res) => {
    const { rows } = await query(
        "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1",
        [req.user.id]
    );
    if (!rows.length) throw ApiError.notFound("User not found");

    const companies = await getUserCompanies(req.user.id);

    res.json({ user: { ...rows[0], companies } });
});

const updateProfile = asyncHandler(async (req, res) => {
    const name = (req.body.name || "").trim();
    if (!name) throw ApiError.badRequest("Name is required");

    const { rows } = await query(
        "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, avatar_url, created_at",
        [name, req.user.id]
    );
    if (!rows.length) throw ApiError.notFound("User not found");

    const companies = await getUserCompanies(req.user.id);
    res.json({ user: { ...rows[0], companies } });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) throw ApiError.badRequest("Email is required");

    const { rows } = await query("SELECT id, name FROM users WHERE email = $1", [email]);
    if (!rows.length) {
        res.json({ message: "If that email exists, a reset link has been sent." });
        return;
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await query(
        "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, token, expiresAt.toISOString()]
    );

    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const link = `${baseUrl}/reset-password/${token}`;

    res.json({ message: "If that email exists, a reset link has been sent." });

    sendMail({
        to: email,
        subject: "Reset your FlowUpBoard password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h2 style="color: #1a1a2e; margin-bottom: 16px;">Reset your password</h2>
                <p style="color: #555; line-height: 1.6;">
                    Hi ${user.name}, we received a request to reset your password.
                </p>
                <a href="${link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                    Reset Password
                </a>
                <p style="color: #999; font-size: 12px; margin-top: 24px;">
                    This link expires in 1 hour. If you didn't request this, ignore this email.
                </p>
            </div>
        `,
    }).catch((err) => console.error("Password reset email failed:", err.message));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) throw ApiError.badRequest("Token and password are required");
    if (password.length < 6) throw ApiError.badRequest("Password must be at least 6 characters long");

    const { rows } = await query(
        "SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > now()",
        [token]
    );

    if (!rows.length) throw ApiError.badRequest("Invalid or expired reset token");

    const reset = rows[0];
    const password_hash = await bcrypt.hash(password, 10);

    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [password_hash, reset.user_id]);
    await query("UPDATE password_resets SET used = true WHERE id = $1", [reset.id]);

    res.json({ message: "Password has been reset successfully" });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) throw ApiError.badRequest("Current and new password are required");
    if (!newPassword || !PASSWORD_REGEX.test(newPassword)) throw ApiError.badRequest("New password must be at least 6 characters with uppercase, lowercase, and a number");

    const { rows } = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    if (!rows.length) throw ApiError.notFound("User not found");

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) throw ApiError.unauthorized("Current password is incorrect");

    const password_hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [password_hash, req.user.id]);

    res.json({ message: "Password changed successfully" });
});

const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) throw ApiError.badRequest("Password is required to delete account");

    const { rows } = await query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (!rows.length) throw ApiError.notFound("User not found");

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw ApiError.unauthorized("Incorrect password");

    await query(
        "INSERT INTO deleted_accounts (original_id, name, email, password_hash, avatar_url, original_created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (original_id) DO NOTHING",
        [user.id, user.name, user.email, user.password_hash, user.avatar_url, user.created_at]
    );

    await query("DELETE FROM users WHERE id = $1", [user.id]);

    res.json({ message: "Account deleted successfully" });
});

module.exports = { register, login, me, updateProfile, forgotPassword, resetPassword, changePassword, deleteAccount };