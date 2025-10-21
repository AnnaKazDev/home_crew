# Home Crew – Household Chores Planner

![build](https://img.shields.io/github/actions/workflow/status/your-org/home-crew/ci.yml?branch=main)  
![license](https://img.shields.io/github/license/your-org/home-crew)  
![node](https://img.shields.io/badge/node-22.14.0-blue)

> Home Crew is a responsive web application that helps families fairly plan, assign, and track everyday household chores.

---

## Table of Contents
1. [Project Description](#project-description)  
2. [Tech Stack](#tech-stack)  
3. [Getting Started Locally](#getting-started-locally)  
4. [Available Scripts](#available-scripts)  
5. [API Reference](#api-reference)  
6. [Project Scope](#project-scope)  
7. [Project Status](#project-status)  
8. [License](#license)

---

## Project Description
Home Crew lets up to 10 family members share a **To Do / Done** board for each day, choose from **50 predefined tasks** or add custom ones, drag-and-drop to update status, and assign who is responsible—all backed by Supabase. The system logs every action and supports English UI with full responsiveness on mobile, tablet, and desktop.

Key features  
- Admin creates a household and invites members via a 6-digit PIN  
- Email/password authentication with password-reset flow  
- Daily calendar view with “To Do” and “Done” columns  
- Drag-and-drop or click to mark tasks complete  
- Task assignment to any household member  
- Points accumulate for completed chores (gamification; reward UI post-MVP)  
- Audit log stored in PostgreSQL  
- GDPR-compliant data storage & right-to-erasure

_Target success metric_: **≥ 2 chores added per active member per day**.

---

## Tech Stack

### Front-end
- **Astro 5** – static site generator with island architecture  
- **React 19** (islands) – interactive components (drag-and-drop, modals)  
- **TypeScript 5** – static typing  
- **Tailwind CSS 4** – utility-first styling  
- **shadcn/ui** – accessible component library

### Back-end
- **Supabase** (PostgreSQL, RLS, auth, audit)  
- Optional realtime channels for live status updates

### Tooling & Infrastructure
- **OpenRouter.ai** – multi-provider LLM gateway  
- **GitHub Actions** – lint → test → build → preview → staging → production  
- **Docker** – container image (Astro Node adapter)  
- **DigitalOcean** – hosting & managed Postgres/Supabase Cloud

---

## Getting Started Locally

### Prerequisites
- **Node 22.14.0**  
  ```bash
  nvm install 22.14.0
  nvm use 22.14.0
  ```
- **Supabase CLI** (for local development)
  ```bash
  npm install -g supabase
  # or
  brew install supabase/tap/supabase
  ```

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-org/home-crew.git
cd home-crew

# 2. Install dependencies
npm install      # or pnpm install

# 3. Initialize Supabase (if not already done)
supabase init

# 4. Start Supabase locally
supabase start    # Starts all Supabase services (API, database, Studio, etc.) in Docker containers
supabase stop     # Stops all running Supabase services and cleans up Docker containers

# 5. Run database migrations
supabase db reset --local

# Optional: Disable RLS for development (removes all security policies)
# supabase migration up --include-all  # Run all migrations including development ones

# 6. Configure environment
cp .env.example .env   # create .env file from template

# Get Supabase connection details (from Supabase CLI 2.48.x+)
supabase status -o env

# Copy the output SUPABASE_URL and SUPABASE_KEY to your .env file
# Example output:
# SUPABASE_URL=http://127.0.0.1:54321
# SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 7. Start dev server
npm run dev
```
Open http://localhost:3001 to view the app.

### Database Management

#### Row Level Security (RLS) Control

Your project includes special migrations to control database security policies per environment:

##### **Production Mode (Default - Recommended)**
When you run standard migrations, RLS is **enabled** with full security policies:
```bash
# Standard setup with RLS enabled
supabase db reset --local          # Local development
supabase db reset --linked         # Production/staging
```
✅ **RLS enabled** - full data security
✅ **Security policies** active
✅ **Data protected** per user/household

##### **Development Mode (Optional)**
For easier development and testing, you can disable RLS to access all data freely:
```bash
# 1. First run standard migrations
supabase db reset --local

# 2. Then disable RLS for development
supabase migration up --file 20241013000000_disable_rls_for_development.sql
```
⚠️  **RLS disabled** - full access to all data
⚠️  **No security restrictions**
⚠️  **Local development only!**

##### **Restore Production Security**
To re-enable RLS after development work:
```bash
# Restore full security
supabase migration up --file 20241014000000_reenable_rls_for_production.sql
```
✅ **RLS re-enabled**
✅ **All security policies** restored

##### **When to Use Each Mode**

| Environment | RLS Status | Usage |
|-------------|------------|-------|
| **Production** | ✅ Enabled | Always - security critical |
| **Staging** | ✅ Enabled | Security testing |
| **Local Dev** | ❌ Disabled | Easy testing, debugging |
| **Local Dev** | ✅ Enabled | Testing security features |

### Building for production
```bash
npm run build
npm run preview   # Local preview of production build
```

---

## Available Scripts

| Command           | Description                               |
|-------------------|-------------------------------------------|
| `npm run dev`     | Start Astro dev server with hot-reload     |
| `npm run build`   | Build static & server output               |
| `npm run preview` | Preview production build locally           |
| `npm run astro`   | Run arbitrary Astro CLI commands           |
| `npm run lint`    | Lint all source files                      |
| `npm run lint:fix`| Lint and auto-fix issues                    |
| `npm run format`  | Prettier formatting for JSON/CSS/MD        |

---

## API Reference

### POST /v1/catalog
Creates a new custom chore in the household's catalog.

**Request**
```bash
POST /api/v1/catalog
Content-Type: application/json
```

**Body**
```json
{
  "title": "Take out trash",
  "category": "cleaning",
  "points": 10,
  "time_of_day": "evening",
  "emoji": "🗑️"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `title` | string | ✓ | 1–50 characters, trimmed |
| `category` | string | ✓ | Non-empty |
| `points` | number | ✓ | 0–100, divisible by 5 |
| `time_of_day` | enum | ✗ | `'morning'`, `'afternoon'`, `'evening'`, `'night'`, `'any'` (default: `'any'`) |
| `emoji` | string | ✗ | Single emoji or short text |

**Response – 201 Created**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Take out trash",
  "category": "cleaning",
  "points": 10,
  "time_of_day": "evening",
  "emoji": "🗑️",
  "predefined": false,
  "created_by_user_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
  "created_at": "2025-10-19T12:34:56.789Z",
  "deleted_at": null
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Validation error` | Invalid request body (missing/invalid fields). Details array included. |
| **404** | `Household not found` | User is not a member of any household. |
| **409** | `Duplicate title` | A chore with this title already exists in the household. |
| **500** | `Internal server error` | Server error during processing. |

**Example Error (400)**
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "points",
      "message": "Points must be divisible by 5"
    }
  ]
}
```

### GET /v1/catalog
Fetches catalog items for the user's household (predefined and/or custom).

**Request**
```bash
GET /api/v1/catalog
GET /api/v1/catalog?type=all
GET /api/v1/catalog?type=predefined
GET /api/v1/catalog?type=custom
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | enum | `all` | Filter type: `all` (predefined + custom), `predefined` (global only), or `custom` (household only) |

**Response – 200 OK**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Take out trash",
    "category": "cleaning",
    "points": 10,
    "time_of_day": "evening",
    "emoji": "🗑️",
    "predefined": false,
    "created_by_user_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
    "created_at": "2025-10-19T12:34:56.789Z",
    "deleted_at": null
  }
]
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid type parameter` | Invalid query parameter value. Must be: `all`, `predefined`, or `custom`. |
| **404** | `Household not found` | User is not a member of any household. |
| **500** | `Internal server error` | Server error during processing. |

### PATCH /v1/catalog/{id}
Updates an existing catalog item (partial update – only provided fields are updated).

**Request**
```bash
PATCH /api/v1/catalog/{id}
Content-Type: application/json
```

**Body** (all fields optional)
```json
{
  "title": "Take out trash from all rooms",
  "points": 15,
  "emoji": "🗑️✨"
}
```

| Field | Type | Validation |
|-------|------|-----------|
| `title` | string | 1–50 characters, trimmed |
| `category` | string | Non-empty |
| `points` | number | 0–100, divisible by 5 |
| `time_of_day` | enum | `'morning'`, `'afternoon'`, `'evening'`, `'night'`, `'any'` |
| `emoji` | string | Single emoji or short text |

**Response – 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Take out trash from all rooms",
  "category": "cleaning",
  "points": 15,
  "time_of_day": "evening",
  "emoji": "🗑️✨",
  "predefined": false,
  "created_by_user_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
  "created_at": "2025-10-19T12:34:56.789Z",
  "deleted_at": null
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Validation error` | Invalid request body or missing required ID parameter. |
| **404** | `Item not found` | Catalog item does not exist or belongs to a different household. |
| **404** | `Household not found` | User is not a member of any household. |
| **409** | `Duplicate title` | Another item in the catalog has the same title. |
| **500** | `Internal server error` | Server error during processing. |

### DELETE /v1/catalog/{id}
Soft-deletes a catalog item (marks as deleted; data remains for audit purposes).

**Request**
```bash
DELETE /api/v1/catalog/{id}
```

**Response – 204 No Content**
(Empty response body)

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Item ID is required` | Missing ID parameter. |
| **404** | `Item not found` | Catalog item does not exist or belongs to a different household. |
| **404** | `Household not found` | User is not a member of any household. |
| **500** | `Internal server error` | Server error during processing. |

## Households API

### POST /v1/households
Creates a new household and makes the authenticated user its administrator.

**Request**
```bash
POST /api/v1/households
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body**
```json
{
  "name": "Smith Family"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `name` | string | ✓ | 3–100 characters, trimmed |

**Response – 201 Created**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smith Family",
  "pin": "123456"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid JSON in request body` | Malformed JSON request. |
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **409** | `User already belongs to a household` | User is already a member of another household. |
| **422** | `Validation error` | Invalid request body (missing/invalid fields). Details array included. |
| **500** | `Internal server error` | Server error during processing. |

**Example Error (422)**
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "name",
      "message": "Household name must be at least 3 characters"
    }
  ]
}
```

### GET /v1/households/current
Retrieves information about the current user's household.

**Request**
```bash
GET /api/v1/households/current
Authorization: Bearer <jwt_token>
```

**Response – 200 OK** (for admin)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smith Family",
  "timezone": "UTC",
  "pin": "123456"
}
```

**Response – 200 OK** (for member)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smith Family",
  "timezone": "UTC"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **404** | `User not in any household` | User is not a member of any household. |
| **500** | `Internal server error` | Server error during processing. |

### POST /v1/households/join
Joins an existing household using a 6-digit PIN code.

**Request**
```bash
POST /api/v1/households/join
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body**
```json
{
  "pin": "123456"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `pin` | string | ✓ | Exactly 6 digits |

**Response – 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smith Family",
  "timezone": "UTC"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid JSON in request body` | Malformed JSON request. |
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **404** | `Invalid PIN` | PIN does not match any existing household. |
| **404** | `PIN has expired` | PIN has expired (24-hour validity). |
| **409** | `User already belongs to a household` | User is already a member of another household. |
| **422** | `Validation error` | Invalid PIN format. Details array included. |
| **500** | `Internal server error` | Server error during processing. |

### PATCH /v1/households/{id}
Updates household information (admin only).

**Request**
```bash
PATCH /api/v1/households/{id}
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body** (all fields optional)
```json
{
  "name": "Smith Family Home",
  "timezone": "America/New_York"
}
```

| Field | Type | Validation |
|-------|------|-----------|
| `name` | string | 3–100 characters, trimmed |
| `timezone` | string | Valid timezone identifier |

**Response – 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smith Family Home",
  "timezone": "America/New_York",
  "pin": "123456"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid JSON in request body` | Malformed JSON request. |
| **400** | `Household ID is required` | Missing household ID parameter. |
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **403** | `Not a member of this household` | User is not a member of the specified household. |
| **403** | `Only household administrators can update household information` | User is not an admin of this household. |
| **422** | `Validation error` | Invalid request body fields. Details array included. |
| **500** | `Internal server error` | Server error during processing. |

## Household Members API

### GET /v1/members
Retrieves all members of the current user's household.

**Request**
```bash
GET /api/v1/members
Authorization: Bearer <jwt_token>
```

**Response – 200 OK**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
    "name": "John Smith",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "admin",
    "joined_at": "2025-10-19T12:34:56.789Z"
  }
]
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **404** | `User not in household` | User is not a member of any household. |
| **500** | `Internal server error` | Server error during processing. |

### PATCH /v1/members/{id}
Updates a household member's role (admin only).

**Request**
```bash
PATCH /api/v1/members/{id}
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body**
```json
{
  "role": "admin"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `role` | enum | ✓ | Must be either `admin` or `member` |

**Response – 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
  "name": "John Smith",
  "avatar_url": "https://example.com/avatar.jpg",
  "role": "admin",
  "joined_at": "2025-10-19T12:34:56.789Z"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Validation error` | Invalid request body (invalid role value). Details array included. |
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **403** | `Not household admin` | User is not an administrator of this household. |
| **404** | `Member not found` | Member does not exist or belongs to a different household. |
| **409** | `Cannot remove last admin` | Attempting to demote the last remaining administrator. |
| **409** | `Cannot remove self` | Attempting to remove oneself from the household. |
| **422** | `Validation error` | Invalid role value. Details array included. |
| **500** | `Internal server error` | Server error during processing. |

### DELETE /v1/members/{id}
Removes a member from the household (admin only, soft delete).

**Request**
```bash
DELETE /api/v1/members/{id}
Authorization: Bearer <jwt_token>
```

**Response – 204 No Content**
(Empty response body)

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **403** | `Not household admin` | User is not an administrator of this household. |
| **404** | `Member not found` | Member does not exist or belongs to a different household. |
| **409** | `Cannot remove last admin` | Attempting to remove the last remaining administrator. |
| **409** | `Cannot remove self` | Attempting to remove oneself from the household. |
| **500** | `Internal server error` | Server error during processing. |

## Daily Chores API

### GET /v1/daily-chores
Retrieves daily chores for the user's household with optional filters.

**Request**
```bash
GET /api/v1/daily-chores
GET /api/v1/daily-chores?date=2025-10-21
GET /api/v1/daily-chores?status=todo
GET /api/v1/daily-chores?assignee_id=550e8400-e29b-41d4-a716-446655440000
GET /api/v1/daily-chores?date=2025-10-21&status=done
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | Today | Date in YYYY-MM-DD format |
| `status` | enum | None | Filter by status: `todo` or `done` |
| `assignee_id` | string | None | Filter by assignee UUID |

**Response – 200 OK**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2025-10-21",
    "time_of_day": "morning",
    "status": "todo",
    "assignee_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
    "points": 10,
    "chore_catalog_id": "660e8400-e29b-41d4-a716-446655440001"
  }
]
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid date parameter` | Invalid date format (must be YYYY-MM-DD). |
| **400** | `Invalid status parameter` | Invalid status value (must be 'todo' or 'done'). |
| **400** | `Invalid assignee_id parameter` | Invalid assignee_id format (must be valid UUID). |
| **404** | `Household not found` | User is not a member of any household. |
| **500** | `Internal server error` | Server error during processing. |

### POST /v1/daily-chores
Creates a new daily chore from the catalog.

**Request**
```bash
POST /api/v1/daily-chores
Content-Type: application/json
```

**Body**
```json
{
  "date": "2025-10-21",
  "chore_catalog_id": "660e8400-e29b-41d4-a716-446655440001",
  "assignee_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
  "time_of_day": "morning"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `date` | string | ✓ | Valid ISO date in YYYY-MM-DD format |
| `chore_catalog_id` | string | ✓ | Valid UUID of existing catalog item |
| `assignee_id` | string | ✗ | Valid UUID of household member (nullable) |
| `time_of_day` | enum | ✗ | `'morning'`, `'afternoon'`, `'evening'`, `'night'`, `'any'` (default: `'any'`) |

**Response – 201 Created**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-10-21",
  "time_of_day": "morning",
  "status": "todo",
  "assignee_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
  "points": 10,
  "chore_catalog_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid JSON in request body` | Malformed JSON request. |
| **400** | `Validation error` | Invalid request body fields. Details array included. |
| **400** | `Chore catalog item not found or not accessible` | Catalog item doesn't exist or belongs to different household. |
| **400** | `Assignee does not belong to this household` | Assignee is not a member of the user's household. |
| **404** | `Household not found` | User is not a member of any household. |
| **409** | `Daily limit of 50 chores exceeded` | Household already has 50 chores for this date. |
| **409** | `Duplicate chore already exists for this date, catalog item, assignee, and time` | Identical chore already exists. |
| **500** | `Internal server error` | Server error during processing. |

### PATCH /v1/daily-chores/{id}
Updates a daily chore's status or assignee (partial update – only provided fields are updated).

**Request**
```bash
PATCH /api/v1/daily-chores/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

**Body** (at least one field required)
```json
{
  "status": "done",
  "assignee_id": "e3b50950-7881-4983-8888-63d3f5ea455d"
}
```

| Field | Type | Validation |
|-------|------|-----------|
| `status` | enum | Must be either `todo` or `done` |
| `assignee_id` | string | Valid UUID of household member (nullable) |

**Response – 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-10-21",
  "time_of_day": "morning",
  "status": "done",
  "assignee_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
  "points": 10,
  "chore_catalog_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid chore ID` | Invalid UUID format in URL parameter. |
| **400** | `Invalid JSON in request body` | Malformed JSON request. |
| **400** | `Validation error` | Invalid request body fields. Details array included. |
| **400** | `New assignee does not belong to this household` | Assignee is not a member of the user's household. |
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **403** | `Only the assignee or household admin can update this chore` | User lacks permission to modify this chore. |
| **404** | `Daily chore not found` | Chore doesn't exist or belongs to different household. |
| **404** | `Household not found` | User is not a member of any household. |
| **500** | `Internal server error` | Server error during processing. |

### DELETE /v1/daily-chores/{id}
Soft-deletes a daily chore (marks as deleted; data remains for audit purposes).

**Request**
```bash
DELETE /api/v1/daily-chores/550e8400-e29b-41d4-a716-446655440000
```

**Response – 204 No Content**
(Empty response body)

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| **400** | `Invalid chore ID` | Invalid UUID format in URL parameter. |
| **401** | `Unauthorized` | Missing or invalid JWT token. |
| **403** | `Only the assignee or household admin can delete this chore` | User lacks permission to delete this chore. |
| **404** | `Daily chore not found` | Chore doesn't exist or belongs to different household. |
| **404** | `Household not found` | User is not a member of any household. |
| **500** | `Internal server error` | Server error during processing. |

---

## Project Scope

### In scope (MVP)
- User registration (Admin / Member)  
- Household creation & member join via PIN  
- Daily To Do / Done board with drag-and-drop  
- 50 predefined chores + CRUD for custom chores  
- Assignment of chores to household members  
- Audit log of all actions  
- English UI, fully responsive  
- Data privacy & GDPR compliance

### Out of scope (MVP)
- Push/SMS notifications  
- Multiple households per account  
- Statistics dashboard or data export  
- Native mobile apps  
- Real-time updates (optional enhancement only)

---

## Roadmap / Planned Features

- **Gamification & Rewards** – accumulate points for each completed chore and exchange them for configurable rewards (e.g., extra screen time, cinema ticket etc). Points are stored already; reward UI planned post-MVP.

---

## Project Status
| Version | Stage | Notes |
|---------|-------|-------|
| `v0.0.1` | 🚧 **Work in progress** | Core MVP features under active development. See [project board](https://github.com/your-org/home-crew/projects/1) for current tasks. |

---

## License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ ☕ 📚 🤖 ⚡</p>
