-- Migration: 20251104000000_add_task_date_to_points_events.sql
-- Description: Add task_date column to points_events to track when tasks were scheduled vs when completed

-- Add task_date column to points_events
ALTER TABLE points_events ADD COLUMN task_date date;

-- Update existing records to set task_date based on the daily_chore date
UPDATE points_events
SET task_date = daily_chores.date
FROM daily_chores
WHERE points_events.daily_chore_id = daily_chores.id;

-- Make task_date not null after populating existing data
ALTER TABLE points_events ALTER COLUMN task_date SET NOT NULL;

-- Update the trigger to use task_date instead of created_at for when points were earned
CREATE OR REPLACE FUNCTION "public"."award_points_on_chore_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Only process when status changes to 'done' and assignee exists
  if new.status = 'done' and old.status != 'done' and new.assignee_id is not null then
    -- Insert points event for the completed chore with task_date
    insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
    values (new.assignee_id, new.id, new.points, 'add', new.date);
  end if;

  -- Only process when status changes from 'done' to something else (reverting points)
  if old.status = 'done' and new.status != 'done' and old.assignee_id is not null then
    -- Insert negative points event to subtract the points with task_date
    insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
    values (old.assignee_id, old.id, -old.points, 'subtract', old.date);
  end if;

  return new;
end;
$$;

-- Update the profile total_points trigger to work with task_date
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
