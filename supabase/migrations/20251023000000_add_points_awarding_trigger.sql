-- Migration: 20251023000000_add_points_awarding_trigger.sql

-- Metadata
-- Description: Adds trigger to automatically award points when daily chore status changes to 'done'
-- Tables: daily_chores, points_events
-- Dependencies: daily_chores, points_events

-- Create function to handle points awarding when chore status changes
create or replace function award_points_on_chore_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only process when status changes to 'done' and assignee exists
  if new.status = 'done' and old.status != 'done' and new.assignee_id is not null then
    -- Insert points event for the completed chore
    insert into points_events (user_id, daily_chore_id, points, event_type)
    values (new.assignee_id, new.id, new.points, 'add');
  end if;

  -- Only process when status changes from 'done' to something else (reverting points)
  if old.status = 'done' and new.status != 'done' and old.assignee_id is not null then
    -- Insert negative points event to subtract the points
    insert into points_events (user_id, daily_chore_id, points, event_type)
    values (old.assignee_id, old.id, -old.points, 'subtract');
  end if;

  return new;
end;
$$;

-- Create trigger on daily_chores table
create trigger trigger_award_points_on_chore_completion
  after update of status on daily_chores
  for each row execute function award_points_on_chore_completion();




