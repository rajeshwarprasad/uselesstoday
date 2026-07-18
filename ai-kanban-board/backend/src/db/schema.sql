CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── Users ──────────────────────────────────────────────────────────────────
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    password_hash text not null,
    avatar_url text,
    created_at timestamptz not null default now()
);

-- ── Companies (multi-tenant organisations) ──────────────────────────────────
create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text,
    logo_url text,
    created_by uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists company_members (
    company_id uuid not null references companies(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role text not null default 'member',  -- owner | admin | member
    joined_at timestamptz not null default now(),
    primary key (company_id, user_id)
);

create table if not exists company_invites (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    token text not null unique,
    role text not null default 'member',
    created_by uuid not null references users(id) on delete cascade,
    expires_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_companies_slug on companies(slug);
create index if not exists idx_company_members_user on company_members(user_id);
create index if not exists idx_company_invites_token on company_invites(token);
create index if not exists idx_company_invites_company on company_invites(company_id);

-- ── Boards (now scoped to a company) ───────────────────────────────────────
create table if not exists boards (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    color text default '#6366F9',
    owner_id uuid not null references users(id) on delete cascade,
    company_id uuid not null references companies(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists board_members (
    board_id uuid not null references boards(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role text not null default 'member',
    joined_at timestamptz not null default now(),
    primary key (board_id, user_id)
);

-- ── Columns ────────────────────────────────────────────────────────────────
create table if not exists columns (
    id uuid primary key default gen_random_uuid(),
    board_id uuid not null references boards(id) on delete cascade,
    title text not null,
    position double precision not null default 1000,
    created_at timestamptz not null default now()
);

-- ── Tasks ──────────────────────────────────────────────────────────────────
create table if not exists tasks (
    id uuid primary key default gen_random_uuid(),
    board_id uuid not null references boards(id) on delete cascade,
    column_id uuid not null references columns(id) on delete cascade,
    title text not null,
    description text,
    priority text not null default 'medium',
    start_date timestamptz,
    due_date timestamptz,
    assignee_id uuid references users(id) on delete set null,
    position double precision not null default 1000,
    created_by uuid not null references users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ── Activities ─────────────────────────────────────────────────────────────
create table if not exists activities (
    id uuid primary key default gen_random_uuid(),
    board_id uuid not null references boards(id) on delete cascade,
    user_id uuid references users(id) on delete set null,
    action text not null,
    message text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_boards_owner on boards(owner_id);
create index if not exists idx_boards_company on boards(company_id);
create index if not exists idx_columns_board on columns(board_id);
create index if not exists idx_tasks_board on tasks(board_id);
create index if not exists idx_tasks_column on tasks(column_id);
create index if not exists idx_tasks_assignee on tasks(assignee_id);
create index if not exists idx_members_user on board_members(user_id);
create index if not exists idx_activities_board on activities(board_id, created_at desc);

-- ── Board invites (kept for backward-compat, but company invites preferred) ─
create table if not exists board_invites (
    id uuid primary key default gen_random_uuid(),
    board_id uuid not null references boards(id) on delete cascade,
    token text not null unique,
    role text not null default 'member',
    created_by uuid not null references users(id) on delete cascade,
    expires_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_invites_token on board_invites(token);
create index if not exists idx_invites_board on board_invites(board_id);

-- ── Notifications ────────────────────────────────────────────────────────
create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    type text not null,          -- due_soon | stale_task | task_edited
    title text not null,
    message text,
    board_id uuid references boards(id) on delete cascade,
    task_id uuid,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id, is_read) WHERE is_read = false;

-- ── Password resets ──────────────────────────────────────────────────────
create table if not exists password_resets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    token text not null unique,
    expires_at timestamptz not null,
    used boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_password_resets_token on password_resets(token);
create index if not exists idx_password_resets_user on password_resets(user_id);

-- ── Deleted accounts (soft archive before hard delete) ────────────────────
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
