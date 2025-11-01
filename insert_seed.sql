-- Insert profile for default user (bypass auth constraint for dev)
INSERT INTO public.profiles (id, name, total_points)
VALUES ('e9d12995-1f3e-491d-9628-3c4137d266d1', 'Developer', 0)
ON CONFLICT (id) DO NOTHING;

-- Create development household
INSERT INTO public.households (id, name, pin_hash, timezone)
VALUES (
  '11111111-aaaa-bbbb-cccc-222222222222',
  'Dev Household',
  '$2b$10$dummy.hash.for.dev.purposes.only',
  'UTC'
)
ON CONFLICT (id) DO NOTHING;

-- Create household member
INSERT INTO public.household_members (household_id, user_id, role)
VALUES (
  '11111111-aaaa-bbbb-cccc-222222222222',
  'e9d12995-1f3e-491d-9628-3c4137d266d1',
  'admin'
)
ON CONFLICT (user_id) DO NOTHING;
