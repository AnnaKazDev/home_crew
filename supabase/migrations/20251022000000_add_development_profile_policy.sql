-- Migration: 20251022000000_add_development_profile_policy.sql
-- Description: Add policy to allow development user to update their profile

-- Allow development user to update their profile
create policy "Development user can update profile" on profiles
  for update using (id = 'e9d12995-1f3e-491d-9628-3c4137d266d1');
