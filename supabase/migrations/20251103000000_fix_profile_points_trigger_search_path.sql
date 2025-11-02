-- Migration: 20251103000000_fix_profile_points_trigger_search_path.sql
-- Description: Fix search_path in update_profile_total_points function

-- Fix update_profile_total_points function
CREATE OR REPLACE FUNCTION "public"."update_profile_total_points"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Update the profile's total_points by summing all points_events for the user
  update profiles
  set total_points = (
    select coalesce(sum(points), 0)
    from points_events
    where user_id = coalesce(new.user_id, old.user_id)
  )
  where id = coalesce(new.user_id, old.user_id);

  return coalesce(new, old);
end;
$$;
