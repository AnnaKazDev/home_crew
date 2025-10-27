-- Migration: 20251027000000_add_test_data.sql
-- Description: Add test data for development workflow testing

-- Insert test user into auth.users (this might not work in all setups, but try)
-- Note: This might fail if auth schema is not accessible, in that case we'll just use existing data

-- Insert test profile
INSERT INTO public.profiles (id, name)
VALUES ('e9d12995-1f3e-491d-9628-3c4137d266d1', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Insert test household
INSERT INTO public.households (id, name, pin_hash, timezone, current_pin)
VALUES ('11111111-aaaa-bbbb-cccc-222222222222', 'Test Household', '$2b$10$dummy.hash.for.dev.purposes.only', 'UTC', '948447')
ON CONFLICT (id) DO NOTHING;

-- Insert household member
INSERT INTO public.household_members (household_id, user_id, role)
VALUES ('11111111-aaaa-bbbb-cccc-222222222222', 'e9d12995-1f3e-491d-9628-3c4137d266d1', 'admin')
ON CONFLICT (user_id) DO NOTHING;
