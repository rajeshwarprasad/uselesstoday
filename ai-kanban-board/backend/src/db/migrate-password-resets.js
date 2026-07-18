require("dotenv").config();
const { pool } = require("../config/db");

const sql = `
CREATE TABLE IF NOT EXISTS password_resets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    used boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
`;

(async () => {
    try {
        await pool.query(sql);
        console.log("password_resets table created.");
    } catch (err) {
        console.error("Failed:", err.message);
    } finally {
        await pool.end();
    }
})();
