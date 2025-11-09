SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict etbXDfiNI48hjdmVGC2hyImu5lcno3frUkj2NiUYadZpAZ6NcSGgRkqUd3UlOcG

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '804178d9-3bd7-4c16-b57e-7303857a52ca', 'authenticated', 'authenticated', 'anna.kazmierczak.it@gmail.com', '$2a$10$DrkPkFKaZBGCgsRVE8cagui6vYaCM9hkH3QEM7MoZwq14rxs60MOO', '2025-11-06 14:16:21.33032+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-06 14:16:21.306751+00', '2025-11-06 14:16:21.336307+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('804178d9-3bd7-4c16-b57e-7303857a52ca', '804178d9-3bd7-4c16-b57e-7303857a52ca', '{"sub": "804178d9-3bd7-4c16-b57e-7303857a52ca", "email": "anna.kazmierczak.it@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-06 14:16:21.320736+00', '2025-11-06 14:16:21.321399+00', '2025-11-06 14:16:21.321399+00', '057c694c-ffc4-4fda-8305-97876ec0e196');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: households; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."households" ("id", "name", "pin_hash", "pin_expires_at", "timezone", "created_at", "current_pin") VALUES
	('11111111-aaaa-bbbb-cccc-222222222222', 'Dev household', '$2b$10$dummy.hash.for.dev.purposes.only                     ', NULL, 'UTC', '2025-11-06 14:24:02.28733+00', '187346');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "name", "avatar_url", "total_points", "created_at", "updated_at", "deleted_at", "address") VALUES
	('e9d12995-1f3e-491d-9628-3c4137d266d1', 'Test User', NULL, 0, '2025-11-06 14:24:02.747071+00', '2025-11-06 14:24:02.747071+00', NULL, NULL);


--
-- Data for Name: chores_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."chores_catalog" ("id", "household_id", "title", "emoji", "time_of_day", "category", "points", "predefined", "created_by_user_id", "created_at", "deleted_at") VALUES
	('75cfb857-dddf-45fd-9c56-f13691a3f7b7', NULL, 'Wash dishes', '🍽️', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('c7d4ffaa-bdca-4a3d-acb8-19a6a2751a19', NULL, 'Wipe down countertops', '🧽', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('1f5a5442-4686-4332-a389-54a5c6b0b097', NULL, 'Clean stovetop', '🔥', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('6ae9152c-d9be-4716-9e45-dcb836eb2152', NULL, 'Empty dishwasher', '✨', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('72a97e64-08f8-489d-83c8-547169fcc997', NULL, 'Take out trash', '🗑️', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('b97131a4-cfef-4843-a51e-907d604393d0', NULL, 'Sweep kitchen floor', '🧹', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('bca29b49-353a-4d63-8346-428761ab1b1e', NULL, 'Mop kitchen floor', '🪣', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('8fa236d1-75d2-4fd5-bb1e-6e5e4d6aa9c3', NULL, 'Clean refrigerator', '🧊', 'any', 'Kitchen', 60, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('6ff283a2-db53-494d-aa3d-ae4641948ddc', NULL, 'Organize pantry', '🥫', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('34411cef-1a9c-4610-978d-f256079fa80a', NULL, 'Clean microwave', '📱', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('dcd02e0a-d716-4e08-b4e6-3056cc48bc41', NULL, 'Do laundry', '👕', 'any', 'Laundry', 60, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('f2fd890a-a515-4b4b-93e6-a226e29aacdd', NULL, 'Fold clothes', '🧺', 'any', 'Laundry', 25, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('50331216-4798-42a4-ba73-e44965811742', NULL, 'Put away laundry', '👔', 'any', 'Laundry', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('84d7b26c-bebf-46ca-bfd9-6a22f18d984b', NULL, 'Iron clothes', '🔧', 'any', 'Laundry', 45, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('c43c2234-de2f-44b5-b72f-de6f817647bf', NULL, 'Clean lint trap', '🌀', 'any', 'Laundry', 15, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('d6f469ef-a8d8-4ce8-a452-9578c360de41', NULL, 'Make bed', '🛏️', 'any', 'Bedroom', 5, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('07ba97e5-ec4f-44e8-b1ad-b0a38fc6af39', NULL, 'Change bed sheets', '🛌', 'any', 'Bedroom', 35, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('4c045c0e-ae60-4dec-99f6-6185f1e41923', NULL, 'Dust bedroom', '💨', 'any', 'Bedroom', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('e96c7446-3a04-4702-b302-9ac800a77efe', NULL, 'Organize closet', '👗', 'any', 'Bedroom', 50, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('8514ab1d-4258-4998-beb3-5ef6d979655a', NULL, 'Vacuum bedroom', '🔌', 'any', 'Bedroom', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('38aface3-d321-493e-a6bd-1b9af75f0608', NULL, 'Clean toilet', '🚽', 'any', 'Bathroom', 60, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('4de47e96-8ff1-4529-b4dd-a441de3671ef', NULL, 'Clean shower', '🚿', 'any', 'Bathroom', 60, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('1f24f995-5311-42d4-94c1-62c94815b5a2', NULL, 'Clean sink', '🚰', 'any', 'Bathroom', 30, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('a7c1c8e7-ab4d-4f61-b7cc-78c377c2cdc6', NULL, 'Wipe mirror', '🪞', 'any', 'Bathroom', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('ced19562-d8d0-4fc2-9dac-9e44b04dcb2b', NULL, 'Mop bathroom floor', '💧', 'any', 'Bathroom', 45, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('e6af2342-a0be-49dc-94bc-38ed2cff3b00', NULL, 'Restock toilet paper', '🧻', 'any', 'Bathroom', 10, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('cd42f778-58cb-431a-858d-2cce0eb6038e', NULL, 'Clean bathroom cabinet', '💊', 'any', 'Bathroom', 35, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('821b2188-443e-406b-a1d6-175928a05e94', NULL, 'Wash bath mats', '🧼', 'any', 'Bathroom', 25, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('2d6c17b2-ea0d-49ad-92af-0d57c16a3be7', NULL, 'Vacuum living room', '🛋️', 'any', 'Living Room', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('a2ccc44e-cb8c-4739-bc43-db2a069665de', NULL, 'Dust furniture', '🪑', 'any', 'Living Room', 25, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('43474bb3-8f96-48d5-8d52-39a1b86da8d7', NULL, 'Organize books', '📚', 'any', 'Living Room', 35, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('e7d891ab-9b24-471a-8d69-c893e05e9c39', NULL, 'Fluff pillows', '🛋️', 'any', 'Living Room', 10, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('7bcdd7c5-361b-4f9d-a83c-372585ec71be', NULL, 'Clean windows', '🪟', 'any', 'Living Room', 45, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('823ae0a4-a6e7-4df3-94e4-55fe65e631d2', NULL, 'Tidy coffee table', '☕', 'any', 'Living Room', 15, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('61a5fdda-8c45-4376-8bda-35b145816bce', NULL, 'Water plants', '🌱', 'any', 'General', 15, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('80a4ce43-1ae1-46ea-92ce-2a49355d5ff5', NULL, 'Dust ceiling fans', '🌀', 'any', 'General', 30, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('335078d9-f4b9-4f66-8131-8bdc0e907439', NULL, 'Wipe light switches', '💡', 'any', 'General', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('792a3807-c686-423d-83d9-03042bbaf586', NULL, 'Clean doorknobs', '🚪', 'any', 'General', 15, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('8b7837fc-336c-4671-a90b-b2475603c97e', NULL, 'Organize mail', '📬', 'any', 'General', 25, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('397978ca-bd56-4a6c-bcad-5dd2941c5f7f', NULL, 'Clean baseboards', '📏', 'any', 'General', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('da3fac6b-059f-472f-b882-dfc7aea996d3', NULL, 'Vacuum stairs', '🪜', 'any', 'General', 45, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('4f773814-ba18-4416-8b5a-f831624fb1b3', NULL, 'Replace air filters', '🌬️', 'any', 'General', 35, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('ef35d802-78c1-473a-be2c-73028f6f9000', NULL, 'Check smoke detectors', '🔔', 'any', 'General', 20, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('d87c761f-f7ef-48b3-b889-e3d2f9f30fab', NULL, 'Sweep porch', '🏡', 'any', 'Outdoor', 30, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('fd750a8a-f894-4fba-ac7e-e7a8a64719d8', NULL, 'Water lawn', '🌾', 'any', 'Outdoor', 25, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('35a02a93-b216-41ea-8721-1e0e7b0d094e', NULL, 'Rake leaves', '🍂', 'any', 'Outdoor', 40, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('702364f5-3475-47d0-b579-d55d67cd0969', NULL, 'Clean garage', '🚗', 'any', 'Outdoor', 60, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('1f91a6a4-7b89-4447-85e2-07c8435fb213', NULL, 'Feed cat', '🐈', 'morning', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('0694f48a-a68c-4712-8d67-1498bec86152', NULL, 'Feed cat', '🐈', 'afternoon', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('d5f54ece-9985-42fe-8ca8-e38b40420d92', NULL, 'Feed cat', '🐈', 'evening', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('106db6ec-6b1d-4437-bb62-e68641fa88ce', NULL, 'Feed dog', '🐕', 'morning', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('94fd07ab-1f56-49e0-a4e0-1ae611c9adff', NULL, 'Feed dog', '🐕', 'afternoon', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('96422710-d654-44c5-91c8-4e6622c7b9f4', NULL, 'Feed dog', '🐕', 'evening', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('c779df33-72b6-49b9-8593-65233fee7d06', NULL, 'Walk dog', '🦮', 'morning', 'Pets', 10, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('7b189ff9-095b-4dcb-9c8f-2d752e47d562', NULL, 'Walk dog', '🦮', 'afternoon', 'Pets', 10, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('3b45ea38-f4e7-4f8e-a604-3156bbffb47c', NULL, 'Walk dog', '🦮', 'evening', 'Pets', 10, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('4df9c22a-29b4-4401-960a-907873f43279', NULL, 'Clean litter box', '🐈', 'any', 'Pets', 30, true, NULL, '2025-11-06 14:24:02.132381+00', NULL),
	('0c82c268-c630-40cc-818f-3b8c36e070ae', NULL, 'Wash dishes', '🍽️', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('dd77d1dc-98c3-4b9e-a653-ad2189225334', NULL, 'Wipe down countertops', '🧽', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('803daa35-263c-45af-a871-02964a6fb48f', NULL, 'Clean stovetop', '🔥', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('bc069f5b-7280-421b-b467-03d17c141c0a', NULL, 'Empty dishwasher', '✨', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('8cde988b-c0ff-42c9-b444-3a32d2f00672', NULL, 'Take out trash', '🗑️', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('44f33e94-4aed-48ca-8f2f-fbe97b4ca025', NULL, 'Sweep kitchen floor', '🧹', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('2871a966-dbd5-4388-9204-b83f5f4b966f', NULL, 'Mop kitchen floor', '🪣', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('f41f86db-a704-49e2-ab38-d3a0a4c5d988', NULL, 'Clean refrigerator', '🧊', 'any', 'Kitchen', 60, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('364a0c92-2aa9-44f5-b123-64bef630b7ea', NULL, 'Organize pantry', '🥫', 'any', 'Kitchen', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('0998f923-ffe8-40ac-9037-ab46fd414fea', NULL, 'Clean microwave', '📱', 'any', 'Kitchen', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('25cc522f-ba33-47a9-a355-17f3674fdb2a', NULL, 'Do laundry', '👕', 'any', 'Laundry', 60, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('d1cad759-5285-40df-9cb7-6adbad31f944', NULL, 'Fold clothes', '🧺', 'any', 'Laundry', 25, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('3572cc43-b25c-4193-a235-0d8d4544ea28', NULL, 'Put away laundry', '👔', 'any', 'Laundry', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('0c0da7bb-70ba-4551-86c5-68a7143ce940', NULL, 'Iron clothes', '🔧', 'any', 'Laundry', 45, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('a6a92331-9369-4255-976a-13dae1b15889', NULL, 'Clean lint trap', '🌀', 'any', 'Laundry', 15, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('95bb0265-f6d0-4429-9d3e-85eb8813b6bb', NULL, 'Make bed', '🛏️', 'any', 'Bedroom', 5, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('96b28928-c5d8-49e2-bc41-353cf0686674', NULL, 'Change bed sheets', '🛌', 'any', 'Bedroom', 35, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('0dc9994d-b066-4f41-b4c9-d1a6d1d0d396', NULL, 'Dust bedroom', '💨', 'any', 'Bedroom', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('76c5ca62-a5b9-426d-b072-a604bfa4724a', NULL, 'Organize closet', '👗', 'any', 'Bedroom', 50, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('4b191ee2-44af-4cdd-b64c-ea78d840c9aa', NULL, 'Vacuum bedroom', '🔌', 'any', 'Bedroom', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('62abce2c-8ea8-4329-9588-70359079b31f', NULL, 'Clean toilet', '🚽', 'any', 'Bathroom', 60, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('7f6d6261-6c14-4dae-b750-0ab91f51faa4', NULL, 'Clean shower', '🚿', 'any', 'Bathroom', 60, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('7384f767-f728-4147-b672-b541b5035332', NULL, 'Clean sink', '🚰', 'any', 'Bathroom', 30, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('19579282-cba3-43fb-a2b1-0f4cb1adc9a8', NULL, 'Wipe mirror', '🪞', 'any', 'Bathroom', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('ca72d53d-169b-4e05-b403-9f29d5e1ec0f', NULL, 'Mop bathroom floor', '💧', 'any', 'Bathroom', 45, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('075899eb-77b1-4ebd-aba0-190c9cc43d26', NULL, 'Restock toilet paper', '🧻', 'any', 'Bathroom', 10, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('fc89c3f9-e028-4795-9914-34179dcfeb14', NULL, 'Clean bathroom cabinet', '💊', 'any', 'Bathroom', 35, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('e937a26b-1c14-430c-bb34-11178f7cda8a', NULL, 'Wash bath mats', '🧼', 'any', 'Bathroom', 25, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('d104a6a3-a227-4514-bc09-3f5b430eb547', NULL, 'Vacuum living room', '🛋️', 'any', 'Living Room', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('ef508ab9-0e41-4a98-bc79-f511359fe31c', NULL, 'Dust furniture', '🪑', 'any', 'Living Room', 25, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('23c224c0-5efa-4b62-bb76-0d5c1ab28ecf', NULL, 'Organize books', '📚', 'any', 'Living Room', 35, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('e617b6b6-00e2-48d3-b879-a0e6ed09cb64', NULL, 'Fluff pillows', '🛋️', 'any', 'Living Room', 10, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('e5c81284-7e8b-4979-9a37-b2297974efb3', NULL, 'Clean windows', '🪟', 'any', 'Living Room', 45, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('53230335-cca8-4256-b649-6ea46902ab8c', NULL, 'Tidy coffee table', '☕', 'any', 'Living Room', 15, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('2a948316-78c6-43ff-a58c-bc8208ea26cb', NULL, 'Water plants', '🌱', 'any', 'General', 15, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('f255665c-4c35-4c24-94c8-fcbaedb890db', NULL, 'Dust ceiling fans', '🌀', 'any', 'General', 30, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('25474679-a986-4723-9229-3d261d0b7ff6', NULL, 'Wipe light switches', '💡', 'any', 'General', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('8b9bdc57-9d47-4927-a0c2-04e29b23ab18', NULL, 'Clean doorknobs', '🚪', 'any', 'General', 15, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('1788f8da-40f1-4ccd-a0e1-1fc0a7544d4b', NULL, 'Organize mail', '📬', 'any', 'General', 25, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('c3eb59a1-991d-4f90-9a11-71c18cb24c53', NULL, 'Clean baseboards', '📏', 'any', 'General', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('f9937f81-c18e-4424-9c65-d21780921ee0', NULL, 'Vacuum stairs', '🪜', 'any', 'General', 45, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('dc627fa4-ed58-4540-9066-165668d879e5', NULL, 'Replace air filters', '🌬️', 'any', 'General', 35, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('4af88ec2-dc10-4a62-9463-823daf9c7370', NULL, 'Check smoke detectors', '🔔', 'any', 'General', 20, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('47266671-62df-4c2b-b086-4158f4bd2198', NULL, 'Sweep porch', '🏡', 'any', 'Outdoor', 30, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('7cd882f4-cb5d-4a7c-82bf-6b730117dccf', NULL, 'Water lawn', '🌾', 'any', 'Outdoor', 25, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('ecc4bea5-8f36-4aba-a369-51e0857b2e53', NULL, 'Rake leaves', '🍂', 'any', 'Outdoor', 40, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('7c35a205-f850-4c28-add7-12cfe86f43a8', NULL, 'Clean garage', '🚗', 'any', 'Outdoor', 60, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('e1b845d0-5de8-455f-9009-72b20e8f474c', NULL, 'Feed cat', '🐈', 'morning', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('f7b28b16-e705-4923-b33b-d82c32a5cb65', NULL, 'Feed cat', '🐈', 'afternoon', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('b93d3e2c-7b5c-46a3-b2ac-16e8600ac150', NULL, 'Feed cat', '🐈', 'evening', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('ad9c82ae-ccaf-40fa-b88a-2ce320729cd7', NULL, 'Feed dog', '🐕', 'morning', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('23dcfa55-8f28-450c-bc27-e6420f203919', NULL, 'Feed dog', '🐕', 'afternoon', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('7991f80a-09a3-438b-9399-44d002de64e1', NULL, 'Feed dog', '🐕', 'evening', 'Pets', 5, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('6cd39a82-b587-4c45-be82-b7a8af5914da', NULL, 'Walk dog', '🦮', 'morning', 'Pets', 10, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('80f10574-1215-4fa3-9bf8-13354ef770cc', NULL, 'Walk dog', '🦮', 'afternoon', 'Pets', 10, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('8d21e8fd-fe7a-4cce-a687-1b771c592082', NULL, 'Walk dog', '🦮', 'evening', 'Pets', 10, true, NULL, '2025-11-06 14:24:02.188295+00', NULL),
	('7ca9074e-a5a0-4f5a-a11e-93cfb1019107', NULL, 'Clean litter box', '🐈', 'any', 'Pets', 30, true, NULL, '2025-11-06 14:24:02.188295+00', NULL);


--
-- Data for Name: daily_chores; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: chore_status_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: household_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."household_members" ("id", "household_id", "user_id", "role", "joined_at") VALUES
	('d38541fd-4e79-493c-938a-fe492daa3031', '11111111-aaaa-bbbb-cccc-222222222222', 'e9d12995-1f3e-491d-9628-3c4137d266d1', 'admin', '2025-11-06 14:24:02.747071+00');


--
-- Data for Name: points_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: chore_status_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."chore_status_log_id_seq"', 1, false);


--
-- Name: points_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."points_events_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict etbXDfiNI48hjdmVGC2hyImu5lcno3frUkj2NiUYadZpAZ6NcSGgRkqUd3UlOcG

RESET ALL;
