-- Migration: 20251019050000_add_test_chore.sql
-- Description: Add test chore data to demonstrate custom chores

-- Insert test custom chore
INSERT INTO public.chores_catalog (
  id,
  household_id,
  title,
  emoji,
  time_of_day,
  category,
  points,
  predefined,
  created_by_user_id,
  created_at
) VALUES (
  '7a476ce4-d178-4f8d-be34-8bdb5006c4e8',
  '11111111-aaaa-bbbb-cccc-222222222222',
  'Play with the cat',
  '🐈',
  'evening',
  'Pets',
  10,
  false,
  'e9d12995-1f3e-491d-9628-3c4137d266d1',
  '2025-10-19T21:15:27.081181+00:00'
) ON CONFLICT (id) DO NOTHING;
