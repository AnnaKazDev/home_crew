-- Migration: 20251102000000_update_profile_total_points_trigger.sql

-- Metadata
-- Description: Adds trigger to automatically update profile total_points when points_events are inserted/updated
-- Tables: profiles, points_events
-- Dependencies: profiles, points_events

-- Create function to update profile total_points
create or replace function update_profile_total_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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

-- Create trigger on points_events table for insert/update/delete
create trigger trigger_update_profile_total_points
  after insert or update or delete on points_events
  for each row execute function update_profile_total_points();

-- Update existing profiles to have correct total_points
update profiles
set total_points = (
  select coalesce(sum(points), 0)
  from points_events
  where user_id = profiles.id
);
