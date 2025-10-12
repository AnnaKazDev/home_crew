-- Migration: 20241012000400_create_daily_chores.sql

-- Metadata
-- Description: Creates daily_chores table for tracking daily task assignments and status
-- Tables: daily_chores
-- Dependencies: households, chores_catalog, profiles, chore_status

create table public.daily_chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  date date not null,
  chore_catalog_id uuid not null references chores_catalog(id),
  assignee_id uuid references profiles(id),
  time_of_day time_of_day_type not null default 'any',
  status chore_status not null default 'todo',
  points smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  -- ensure unique task/day/assignee/time combination
  constraint unique_daily_chore unique (household_id, date, chore_catalog_id, assignee_id, time_of_day)
);

comment on table daily_chores is 'Tracks daily household tasks and their status';

-- enable rls
alter table daily_chores enable row level security;

-- daily limit trigger
create function check_daily_chores_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  if (
    select count(*) 
    from daily_chores
    where household_id = new.household_id 
    and date = new.date 
    and deleted_at is null
  ) >= 50 then
    raise exception 'Daily chores limit (50) exceeded for this household';
  end if;
  return new;
end;
$$;

create trigger enforce_daily_chores_limit
  before insert on daily_chores
  for each row execute function check_daily_chores_limit();

-- restrict editable fields trigger
create function restrict_daily_chores_edit()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.household_id != old.household_id or
     new.date != old.date or
     new.chore_catalog_id != old.chore_catalog_id or
     new.time_of_day != old.time_of_day or
     new.points != old.points then
    raise exception 'Only status, assignee, and timestamps can be modified';
  end if;
  return new;
end;
$$;

create trigger enforce_daily_chores_edit
  before update on daily_chores
  for each row execute function restrict_daily_chores_edit();

-- indexes
create index idx_daily_chores_household_date on daily_chores(household_id, date);
create index idx_daily_chores_assignee_status on daily_chores(assignee_id, status);

-- rls policies
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


