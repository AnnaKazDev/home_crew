-- Migration: 20241012000200_create_households.sql

-- Metadata
-- Description: Creates households and household_members tables
-- Tables: households, household_members
-- Dependencies: profiles table, household_role type

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin_hash char(60) not null,
  pin_expires_at timestamptz,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

comment on table households is 'Stores household data with PIN for member invites';

-- enable rls
alter table households enable row level security;

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role household_role not null default 'member',
  joined_at timestamptz not null default now(),
  constraint unique_user_household unique (user_id)
);

comment on table household_members is 'Links users to households with roles';

-- enable rls
alter table household_members enable row level security;

-- create helper view for rls
create view current_user_household_members as
  select hm.* 
  from household_members hm
  where hm.user_id = auth.uid();

-- household member limit trigger
create function check_household_members_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) 
    from household_members 
    where household_id = new.household_id
  ) >= 10 then
    raise exception 'Household member limit (10) exceeded';
  end if;
  return new;
end;
$$;

create trigger enforce_household_members_limit
  before insert on household_members
  for each row execute function check_household_members_limit();

-- indexes
create index idx_households_pin_hash on households(pin_hash);
create index idx_members_household on household_members(household_id);

-- rls policies
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


