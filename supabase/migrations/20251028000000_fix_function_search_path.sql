-- Migration: 20251028000000_fix_function_search_path.sql
-- Description: Fix search_path in functions to allow them to access tables

-- Fix check_daily_chores_limit function
CREATE OR REPLACE FUNCTION "public"."check_daily_chores_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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

-- Fix check_household_members_limit function
CREATE OR REPLACE FUNCTION "public"."check_household_members_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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

-- Fix award_points_on_chore_completion function
CREATE OR REPLACE FUNCTION "public"."award_points_on_chore_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Only process when status changes to 'done' and assignee exists
  if new.status = 'done' and old.status != 'done' and new.assignee_id is not null then
    -- Insert points event for the completed chore
    insert into points_events (user_id, daily_chore_id, points, event_type)
    values (new.assignee_id, new.id, new.points, 'add');
  end if;

  return new;
end;
$$;
