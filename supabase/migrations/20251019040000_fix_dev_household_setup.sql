-- Migration: 20251019040000_fix_dev_household_setup.sql
-- Description: Set up development household and member for testing

-- Ensure we have a user in auth.users
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  'e9d12995-1f3e-491d-9628-3c4137d266d1',
  'dev@example.com',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now()
)
on conflict (id) do nothing;

-- Ensure we have a profile for the default user
insert into public.profiles (id, name)
values (
  'e9d12995-1f3e-491d-9628-3c4137d266d1',
  'Developer'
)
on conflict (id) do nothing;

-- Ensure we have a household (use a fixed hash for development)
insert into public.households (id, name, pin_hash, timezone)
values (
  '11111111-aaaa-bbbb-cccc-222222222222',
  'Dev household',
  '$2b$10$dummy.hash.for.dev.purposes.only',
  'UTC'
)
on conflict (id) do nothing;

-- Ensure we have a household member for the default user
insert into public.household_members (household_id, user_id, role)
values (
  '11111111-aaaa-bbbb-cccc-222222222222',
  'e9d12995-1f3e-491d-9628-3c4137d266d1',
  'admin'
)
on conflict (user_id) do nothing;

-- Disable RLS for development testing (remove in production)
alter table public.household_members disable row level security;
alter table public.households disable row level security;
alter table public.chores_catalog disable row level security;
