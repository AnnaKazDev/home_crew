-- Migration: 20251101190211_add_address_to_profiles.sql

-- Description: Add address field to profiles table for storing user address

-- Add address column to profiles table
alter table public.profiles
add column address text;

-- Add comment to the column
comment on column public.profiles.address is 'User address (optional, static information)';
