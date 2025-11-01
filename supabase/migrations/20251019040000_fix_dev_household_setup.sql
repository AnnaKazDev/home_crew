-- Migration: 20251019040000_fix_dev_household_setup.sql
-- Description: Set up development household and member for testing

-- Note: User creation should be done through Supabase Auth API, not direct SQL
-- This migration only sets up the profile and household data

-- Ensure we have a profile for the default user (only if user exists)
-- This will be handled by the auth trigger when user is created
-- For development, we'll insert manually if needed

-- Ensure we have a household (use a fixed hash for development)
insert into public.households (id, name, pin_hash, timezone)
values (
  '11111111-aaaa-bbbb-cccc-222222222222',
  'Dev household',
  '$2b$10$dummy.hash.for.dev.purposes.only',
  'UTC'
)
on conflict (id) do nothing;

-- Household member will be created when user signs up
-- For development, this will be handled by the API

-- Disable RLS for development testing (remove in production)
alter table public.household_members disable row level security;
alter table public.households disable row level security;
alter table public.chores_catalog disable row level security;
