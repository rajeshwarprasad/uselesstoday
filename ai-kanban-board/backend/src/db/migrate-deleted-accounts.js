const { query } = require("../config/db");

const SQL = `
create table if not exists deleted_accounts (
    id uuid primary key default gen_random_uuid(),
    original_id uuid not null unique,
    name text not null,
    email text not null,
    password_hash text not null,
    avatar_url text,
    original_created_at timestamptz not null,
    deleted_at timestamptz not null default now()
);

create index if not exists idx_deleted_accounts_email on deleted_accounts(email);
`;

(async () => {
    try {
        await query(SQL);
        console.log("deleted_accounts table created");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        process.exit();
    }
})();
