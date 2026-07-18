require("dotenv").config();
const { pool } = require("../config/db");

(async () => {
    try {
        console.log("Applying company migration...");

        // companies table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id uuid primary key default gen_random_uuid(),
                name text not null,
                slug text not null unique,
                description text,
                logo_url text,
                created_by uuid not null references users(id) on delete cascade,
                created_at timestamptz not null default now(),
                updated_at timestamptz not null default now()
            );
        `);
        console.log("  ✓ companies");

        // company_members table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS company_members (
                company_id uuid not null references companies(id) on delete cascade,
                user_id uuid not null references users(id) on delete cascade,
                role text not null default 'member',
                joined_at timestamptz not null default now(),
                primary key (company_id, user_id)
            );
        `);
        console.log("  ✓ company_members");

        // company_invites table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS company_invites (
                id uuid primary key default gen_random_uuid(),
                company_id uuid not null references companies(id) on delete cascade,
                token text not null unique,
                role text not null default 'member',
                created_by uuid not null references users(id) on delete cascade,
                expires_at timestamptz,
                created_at timestamptz not null default now()
            );
        `);
        console.log("  ✓ company_invites");

        // Add company_id column to boards (if not exists)
        const colCheck = await pool.query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'boards' AND column_name = 'company_id'
        `);
        if (colCheck.rows.length === 0) {
            await pool.query(`ALTER TABLE boards ADD COLUMN company_id uuid references companies(id) on delete cascade;`);
            console.log("  ✓ boards.company_id added");
        } else {
            console.log("  - boards.company_id already exists");
        }

        // Indexes
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members(user_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_company_invites_token ON company_invites(token);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_company_invites_company ON company_invites(company_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_boards_company ON boards(company_id);`);
        console.log("  ✓ indexes");

        // Backfill: create a default company for existing boards that have no company_id
        const orphanBoards = await pool.query(
            "SELECT COUNT(*) AS cnt FROM boards WHERE company_id IS NULL"
        );
        if (parseInt(orphanBoards.rows[0].cnt, 10) > 0) {
            console.log(`  → ${orphanBoards.rows[0].cnt} board(s) with no company, creating default company…`);
            // Pick the first admin user to own the default company
            const adminUser = await pool.query(
                "SELECT id FROM users ORDER BY created_at ASC LIMIT 1"
            );
            if (adminUser.rows.length) {
                const adminId = adminUser.rows[0].id;
                const { rows } = await pool.query(
                    "INSERT INTO companies (name, slug, description, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
                    ["My Company", "my-company-" + Date.now(), "Auto-created for existing boards", adminId]
                );
                const defaultCompanyId = rows[0].id;
                await pool.query(
                    "INSERT INTO company_members (company_id, user_id, role) VALUES ($1, $2, 'owner')" +
                    " ON CONFLICT DO NOTHING",
                    [defaultCompanyId, adminId]
                );
                // Assign all orphan boards to this company
                await pool.query(
                    "UPDATE boards SET company_id = $1 WHERE company_id IS NULL",
                    [defaultCompanyId]
                );
                console.log(`  ✓ assigned all boards to default company ${defaultCompanyId}`);
            }
        } else {
            console.log("  - no orphan boards to backfill");
        }

        console.log("Company migration applied successfully.");
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
