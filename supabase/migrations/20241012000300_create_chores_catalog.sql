-- Migration: 20241012000300_create_chores_catalog.sql

-- Metadata
-- Description: Creates chores_catalog table for predefined and custom household tasks
-- Tables: chores_catalog
-- Dependencies: households, profiles, time_of_day_type

create table public.chores_catalog (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  title text not null check (char_length(title) <= 50),
  emoji text,
  time_of_day time_of_day_type not null default 'any',
  category text not null,
  points smallint not null check (points between 0 and 100 and points % 5 = 0),
  predefined boolean not null default false,
  created_by_user_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table chores_catalog is 'Stores predefined and custom household tasks';

-- enable rls
alter table chores_catalog enable row level security;

-- indexes
create index idx_catalog_household_predefined on chores_catalog(household_id, predefined);
create unique index idx_catalog_household_title_unique on chores_catalog(household_id, lower(title));

-- rls policies
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