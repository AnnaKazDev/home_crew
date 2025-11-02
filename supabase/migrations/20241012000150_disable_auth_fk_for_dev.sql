-- Migration: disable_auth_fk_for_dev.sql
-- Description: Temporarily disable auth.users foreign key constraint for development

-- Drop the foreign key constraint on profiles.id for development
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
