-- Migration: 20251019030000_fix_household_members_trigger.sql
-- Description: Qualify household_members table in check_household_members_limit function to avoid 42P01 under empty search_path

-- Replace function with fully qualified table reference
create or replace function public.check_household_members_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.household_members            -- fully qualified table name
    where household_id = new.household_id
  ) >= 10 then
    raise exception 'Household member limit (10) exceeded';
  end if;
  return new;
end;
$$;
