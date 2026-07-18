# AI Kanban Board

A full-stack Kanban board application with AI-powered task generation, real-time collaboration, multi-company workspaces, and invite-based team management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) |
| Real-time | Socket.IO |
| AI | Google Gemini API |
| Auth | JWT (bcryptjs) |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |

## Features

### Core
- User registration & login (JWT auth)
- Multi-company workspaces — switch between companies
- Board creation with custom colors (12-color palette)
- Drag-and-drop Kanban columns & task reordering
- Task management (CRUD, priority, assignee, start date, due date)
- Column owner-only CRUD — only board owner can create/delete columns
- Default columns protected from deletion

### AI-Powered
- AI task generation from project goals
- AI task breakdown into subtasks
- AI board summary

### Collaboration
- Real-time collaboration (Socket.IO)
- Shareable invite links with inline signup for new users
- Board & company member management
- Activity feed

### Views & Print
- Calendar view showing tasks on start & due dates
- Print board — printer button in topbar, landscape layout, all tasks flow across multiple pages

### Settings & Profile
- Edit user name inline in Settings page
- Company rename (name & description)
- Reduce motion preference
- Command menu (⌘K)

---

## Local Development Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database (Neon, Supabase, or local)

### 1. Clone & install

```bash
git clone https://github.com/rajeshwarprasad/Kanban-local.git
cd Kanban-local

# Backend
cd backend
npm install

# Frontend
cd ../frontend/ai-kanban-board-ui-boilerplate-code
npm install
```

### 2. Environment variables

**Backend `.env`** (create `backend/.env`):

```env
PORT=5050
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://user:password@host/database?sslmode=require

JWT_SECRET=your-random-64-char-hex-string
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest
```

**Frontend `.env`** (create `frontend/ai-kanban-board-ui-boilerplate-code/.env`):

```env
VITE_API_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050
```

### 3. Database setup

Run `backend/src/db/schema.sql` against your PostgreSQL database to create all tables.

### 4. Start servers

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend/ai-kanban-board-ui-boilerplate-code
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5050

---

## Deploy to Cloudflare

### Frontend → Cloudflare Pages

1. Push code to GitHub

2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)

3. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

4. Select your GitHub repo `rajeshwarprasad/Kanban-local`

5. Configure build:
   - **Framework preset:** Vite
   - **Build command:** `cd frontend/ai-kanban-board-ui-boilerplate-code && npm install && npm run build`
   - **Build output directory:** `frontend/ai-kanban-board-ui-boilerplate-code/dist`

6. Add environment variables in Pages → Settings → Environment variables:
   ```
   VITE_API_URL = https://your-backend-url.workers.dev/api
   VITE_SOCKET_URL = https://your-backend-url.workers.dev
   ```

7. Deploy. Your frontend will be live at `https://kanbanboard.pages.dev`

### Backend → Render.com (recommended, easiest)

1. Go to [Render.com](https://render.com) and sign up

2. **New** → **Web Service** → Connect GitHub repo

3. Configure:
   - **Name:** `kanbanboard-api`
   - **Runtime:** Node
   - **Build command:** `cd backend && npm install`
   - **Start command:** `cd backend && node index.js`

4. Add environment variables in Render dashboard:
   ```
   NODE_ENV=production
   CLIENT_URL=https://kanbanboard.pages.dev
   DATABASE_URL=your-neon-connection-string
   JWT_SECRET=your-random-hex-string
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-flash-latest
   ```

5. Deploy. Backend will be live at `https://kanbanboard-api.onrender.com`

6. Update frontend `VITE_API_URL` and `VITE_SOCKET_URL` to point to this URL

### Backend → Cloudflare Workers (advanced)

> Requires rewriting Express to Hono framework. Not covered here.

Steps:
1. Replace Express with [Hono](https://hono.dev)
2. Replace PostgreSQL with Cloudflare D1 or use Hyperdrive with Neon
3. Replace Socket.IO with Durable Objects + native WebSocket
4. Create `wrangler.toml` config
5. Deploy with `npx wrangler deploy`

### Database → Neon (keep as-is)

Neon PostgreSQL works from any hosting provider. No migration needed.

1. Ensure your Neon project is active
2. Copy the connection string to your backend's `DATABASE_URL` env var
3. Run `schema.sql` once to create tables

---

## API Endpoints

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| PUT | `/api/auth/me` | Yes | Update profile (name) |

### Companies
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/companies` | Yes | List user's companies |
| POST | `/api/companies` | Yes | Create company |
| GET | `/api/companies/:id` | Yes | Get company |
| PUT | `/api/companies/:id` | Yes | Update company (owner/admin) |
| DELETE | `/api/companies/:id` | Yes | Delete company (owner) |
| GET | `/api/companies/:id/members` | Yes | List company members |
| POST | `/api/companies/:id/members` | Yes | Add company member |
| DELETE | `/api/companies/:id/members/:userId` | Yes | Remove company member |
| GET | `/api/companies/:id/invites` | Yes | List company invites |
| POST | `/api/companies/:id/invites` | Yes | Generate company invite |
| DELETE | `/api/companies/:id/invites/:inviteId` | Yes | Delete company invite |

### Boards
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/boards` | Yes | List boards |
| POST | `/api/boards` | Yes | Create board |
| GET | `/api/boards/:id` | Yes | Get board |
| PATCH | `/api/boards/:id` | Yes | Update board (owner) |
| DELETE | `/api/boards/:id` | Yes | Delete board |
| GET | `/api/boards/:id/activity` | Yes | Activity feed |

### Board Members & Invites
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/boards/:id/members` | Yes | Add member |
| DELETE | `/api/boards/:id/members/:userId` | Yes | Remove member |
| POST | `/api/boards/:id/invites` | Yes | Generate invite link |
| GET | `/api/boards/:id/invites` | Yes | List invite links |
| DELETE | `/api/boards/:id/invites/:inviteId` | Yes | Delete invite |
| GET | `/api/invite/:token` | No | Get invite info |
| POST | `/api/invite/:token/accept` | Yes | Accept invite (auto-creates account for new users) |

### Columns
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/boards/:id/columns` | Yes | Create column (owner only) |
| PATCH | `/api/boards/:id/columns/:colId` | Yes | Update column |
| DELETE | `/api/boards/:id/columns/:colId` | Yes | Delete column (owner only, default 4 protected) |

### Tasks
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/boards/:id/tasks` | Yes | List tasks |
| POST | `/api/boards/:id/tasks` | Yes | Create task (auto-sets start_date) |
| PATCH | `/api/boards/:id/tasks/:taskId` | Yes | Update task |
| PATCH | `/api/boards/:id/tasks/:taskId/move` | Yes | Move task |
| DELETE | `/api/boards/:id/tasks/:taskId` | Yes | Delete task |

### AI
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/boards/:id/ai/generate-tasks` | Yes | AI generate tasks from goal |
| POST | `/api/boards/:id/ai/breakdown` | Yes | AI breakdown task into subtasks |
| POST | `/api/boards/:id/ai/summary` | Yes | AI board summary |

### Users
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/users/search` | Yes | Search users by name/email |

## Database Schema

Tables: `users`, `companies`, `company_members`, `company_invites`, `boards`, `board_members`, `columns`, `tasks`, `activities`, `board_invites`

See `backend/src/db/schema.sql` for full schema.
