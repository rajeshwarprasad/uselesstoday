const { query } = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

const getNotifications = asyncHandler(async (req, res) => {
    const { rows } = await query(
        `SELECT n.*, b.title AS board_title
         FROM notifications n
         LEFT JOIN boards b ON b.id = n.board_id
         WHERE n.user_id = $1
         ORDER BY n.created_at DESC
         LIMIT 50`,
        [req.user.id]
    );
    res.json({ notifications: rows });
});

const markRead = asyncHandler(async (req, res) => {
    await query(
        "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
        [req.params.id, req.user.id]
    );
    res.json({ success: true });
});

const markAllRead = asyncHandler(async (req, res) => {
    await query(
        "UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false",
        [req.user.id]
    );
    res.json({ success: true });
});

const checkDueDates = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find tasks due within 7 days that haven't been notified yet today
    const { rows: dueTasks } = await query(
        `SELECT t.id, t.title, t.due_date, b.id AS board_id, b.title AS board_title, c.title AS column_title
         FROM tasks t
         JOIN boards b ON b.id = t.board_id
         JOIN columns c ON c.id = t.column_id
         LEFT JOIN board_members bm ON bm.board_id = b.id
         WHERE t.due_date IS NOT NULL
           AND t.due_date <= now() + interval '7 days'
           AND t.due_date >= now()
           AND (bm.user_id = $1 OR b.owner_id = $1)
           AND NOT EXISTS (
               SELECT 1 FROM notifications n
               WHERE n.user_id = $1 AND n.task_id = t.id AND n.type = 'due_soon'
                 AND n.created_at > now() - interval '1 day'
           )
         ORDER BY t.due_date ASC`,
        [userId]
    );

    for (const t of dueTasks) {
        const daysLeft = Math.ceil((new Date(t.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        await query(
            `INSERT INTO notifications (user_id, type, title, message, board_id, task_id)
             VALUES ($1, 'due_soon', $2, $3, $4, $5)`,
            [
                userId,
                `Task due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
                `"${t.title}" in ${t.column_title} — board "${t.board_title}"`,
                t.board_id,
                t.id,
            ]
        );
    }

    // Find tasks with start_date > 15 days ago that haven't moved (still in same column)
    const { rows: staleTasks } = await query(
        `SELECT t.id, t.title, t.start_date, t.column_id, b.id AS board_id, b.title AS board_title, c.title AS column_title
         FROM tasks t
         JOIN boards b ON b.id = t.board_id
         JOIN columns c ON c.id = t.column_id
         LEFT JOIN board_members bm ON bm.board_id = b.id
         WHERE t.start_date IS NOT NULL
           AND t.start_date < now() - interval '15 days'
           AND (bm.user_id = $1 OR b.owner_id = $1)
           AND NOT EXISTS (
               SELECT 1 FROM notifications n
               WHERE n.user_id = $1 AND n.task_id = t.id AND n.type = 'stale_task'
                 AND n.created_at > now() - interval '1 day'
           )
         ORDER BY t.start_date ASC`,
        [userId]
    );

    for (const t of staleTasks) {
        const daysSince = Math.floor((new Date() - new Date(t.start_date)) / (1000 * 60 * 60 * 24));
        await query(
            `INSERT INTO notifications (user_id, type, title, message, board_id, task_id)
             VALUES ($1, 'stale_task', $2, $3, $4, $5)`,
            [
                userId,
                `Task stale for ${daysSince} days`,
                `"${t.title}" is still in ${t.column_title} — board "${t.board_title}"`,
                t.board_id,
                t.id,
            ]
        );
    }

    res.json({ due: dueTasks.length, stale: staleTasks.length });
});

const createNotification = async (userId, { type, title, message, boardId, taskId }) => {
    const { rows } = await query(
        `INSERT INTO notifications (user_id, type, title, message, board_id, task_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, type, title, message || null, boardId || null, taskId || null]
    );
    return rows[0];
};

module.exports = { getNotifications, markRead, markAllRead, checkDueDates, createNotification };
