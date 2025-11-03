-- Migration: 20251105000300_reenable_profiles_rls.sql
-- Description: Re-enable RLS on profiles table for security (applied after disable for proper ordering)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
