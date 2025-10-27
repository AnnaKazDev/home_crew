# Home Crew – PostgreSQL Database Schema

## 1. Tables

### 1.1 `profiles`

Uzupełniająca tabela profilu użytkownika; główna tabela uwierzytelniania to `auth.users` tworzona przez Supabase. Kolumna `id` w `profiles` == `auth.users.id`.

| Column       | Type        | Constraints                                                |
| ------------ | ----------- | ---------------------------------------------------------- |
| id           | uuid        | primary key, references `auth.users(id)` on delete cascade |
| name         | text        | not null                                                   |
| avatar_url   | text        |                                                            |
| total_points | integer     | not null, default 0                                        |
| created_at   | timestamptz | not null, default `now()`                                  |
| updated_at   | timestamptz | not null, default `now()`                                  |
| deleted_at   | timestamptz |                                                            |

---

### 1.2 `households`

| Column         | Type        | Constraints                              |
| -------------- | ----------- | ---------------------------------------- |
| id             | uuid        | primary key, default `gen_random_uuid()` |
| name           | text        | not null                                 |
| pin_hash       | char(60)    | not null                                 |
| pin_expires_at | timestamptz |                                          |
| timezone       | text        | not null, default `'UTC'`                |
| created_at     | timestamptz | not null, default `now()`                |

---

### 1.3 `household_members`

| Column       | Type           | Constraints                                                   |
| ------------ | -------------- | ------------------------------------------------------------- |
| id           | uuid           | primary key, default `gen_random_uuid()`                      |
| household_id | uuid           | not null, references `households(id)` on delete cascade       |
| user_id      | uuid           | not null, references `profiles(id)` on delete cascade, unique |
| role         | household_role | not null, default `'member'`, check in (`'admin'`,`'member'`) |
| joined_at    | timestamptz    | not null, default `now()`                                     |

Unique: `(user_id)` ensures jedno-gospodarstwo-per-user.

Additional uniqueness & limits:
• Trigger `household_members_limit` prevents więcej niż 10 członków w gospodarstwie (MVP wymóg).

---

### 1.4 `chores_catalog`

| Column             | Type             | Constraints                                                   |
| ------------------ | ---------------- | ------------------------------------------------------------- |
| id                 | uuid             | primary key, default `gen_random_uuid()`                      |
| household_id       | uuid             | references `households(id)` (NULL = predefined global task)   |
| title              | text             | not null **CHECK (char_length(title) <= 50)**                 |
| emoji              | text             |                                                               |
| time_of_day        | time_of_day_type | not null, default `'any'`                                     |
| category           | text             | not null                                                      |
| points             | smallint         | not null, check `points BETWEEN 0 AND 100 AND points % 5 = 0` |
| predefined         | boolean          | not null, default false                                       |
| created_by_user_id | uuid             | references `profiles(id)`                                     |
| created_at         | timestamptz      | not null, default `now()`                                     |
| deleted_at         | timestamptz      |                                                               |

Unique constraint `(household_id, lower(title))` to avoid duplikatów w katalogu zadań dla danego gospodarstwa.

---

### 1.5 `daily_chores`

| Column           | Type             | Constraints                                             |
| ---------------- | ---------------- | ------------------------------------------------------- |
| id               | uuid             | primary key, default `gen_random_uuid()`                |
| household_id     | uuid             | not null, references `households(id)` on delete cascade |
| date             | date             | not null                                                |
| chore_catalog_id | uuid             | not null, references `chores_catalog(id)`               |
| assignee_id      | uuid             | references `profiles(id)`                               |
| time_of_day      | time_of_day_type | not null, default `'any'`                               |
| status           | chore_status     | not null, default `'todo'`                              |
| points           | smallint         | not null (copied from catalog at insert time)           |
| created_at       | timestamptz      | not null, default `now()`                               |
| updated_at       | timestamptz      | not null, default `now()`                               |
| deleted_at       | timestamptz      |                                                         |

Unique constraint enforcing 1 task definition/day/assignee/time: `(household_id, date, chore_catalog_id, assignee_id, time_of_day)`.

Trigger `enforce_daily_limit` checks COUNT(\*) < 50 per `(household_id, date)` (ignores soft-deleted rows).

---

### 1.6 `chore_status_log`

| Column               | Type         | Constraints                             |
| -------------------- | ------------ | --------------------------------------- |
| id                   | bigserial    | primary key                             |
| daily_chore_id       | uuid         | not null, references `daily_chores(id)` |
| changed_by_user_id   | uuid         | not null, references `profiles(id)`     |
| previous_status      | chore_status |                                         |
| new_status           | chore_status |                                         |
| previous_assignee_id | uuid         |                                         |
| new_assignee_id      | uuid         |                                         |
| points_delta         | integer      |                                         |
| created_at           | timestamptz  | not null, default `now()`               |

---

### 1.7 `points_events`

| Column         | Type              | Constraints                         |
| -------------- | ----------------- | ----------------------------------- |
| id             | bigserial         | primary key                         |
| user_id        | uuid              | not null, references `profiles(id)` |
| daily_chore_id | uuid              | references `daily_chores(id)`       |
| points         | integer           | not null                            |
| event_type     | points_event_type | not null (`'add'`, `'subtract'`)    |
| created_at     | timestamptz       | not null, default `now()`           |

---

### 1.8 Enum Types

```sql
CREATE TYPE household_role AS ENUM ('admin', 'member');
-- extended per PRD update
CREATE TYPE time_of_day_type AS ENUM ('morning', 'afternoon', 'evening', 'night', 'any');
CREATE TYPE chore_status AS ENUM ('todo', 'done');
CREATE TYPE points_event_type AS ENUM ('add', 'subtract');
```

---

## 2. Relationships

- `households` 1 ────< `household_members` >──── 1 `profiles` (each user belongs to exactly one household)
- `households` 1 ────< `chores_catalog` (for custom tasks)
- `chores_catalog` 1 ────< `daily_chores`
- `daily_chores` 1 ────< `chore_status_log`
- `profiles` 1 ────< `points_events`
- `daily_chores` 1 ────< `points_events`

## 3. Indexes

```sql
-- Quick household lookup by PIN
CREATE INDEX idx_households_pin_hash ON households(pin_hash);
-- Find members of a household
CREATE INDEX idx_members_household ON household_members(household_id);
-- Catalog queries
CREATE INDEX idx_catalog_household_predefined ON chores_catalog(household_id, predefined);
-- Daily chores common filters
CREATE INDEX idx_daily_chores_household_date ON daily_chores(household_id, date);
CREATE INDEX idx_daily_chores_assignee_status ON daily_chores(assignee_id, status);
-- Logs / events
CREATE INDEX idx_status_log_chore ON chore_status_log(daily_chore_id);
CREATE INDEX idx_points_events_user ON points_events(user_id);
```

## 4. Row-Level Security (RLS)

1. Enable RLS on all tables containing household data (`households`, `household_members`, `chores_catalog`, `daily_chores`, `chore_status_log`, `points_events`).
2. Create helper view `current_user_household_members` that maps `auth.uid()` to `household_id` and `role` (populated via Supabase `auth.users`).
3. Example policy for `daily_chores`:

```sql
ALTER TABLE daily_chores ENABLE ROW LEVEL SECURITY;

-- Select / read within own household
CREATE POLICY select_own_household ON daily_chores
  FOR SELECT USING (household_id IN (SELECT household_id FROM current_user_household_members));

-- Insert: only members of household
CREATE POLICY insert_own_household ON daily_chores
  FOR INSERT WITH CHECK (household_id IN (SELECT household_id FROM current_user_household_members));

-- Update / delete: only assignee or admin
CREATE POLICY update_own ON daily_chores
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM current_user_household_members)
    AND (
      auth.uid() = assignee_id OR
      (SELECT role FROM current_user_household_members LIMIT 1) = 'admin')
  );
```

Apply analogous policies to the remaining tables. RLS example for profiles:

```sql
CREATE POLICY select_public_profiles ON profiles
  FOR SELECT USING (true);
CREATE POLICY manage_own_profile ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

## 5. Additional Notes

- **Soft-delete**: `deleted_at` columns combined with RLS filter `deleted_at IS NULL` preserve history without permanent removal.
- **Audit**: `chore_status_log` captures status & assignee changes; JSON diff trigger recommended for `chores_catalog` edits.
- **Data retention**: Consider yearly partitioning of `daily_chores` once rows >10 M (see planning notes).
- **Triggers**:
  - `enforce_daily_limit` on `daily_chores` to reject inserts when 50 active chores per household/day would be exceeded.
  - `restrict_daily_chores_edit` BEFORE UPDATE trigger on `daily_chores` that allows modifying only `status`, `assignee_id`, `updated_at`, `deleted_at`; any attempt to change other columns raises an exception (enforces "no edit, only delete + re-add").
  - `household_members_limit` BEFORE INSERT trigger on `household_members` that blocks insert when COUNT(\*) >= 10 for the target `household_id`.
  - Future `points_events` triggers to automatically add/subtract points when status moves to `done` / reverts.
- **Time zones**: `date` stores local household date; `created_at/updated_at` remain in UTC.
- **Scalability**: Index choices align with the most common query patterns outlined in PRD (daily view, user history, household admin screens).
