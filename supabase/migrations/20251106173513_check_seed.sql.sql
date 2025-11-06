drop trigger if exists "enforce_daily_chores_edit" on "public"."daily_chores";

drop trigger if exists "enforce_daily_chores_limit" on "public"."daily_chores";

drop trigger if exists "trigger_award_points_on_chore_completion" on "public"."daily_chores";

drop trigger if exists "enforce_household_members_limit" on "public"."household_members";

drop trigger if exists "trigger_update_profile_total_points" on "public"."points_events";

drop policy "Members can view their household logs" on "public"."chore_status_log";

drop policy "Household members can create custom tasks" on "public"."chores_catalog";

drop policy "Household members can view their household tasks" on "public"."chores_catalog";

drop policy "Public predefined tasks are viewable by everyone" on "public"."chores_catalog";

drop policy "Task creator or admin can delete tasks" on "public"."chores_catalog";

drop policy "Task creator or admin can manage tasks" on "public"."chores_catalog";

drop policy "Assignee or admin can update chores" on "public"."daily_chores";

drop policy "Members can create chores" on "public"."daily_chores";

drop policy "Members can view household chores" on "public"."daily_chores";

drop policy "Admin can manage household" on "public"."households";

drop policy "Users can view their household" on "public"."households";

drop policy "System can manage points" on "public"."points_events";

drop policy "Users can view their points" on "public"."points_events";

drop policy "Development user can update profile" on "public"."profiles";

drop policy "Profiles are viewable by everyone" on "public"."profiles";

drop policy "Users can insert own profile" on "public"."profiles";

drop policy "Users can update own profile" on "public"."profiles";

revoke delete on table "public"."chore_status_log" from "anon";

revoke insert on table "public"."chore_status_log" from "anon";

revoke references on table "public"."chore_status_log" from "anon";

revoke select on table "public"."chore_status_log" from "anon";

revoke trigger on table "public"."chore_status_log" from "anon";

revoke truncate on table "public"."chore_status_log" from "anon";

revoke update on table "public"."chore_status_log" from "anon";

revoke delete on table "public"."chore_status_log" from "authenticated";

revoke insert on table "public"."chore_status_log" from "authenticated";

revoke references on table "public"."chore_status_log" from "authenticated";

revoke select on table "public"."chore_status_log" from "authenticated";

revoke trigger on table "public"."chore_status_log" from "authenticated";

revoke truncate on table "public"."chore_status_log" from "authenticated";

revoke update on table "public"."chore_status_log" from "authenticated";

revoke delete on table "public"."chore_status_log" from "service_role";

revoke insert on table "public"."chore_status_log" from "service_role";

revoke references on table "public"."chore_status_log" from "service_role";

revoke select on table "public"."chore_status_log" from "service_role";

revoke trigger on table "public"."chore_status_log" from "service_role";

revoke truncate on table "public"."chore_status_log" from "service_role";

revoke update on table "public"."chore_status_log" from "service_role";

revoke delete on table "public"."chores_catalog" from "anon";

revoke insert on table "public"."chores_catalog" from "anon";

revoke references on table "public"."chores_catalog" from "anon";

revoke select on table "public"."chores_catalog" from "anon";

revoke trigger on table "public"."chores_catalog" from "anon";

revoke truncate on table "public"."chores_catalog" from "anon";

revoke update on table "public"."chores_catalog" from "anon";

revoke delete on table "public"."chores_catalog" from "authenticated";

revoke insert on table "public"."chores_catalog" from "authenticated";

revoke references on table "public"."chores_catalog" from "authenticated";

revoke select on table "public"."chores_catalog" from "authenticated";

revoke trigger on table "public"."chores_catalog" from "authenticated";

revoke truncate on table "public"."chores_catalog" from "authenticated";

revoke update on table "public"."chores_catalog" from "authenticated";

revoke delete on table "public"."chores_catalog" from "service_role";

revoke insert on table "public"."chores_catalog" from "service_role";

revoke references on table "public"."chores_catalog" from "service_role";

revoke select on table "public"."chores_catalog" from "service_role";

revoke trigger on table "public"."chores_catalog" from "service_role";

revoke truncate on table "public"."chores_catalog" from "service_role";

revoke update on table "public"."chores_catalog" from "service_role";

revoke delete on table "public"."daily_chores" from "anon";

revoke insert on table "public"."daily_chores" from "anon";

revoke references on table "public"."daily_chores" from "anon";

revoke select on table "public"."daily_chores" from "anon";

revoke trigger on table "public"."daily_chores" from "anon";

revoke truncate on table "public"."daily_chores" from "anon";

revoke update on table "public"."daily_chores" from "anon";

revoke delete on table "public"."daily_chores" from "authenticated";

revoke insert on table "public"."daily_chores" from "authenticated";

revoke references on table "public"."daily_chores" from "authenticated";

revoke select on table "public"."daily_chores" from "authenticated";

revoke trigger on table "public"."daily_chores" from "authenticated";

revoke truncate on table "public"."daily_chores" from "authenticated";

revoke update on table "public"."daily_chores" from "authenticated";

revoke delete on table "public"."daily_chores" from "service_role";

revoke insert on table "public"."daily_chores" from "service_role";

revoke references on table "public"."daily_chores" from "service_role";

revoke select on table "public"."daily_chores" from "service_role";

revoke trigger on table "public"."daily_chores" from "service_role";

revoke truncate on table "public"."daily_chores" from "service_role";

revoke update on table "public"."daily_chores" from "service_role";

revoke delete on table "public"."household_members" from "anon";

revoke insert on table "public"."household_members" from "anon";

revoke references on table "public"."household_members" from "anon";

revoke select on table "public"."household_members" from "anon";

revoke trigger on table "public"."household_members" from "anon";

revoke truncate on table "public"."household_members" from "anon";

revoke update on table "public"."household_members" from "anon";

revoke delete on table "public"."household_members" from "authenticated";

revoke insert on table "public"."household_members" from "authenticated";

revoke references on table "public"."household_members" from "authenticated";

revoke select on table "public"."household_members" from "authenticated";

revoke trigger on table "public"."household_members" from "authenticated";

revoke truncate on table "public"."household_members" from "authenticated";

revoke update on table "public"."household_members" from "authenticated";

revoke delete on table "public"."household_members" from "service_role";

revoke insert on table "public"."household_members" from "service_role";

revoke references on table "public"."household_members" from "service_role";

revoke select on table "public"."household_members" from "service_role";

revoke trigger on table "public"."household_members" from "service_role";

revoke truncate on table "public"."household_members" from "service_role";

revoke update on table "public"."household_members" from "service_role";

revoke delete on table "public"."households" from "anon";

revoke insert on table "public"."households" from "anon";

revoke references on table "public"."households" from "anon";

revoke select on table "public"."households" from "anon";

revoke trigger on table "public"."households" from "anon";

revoke truncate on table "public"."households" from "anon";

revoke update on table "public"."households" from "anon";

revoke delete on table "public"."households" from "authenticated";

revoke insert on table "public"."households" from "authenticated";

revoke references on table "public"."households" from "authenticated";

revoke select on table "public"."households" from "authenticated";

revoke trigger on table "public"."households" from "authenticated";

revoke truncate on table "public"."households" from "authenticated";

revoke update on table "public"."households" from "authenticated";

revoke delete on table "public"."households" from "service_role";

revoke insert on table "public"."households" from "service_role";

revoke references on table "public"."households" from "service_role";

revoke select on table "public"."households" from "service_role";

revoke trigger on table "public"."households" from "service_role";

revoke truncate on table "public"."households" from "service_role";

revoke update on table "public"."households" from "service_role";

revoke delete on table "public"."points_events" from "anon";

revoke insert on table "public"."points_events" from "anon";

revoke references on table "public"."points_events" from "anon";

revoke select on table "public"."points_events" from "anon";

revoke trigger on table "public"."points_events" from "anon";

revoke truncate on table "public"."points_events" from "anon";

revoke update on table "public"."points_events" from "anon";

revoke delete on table "public"."points_events" from "authenticated";

revoke insert on table "public"."points_events" from "authenticated";

revoke references on table "public"."points_events" from "authenticated";

revoke select on table "public"."points_events" from "authenticated";

revoke trigger on table "public"."points_events" from "authenticated";

revoke truncate on table "public"."points_events" from "authenticated";

revoke update on table "public"."points_events" from "authenticated";

revoke delete on table "public"."points_events" from "service_role";

revoke insert on table "public"."points_events" from "service_role";

revoke references on table "public"."points_events" from "service_role";

revoke select on table "public"."points_events" from "service_role";

revoke trigger on table "public"."points_events" from "service_role";

revoke truncate on table "public"."points_events" from "service_role";

revoke update on table "public"."points_events" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

alter table "public"."chore_status_log" drop constraint "chore_status_log_changed_by_user_id_fkey";

alter table "public"."chore_status_log" drop constraint "chore_status_log_daily_chore_id_fkey";

alter table "public"."chores_catalog" drop constraint "chores_catalog_created_by_user_id_fkey";

alter table "public"."chores_catalog" drop constraint "chores_catalog_household_id_fkey";

alter table "public"."chores_catalog" drop constraint "chores_catalog_points_check";

alter table "public"."chores_catalog" drop constraint "chores_catalog_title_check";

alter table "public"."daily_chores" drop constraint "daily_chores_assignee_id_fkey";

alter table "public"."daily_chores" drop constraint "daily_chores_chore_catalog_id_fkey";

alter table "public"."daily_chores" drop constraint "daily_chores_household_id_fkey";

alter table "public"."daily_chores" drop constraint "unique_daily_chore";

alter table "public"."household_members" drop constraint "household_members_household_id_fkey";

alter table "public"."household_members" drop constraint "household_members_user_id_fkey";

alter table "public"."household_members" drop constraint "unique_user_household";

alter table "public"."households" drop constraint "households_current_pin_unique";

alter table "public"."points_events" drop constraint "points_events_daily_chore_id_fkey";

alter table "public"."points_events" drop constraint "points_events_user_id_fkey";

drop function if exists "public"."award_points_on_chore_completion"();

drop function if exists "public"."check_daily_chores_limit"();

drop function if exists "public"."check_household_members_limit"();

drop function if exists "public"."create_household_with_admin"(p_name text, p_pin character, p_user_id uuid);

drop view if exists "public"."current_user_household_members";

drop trigger if exists "on_auth_user_created" on "auth"."users";

drop function if exists "public"."handle_new_user"();

drop function if exists "public"."restrict_daily_chores_edit"();

drop function if exists "public"."update_profile_total_points"();

alter table "public"."chore_status_log" drop constraint "chore_status_log_pkey";

alter table "public"."chores_catalog" drop constraint "chores_catalog_pkey";

alter table "public"."daily_chores" drop constraint "daily_chores_pkey";

alter table "public"."household_members" drop constraint "household_members_pkey";

alter table "public"."households" drop constraint "households_pkey";

alter table "public"."points_events" drop constraint "points_events_pkey";

alter table "public"."profiles" drop constraint "profiles_pkey";

drop index if exists "public"."chore_status_log_pkey";

drop index if exists "public"."chores_catalog_pkey";

drop index if exists "public"."daily_chores_pkey";

drop index if exists "public"."household_members_pkey";

drop index if exists "public"."households_current_pin_unique";

drop index if exists "public"."households_pkey";

drop index if exists "public"."idx_catalog_household_predefined";

drop index if exists "public"."idx_catalog_household_title_unique";

drop index if exists "public"."idx_daily_chores_assignee_status";

drop index if exists "public"."idx_daily_chores_household_date";

drop index if exists "public"."idx_households_pin_hash";

drop index if exists "public"."idx_members_household";

drop index if exists "public"."idx_points_events_user";

drop index if exists "public"."idx_status_log_chore";

drop index if exists "public"."points_events_pkey";

drop index if exists "public"."profiles_pkey";

drop index if exists "public"."unique_daily_chore";

drop index if exists "public"."unique_user_household";

drop table "public"."chore_status_log";

drop table "public"."chores_catalog";

drop table "public"."daily_chores";

drop table "public"."household_members";

drop table "public"."households";

drop table "public"."points_events";

drop table "public"."profiles";

drop sequence if exists "public"."chore_status_log_id_seq";

drop sequence if exists "public"."points_events_id_seq";

drop type "public"."chore_status";

drop type "public"."household_role";

drop type "public"."points_event_type";

drop type "public"."time_of_day_type";


