-- Migration: 20251020000000_add_current_pin_to_households.sql

-- Metadata
-- Description: Adds current_pin column to households table for admin PIN access
-- Tables: households
-- Dependencies: households table

-- Add current_pin column with default value and make it NOT NULL
-- Generate random 6-digit PINs for existing households
alter table public.households
add column current_pin char(6) not null default lpad(floor(random() * 999999)::text, 6, '0');

-- Add unique constraint to prevent duplicate PINs between households
alter table public.households
add constraint households_current_pin_unique unique (current_pin);

-- Add comment
comment on column public.households.current_pin is 'Current 6-digit PIN for household invites (visible to admin only)';

-- Update RLS policy to allow admins to view current_pin
-- Note: The existing policy already allows admins to see their household data
-- The application layer will handle filtering the PIN field based on user role
