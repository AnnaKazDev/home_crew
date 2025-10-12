-- Migration: 20241012000100_create_base_types_and_profiles.sql

-- Metadata
-- Description: Creates base enum types and profiles table
-- Tables: profiles
-- Types: household_role, time_of_day_type, chore_status, points_event_type

-- create custom types
create type household_role as enum ('admin', 'member');
create type time_of_day_type as enum ('morning', 'afternoon', 'evening', 'night', 'any');
create type chore_status as enum ('todo', 'done');
create type points_event_type as enum ('add', 'subtract');

-- create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  total_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- enable rls
alter table profiles enable row level security;

-- policies for profiles
comment on table profiles is 'Holds user profile data linked to auth.users';

-- allow public read access to profiles
create policy "Profiles are viewable by everyone" on profiles
  for select using (true);

-- allow authenticated users to update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- create profile on signup trigger
create function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


