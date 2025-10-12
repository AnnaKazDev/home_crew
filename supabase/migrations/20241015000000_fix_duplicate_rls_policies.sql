-- Migration: 20241015000000_fix_duplicate_rls_policies.sql

-- Description: Fixes duplicate permissive policies on chores_catalog table for INSERT action
-- Issue: Multiple permissive policies for role anon on INSERT action causing performance issues
-- Solution: Modify "Task creator or admin can manage tasks" policy to exclude INSERT operations

-- Drop the existing problematic policy
drop policy if exists "Task creator or admin can manage tasks" on chores_catalog;

-- Recreate the policy to only apply to UPDATE and DELETE operations
-- This avoids conflict with "Household members can create custom tasks" for INSERT
create policy "Task creator or admin can manage tasks"
  on chores_catalog for update
  using (
    household_id in (
      select household_id
      from current_user_household_members
      where role = 'admin' or auth.uid() = created_by_user_id
    )
  )
  with check (
    household_id in (
      select household_id
      from current_user_household_members
      where role = 'admin' or auth.uid() = created_by_user_id
    )
  );

create policy "Task creator or admin can delete tasks"
  on chores_catalog for delete
  using (
    household_id in (
      select household_id
      from current_user_household_members
      where role = 'admin' or auth.uid() = created_by_user_id
    )
  );
