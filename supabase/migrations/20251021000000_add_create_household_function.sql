-- Migration: 20251021000000_add_create_household_function.sql

-- Metadata
-- Description: Adds RPC function to create household with admin in a transaction
-- Functions: create_household_with_admin
-- Dependencies: households and household_members tables

-- Create function to create household with admin in a single transaction
create or replace function create_household_with_admin(
  p_name text,
  p_pin char(6),
  p_user_id uuid
)
returns table (
  id uuid,
  name text,
  current_pin char(6)
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_household_id uuid;
begin
  -- Check if user already belongs to a household
  if exists (
    select 1 from household_members
    where user_id = p_user_id
  ) then
    raise exception 'User already belongs to a household';
  end if;

  -- Check if PIN is already taken
  if exists (
    select 1 from households
    where current_pin = p_pin
  ) then
    raise exception 'PIN already taken';
  end if;

  -- Create household
  insert into households (name, current_pin)
  values (p_name, p_pin)
  returning id into v_household_id;

  -- Add user as admin
  insert into household_members (household_id, user_id, role)
  values (v_household_id, p_user_id, 'admin');

  -- Return household data
  return query
  select h.id, h.name, h.current_pin
  from households h
  where h.id = v_household_id;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function create_household_with_admin(text, char(6), uuid) to authenticated;

