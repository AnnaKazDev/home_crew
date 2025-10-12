-- Migration: 20241014000000_reenable_rls_for_production.sql

-- Description: Re-enables Row Level Security and recreates all policies for production
-- This migration restores security policies after development work

-- Re-enable RLS on all tables

-- profiles table
alter table profiles enable row level security;

create policy "Profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- households table
alter table households enable row level security;

create policy "Users can view their household"
  on households for select
  using (id in (select household_id from current_user_household_members));

create policy "Admin can manage household"
  on households for all
  using (id in (
    select household_id
    from current_user_household_members
    where role = 'admin'
  ));

-- household_members table
alter table household_members enable row level security;

-- chores_catalog table
alter table chores_catalog enable row level security;

create policy "Public predefined tasks are viewable by everyone"
  on chores_catalog for select
  using (predefined = true and household_id is null);

create policy "Household members can view their household tasks"
  on chores_catalog for select
  using (household_id in (select household_id from current_user_household_members));

create policy "Household members can create custom tasks"
  on chores_catalog for insert
  with check (
    household_id in (select household_id from current_user_household_members)
    and created_by_user_id = auth.uid()
  );

create policy "Task creator or admin can manage tasks"
  on chores_catalog for all
  using (
    household_id in (
      select household_id
      from current_user_household_members
      where role = 'admin' or auth.uid() = created_by_user_id
    )
  );

-- daily_chores table
alter table daily_chores enable row level security;

create policy "Members can view household chores"
  on daily_chores for select
  using (household_id in (select household_id from current_user_household_members));

create policy "Members can create chores"
  on daily_chores for insert
  with check (household_id in (select household_id from current_user_household_members));

create policy "Assignee or admin can update chores"
  on daily_chores for update
  using (
    household_id in (
      select household_id
      from current_user_household_members
      where role = 'admin' or auth.uid() = assignee_id
    )
  );

-- audit_logs table (chore_status_log)
alter table chore_status_log enable row level security;

create policy "Members can view their household logs"
  on chore_status_log for select
  using (
    daily_chore_id in (
      select id from daily_chores
      where household_id in (select household_id from current_user_household_members)
    )
  );

-- points table (points_events)
alter table points_events enable row level security;

create policy "Users can view their points"
  on points_events for select
  using (user_id = auth.uid());

create policy "System can manage points"
  on points_events for insert
  with check (auth.uid() in (select user_id from current_user_household_members));
