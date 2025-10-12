# REST API Plan

## 1. Resources

| Resource | Backing Table | Description |
|----------|---------------|-------------|
| Auth | `auth.users` (Supabase) | Built-in email/password authentication. |
| Profile | `profiles` | Extended user profile and points balance. |
| Household | `households` | Household entity managed by an admin. |
| HouseholdMember | `household_members` | Membership relation between profile and household. |
| ChoreCatalog | `chores_catalog` | Template definitions of chores/tasks. |
| DailyChore | `daily_chores` | Instance of a chore scheduled for a specific date. |
| ChoreStatusLog | `chore_status_log` | Audit trail of status / assignee changes. |
| PointsEvent | `points_events` | Ledger of points adjustments. |

---

## 2. Endpoints

Below tables show CRUD and business-logic endpoints. `:id` denotes a resource UUID. All endpoints are versioned under `/v1`.

### 2.1 Auth
Supabase handles sign-up / login / password reset via its own endpoints (`/auth/v1/*`). No custom routes required, but frontend SDK calls those endpoints.

### 2.2 Profiles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/profiles/me` | Get the current user profile. |
| PATCH | `/v1/profiles/me` | Update own profile (name, avatar). |

Request (PATCH)
```json
{
  "name": "string (≤ 100)",
  "avatar_url": "string:url"
}
```
Response
```json
{
  "id": "uuid",
  "name": "string",
  "avatar_url": "string|null",
  "total_points": 0
}
```

Validation: `name` required ≤100; `avatar_url` optional, valid URL; `total_points` integer.

Errors: 401 Unauthorized, 422 Validation failed.

### 2.3 Households

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/households` | Create household (admin only, 1 per user). |
| POST | `/v1/households/join` | Join household by PIN. |
| GET | `/v1/households/current` | Get current household of user. |
| PATCH | `/v1/households/:id` | Update household (name, timezone) – admin. |

POST `/households` request
```json
{
  "name": "string (≤ 100)"
}
```
Response 201
```json
{ "id": "uuid", "name": "...", "pin": "123456" }
```

POST `/households/join` request
```json
{ "pin": "123456" }
```

Validation: name required, <=100; 6-digit PIN verified & not expired; limit one household per profile.

### 2.4 Household Members

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/members` | List members of current household. |
| PATCH | `/v1/members/:id` | Update role (admin only). |
| DELETE | `/v1/members/:id` | Remove member (admin). |

Validation: `role` must be `admin` or `member`; member count ≤10 enforced by trigger; only household admin can change roles or delete.

Note: Household context is derived from the authenticated user (each profile belongs to exactly one household). Therefore `household_id` is resolved server-side via the `current_user_household_members` view and is not part of the URL or request body.

### 2.5 Chore Catalog

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/catalog` | List catalog items (global + household). Supports filters. |
| POST | `/v1/catalog` | Add custom chore (member). |
| PATCH | `/v1/catalog/:id` | Update custom chore (creator or admin). |
| DELETE | `/v1/catalog/:id` | Soft-delete chore. |

Query params: `category`, `predefined=true|false`, `search`, `limit`, `offset`, `sort=title`.

Validation: title ≤50, points 0-100, category required, time_of_day enum.

### 2.6 Daily Chores

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/daily-chores` | List chores for date (default today). Filters: `status`, `assignee_id`. |
| POST | `/v1/daily-chores` | Create daily chore from catalog. |
| PATCH | `/v1/daily-chores/:id` | Update status or assignee. |
| DELETE | `/v1/daily-chores/:id` | Soft-delete daily chore. |

POST request
```json
{
  "date": "YYYY-MM-DD",
  "chore_catalog_id": "uuid",
  "assignee_id": "uuid|null",
  "time_of_day": "morning|afternoon|evening|night|any"
}
```

PATCH request (one of):
```json
{
  "status": "todo|done",
  "assignee_id": "uuid|null"
}
```

Validation: `date` valid ISO 8601 date; `time_of_day` enum; `status` enum; `assignee_id` belongs to same household. Business rules: ≤50 chores/household/day; unique `(household_id,date,chore_catalog_id,assignee_id,time_of_day)`; only assignee or admin may update.

### 2.7 Points & Audit (read-only in MVP)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/points-events` | List user points events (paginated). |
| GET | `/v1/chore-status-log` | List status logs for a daily chore (admin). |

Pagination params: `limit` (≤100), `cursor` (keyset).

---

## 3. Authentication & Authorization

Authentication: Supabase JWT in `Authorization: Bearer <token>` header. Frontend obtains token via Supabase client. Backend verifies token signature & role claim.

Authorization: Postgres RLS enforces data isolation by household. API layer performs supplemental checks (e.g., admin role for certain routes, daily chore assignee check) using `current_user_household_members` view.

Rate limiting: 100 requests / minute / IP via Astro middleware.

---

## 4. Validation & Business Logic

| Resource | Validation Rules |
|----------|------------------|
| Profile | `name` non-empty ≤100; `avatar_url` valid URL. |
| Household | `name` non-empty ≤100; max 1 per user. |
| HouseholdMember | max 10 members per household (trigger). |
| ChoreCatalog | `title` non-empty ≤50; `points` 0-100; `category` non-empty; `time_of_day` enum. Unique `(household_id,lower(title))`. |
| DailyChore | Limit 50 / household / day; unique composite key; only `status`, `assignee_id` updatable. |

Business Logic Mapping
1. **Registration (Admin/Member)** → Supabase `auth.signUp` then `/households` or `/households/join`.
2. **Daily view** → `GET /daily-chores?date=`.
3. **Add chore to day** → `POST /daily-chores` respecting 50 limit.
4. **Status drag-drop** → `PATCH /daily-chores/:id` with `{ "status": "done" }`.
5. **Assign member** → same PATCH including `assignee_id`.
6. **Points accumulation** → Trigger on `daily_chores` `status` change inserts `points_events`; frontend reads `/profiles/me` or `/points-events`.

---

## 5. Error Handling

| Code | Message | When |
|------|---------|------|
| 400 | "Invalid request body" | JSON parse / schema errors |
| 401 | "Unauthorized" | Missing/invalid JWT |
| 403 | "Forbidden" | RLS or role violation |
| 404 | "Not found" | Resource not accessible |
| 409 | "Conflict" | Unique constraint (e.g., duplicate daily chore) |
| 422 | "Validation failed" | Field-level errors |
| 429 | "Too many requests" | Rate limit exceeded |

---

## 6. Assumptions

- All routes require authentication unless explicitly noted.
- Supabase edge functions (TypeScript) will implement these endpoints, deployed under `/functions/v1/*` and exposed via Astro pages `/api/*`.
- Realtime channels for status updates may be added later; endpoints remain unchanged.
- Soft-deletes (`deleted_at`) are filtered out by default; include `?include_deleted=true` for admin usage.
