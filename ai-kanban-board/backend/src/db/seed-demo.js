require("dotenv").config({ path: "C:/Users/rajes/project1/ai-kanban-board/backend/.env" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const USER_ID = "51f4d407-5488-4aee-b365-8f1e3f2f014a";
const COMPANY_ID = "8c784a8d-7773-4fc0-911b-c50baf496d33";

const BOARDS = [
  { title: "Product Roadmap Q3", description: "High-level product priorities for Q3 2026", color: "#6366f1" },
  { title: "Website Redesign", description: "Marketing site refresh — new landing pages and brand", color: "#f59e0b" },
  { title: "Mobile App v2", description: "React Native app overhaul with new onboarding flow", color: "#10b981" },
];

const COLUMNS = ["Todo", "In Progress", "Review", "Done"];

const TASKS = {
  0: [
    { title: "Define Q3 OKRs", desc: "Set measurable goals for the quarter", priority: "high", col: 3 },
    { title: "Competitor analysis report", desc: "Research top 5 competitors and document findings", priority: "medium", col: 2 },
    { title: "User interviews — 10 sessions", desc: "Schedule and conduct user discovery calls", priority: "high", col: 1 },
    { title: "Design system audit", desc: "Review existing components for consistency", priority: "low", col: 0 },
    { title: "API rate limiting", desc: "Implement throttling on public endpoints", priority: "medium", col: 0 },
    { title: "Write migration plan for DB v3", desc: "Document schema changes and rollback strategy", priority: "high", col: 0 },
  ],
  1: [
    { title: "Hero section mockup", desc: "Figma designs for the new hero area", priority: "high", col: 3 },
    { title: "Copywriting — feature section", desc: "Write persuasive copy for 6 feature cards", priority: "medium", col: 2 },
    { title: "Responsive navbar rebuild", desc: "Mobile hamburger menu + sticky header", priority: "high", col: 1 },
    { title: "SEO meta tags", desc: "Add OpenGraph and Twitter card meta", priority: "low", col: 0 },
    { title: "Performance audit — Lighthouse", desc: "Aim for 95+ on all categories", priority: "medium", col: 0 },
  ],
  2: [
    { title: "Onboarding screens — UI", desc: "Design 4-step walkthrough screens", priority: "high", col: 3 },
    { title: "Push notification setup", desc: "Firebase integration for iOS and Android", priority: "high", col: 1 },
    { title: "Biometric auth", desc: "FaceID / fingerprint login support", priority: "medium", col: 0 },
    { title: "Crash reporting — Sentry", desc: "Integrate Sentry SDK and source maps", priority: "low", col: 0 },
    { title: "App Store screenshots", desc: "Generate screenshots for 6.7\" and 6.1\" displays", priority: "medium", col: 2 },
    { title: "Offline mode — local cache", desc: "Persist board data with SQLite for offline use", priority: "high", col: 0 },
    { title: "Dark mode toggle", desc: "System-aware theme switching", priority: "low", col: 1 },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (let bi = 0; bi < BOARDS.length; bi++) {
      const b = BOARDS[bi];
      const { rows: [board] } = await client.query(
        "INSERT INTO boards (title, description, color, owner_id, company_id) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        [b.title, b.description, b.color, USER_ID, COMPANY_ID]
      );
      await client.query(
        "INSERT INTO board_members (board_id, user_id, role) VALUES ($1,$2,'owner')",
        [board.id, USER_ID]
      );

      const colIds = [];
      for (let ci = 0; ci < COLUMNS.length; ci++) {
        const { rows: [col] } = await client.query(
          "INSERT INTO columns (board_id, title, position) VALUES ($1,$2,$3) RETURNING id",
          [board.id, COLUMNS[ci], (ci + 1) * 1000]
        );
        colIds.push(col.id);
      }

      const tasks = TASKS[bi] || [];
      for (let ti = 0; ti < tasks.length; ti++) {
        const t = tasks[ti];
        await client.query(
          "INSERT INTO tasks (board_id, column_id, title, description, priority, position, assignee_id, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
          [board.id, colIds[t.col], t.title, t.desc, t.priority, (ti + 1) * 1000, USER_ID, USER_ID]
        );
      }

      console.log(`  Board "${b.title}" — ${tasks.length} tasks`);
    }

    await client.query("COMMIT");
    console.log("\nDone! Seeded 3 boards with tasks.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
