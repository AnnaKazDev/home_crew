-- Migration: 20251105000000_update_points_trigger_for_assignee_changes.sql
-- Description: Update points awarding trigger to also award points when assignee is assigned to already completed tasks

-- Drop the existing trigger
DROP TRIGGER IF EXISTS trigger_award_points_on_chore_completion ON daily_chores;

-- Update the trigger to handle assignee changes for completed tasks
CREATE OR REPLACE FUNCTION "public"."award_points_on_chore_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Case 1: Status changes to 'done' and assignee exists - award points
  if new.status = 'done' and old.status != 'done' and new.assignee_id is not null then
    insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
    values (new.assignee_id, new.id, new.points, 'add', new.date);
  end if;

  -- Case 2: Status changes from 'done' to something else - revoke points
  if old.status = 'done' and new.status != 'done' and old.assignee_id is not null then
    insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
    values (old.assignee_id, old.id, -old.points, 'subtract', old.date);
  end if;

  -- Case 3: Assignee changes for a task that is already 'done' - transfer points
  if new.status = 'done' and old.status = 'done' and new.assignee_id != old.assignee_id then
    -- Revoke points from old assignee (if any)
    if old.assignee_id is not null then
      insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
      values (old.assignee_id, old.id, -old.points, 'subtract', old.date);
    end if;

    -- Award points to new assignee (if any)
    if new.assignee_id is not null then
      insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
      values (new.assignee_id, new.id, new.points, 'add', new.date);
    end if;
  end if;

  -- Case 4: Assignee is assigned to a task that is already 'done' (from null to user)
  if new.status = 'done' and old.status = 'done' and old.assignee_id is null and new.assignee_id is not null then
    insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
    values (new.assignee_id, new.id, new.points, 'add', new.date);
  end if;

  -- Case 5: Assignee is removed from a task that is 'done' (from user to null)
  if new.status = 'done' and old.status = 'done' and old.assignee_id is not null and new.assignee_id is null then
    insert into points_events (user_id, daily_chore_id, points, event_type, task_date)
    values (old.assignee_id, old.id, -old.points, 'subtract', old.date);
  end if;

  return new;
end;
$$;

-- Recreate the trigger to fire on both status and assignee_id changes
CREATE TRIGGER trigger_award_points_on_chore_completion
  AFTER UPDATE OF status, assignee_id ON daily_chores
  FOR EACH ROW EXECUTE FUNCTION award_points_on_chore_completion();
