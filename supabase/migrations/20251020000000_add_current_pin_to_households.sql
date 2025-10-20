-- Migration: 20251020000000_add_current_pin_to_households.sql

-- Metadata
-- Description: Adds current_pin column to households table for admin PIN access
-- Tables: households
-- Dependencies: households table

-- Add current_pin column to store the actual PIN for admin access
alter table public.households
add column current_pin char(6);

-- Update existing households to have a PIN (generate random 6-digit PINs)
-- Note: This will only affect households created before this migration
update public.households
set current_pin = lpad(floor(random() * 999999)::text, 6, '0')
where current_pin is null;

-- Make current_pin not null after populating existing records
alter table public.households
alter column current_pin set not null;

-- Add comment
comment on column public.households.current_pin is 'Current 6-digit PIN for household invites (visible to admin only)';

-- Update RLS policy to allow admins to view current_pin
-- Note: The existing policy already allows admins to see their household data
-- The application layer will handle filtering the PIN field based on user role
