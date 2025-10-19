-- Migration: 20241012000500_create_audit_and_points.sql

-- Metadata
-- Description: Creates audit log and points tracking tables
-- Tables: chore_status_log, points_events
-- Dependencies: daily_chores, profiles

create table public.chore_status_log (
  id bigserial primary key,
  daily_chore_id uuid not null references daily_chores(id),
  changed_by_user_id uuid not null references profiles(id),
  previous_status chore_status,
  new_status chore_status,
  previous_assignee_id uuid,
  new_assignee_id uuid,
  points_delta integer,
  created_at timestamptz not null default now()
);

comment on table chore_status_log is 'Audit log for chore status and assignee changes';

-- enable rls
alter table chore_status_log enable row level security;

create table public.points_events (
  id bigserial primary key,
  user_id uuid not null references profiles(id),
  daily_chore_id uuid references daily_chores(id),
  points integer not null,
  event_type points_event_type not null,
  created_at timestamptz not null default now()
);

comment on table points_events is 'Tracks point awards and deductions';

-- enable rls
alter table points_events enable row level security;

-- indexes
create index idx_status_log_chore on chore_status_log(daily_chore_id);
create index idx_points_events_user on points_events(user_id);

-- rls policies for audit log
create policy "Members can view their household logs"
  on chore_status_log for select
  using (
    daily_chore_id in (
      select id from daily_chores 
      where household_id in (select household_id from current_user_household_members)
    )
  );

-- rls policies for points
create policy "Users can view their points"
  on points_events for select
  using (user_id = auth.uid());

create policy "System can manage points"
  on points_events for insert
  with check (auth.uid() in (select user_id from current_user_household_members));




