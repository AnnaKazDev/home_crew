create table if not exists public.daily_chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  date date not null,
  chore_catalog_id uuid not null,
  assignee_id uuid,
  time_of_day text not null default 'any',
  status text not null default 'todo',
  points smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
