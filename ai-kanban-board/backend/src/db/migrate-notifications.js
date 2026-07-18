require("dotenv").config();
const { pool } = require("../config/db");

(async () => {
    try {
        console.log("Applying notifications migration...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id uuid primary key default gen_random_uuid(),
                user_id uuid not null references users(id) on delete cascade,
                type text not null,
                title text not null,
                message text,
                board_id uuid references boards(id) on delete cascade,
                task_id uuid,
                is_read boolean not null default false,
                created_at timestamptz not null default now()
            );
        `);
        console.log("  ✓ notifications table");

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at desc);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;`);
        console.log("  ✓ indexes");

        console.log("Notifications migration applied successfully.");
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
