-- Migration: 20241013000000_disable_rls_for_development.sql

-- Description: Disables Row Level Security for development purposes
-- This migration should ONLY be used in development environments
-- NEVER run this in production!

-- Disable RLS and drop policies for all tables

-- profiles table
drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update own profile" on profiles;
alter table profiles disable row level security;

-- households table
drop policy if exists "Users can view their household" on households;
drop policy if exists "Admin can manage household" on households;
alter table households disable row level security;

-- household_members table
alter table household_members disable row level security;

-- chores_catalog table
drop policy if exists "Public predefined tasks are viewable by everyone" on chores_catalog;
drop policy if exists "Household members can view their household tasks" on chores_catalog;
drop policy if exists "Household members can create custom tasks" on chores_catalog;
drop policy if exists "Task creator or admin can manage tasks" on chores_catalog;
alter table chores_catalog disable row level security;

-- daily_chores table
drop policy if exists "Members can view household chores" on daily_chores;
drop policy if exists "Members can create chores" on daily_chores;
drop policy if exists "Assignee or admin can update chores" on daily_chores;
alter table daily_chores disable row level security;

-- audit_logs table
drop policy if exists "Members can view their household logs" on audit_logs;
alter table audit_logs disable row level security;

-- points table
drop policy if exists "Users can view their points" on points;
drop policy if exists "System can manage points" on points;
alter table points disable row level security;
