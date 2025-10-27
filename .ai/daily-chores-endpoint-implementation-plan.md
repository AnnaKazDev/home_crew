# API Endpoint Implementation Plan: Daily Chores

## 1. Endpoint Overview

The `/v1/daily-chores` endpoint manages daily chores assigned to specific dates within a household. It allows family members to view, create, update, and delete tasks based on templates from the chore catalog. The system enforces business rules such as the 50 tasks per day limit and access control (only the assignee or administrator can modify tasks).

## 2. Request Details

- **HTTP Methods**: GET, POST, PATCH, DELETE
- **URL Structure**:
  - `GET /v1/daily-chores` - list tasks with optional query parameters
  - `POST /v1/daily-chores` - create a new task
  - `PATCH /v1/daily-chores/:id` - update an existing task
  - `DELETE /v1/daily-chores/:id` - delete a task

- **Parameters**:
  - **Required**:
    - For POST: `date` (ISO date), `chore_catalog_id` (UUID)
    - For PATCH/DELETE: `id` in URL path (UUID of the task)
  - **Optional**:
    - For GET: `date` (default: today), `status` (todo|done), `assignee_id` (UUID)
    - For POST: `assignee_id` (UUID|null), `time_of_day` (enum)
    - For PATCH: at least one of: `status` (todo|done), `assignee_id` (UUID|null)

- **Request Body**: JSON for POST and PATCH, according to Zod schemas

## 3. Types Used

- **DTOs**:
  - `DailyChoreDTO` - complete task data with optional embedded catalog data
- **Command Models**:
  - `CreateDailyChoreCmd` - for creating a new task
  - `UpdateDailyChoreCmd` - for partial updates
- **Zod Schemas** (to be created):
  - `CreateDailyChoreCmdSchema` - input validation for POST
  - `UpdateDailyChoreCmdSchema` - input validation for PATCH

## 4. Response Details

- **GET /v1/daily-chores**: `200 OK` with `DailyChoreDTO[]`
- **POST /v1/daily-chores**: `201 Created` with single `DailyChoreDTO`
- **PATCH /v1/daily-chores/:id**: `200 OK` with updated `DailyChoreDTO`
- **DELETE /v1/daily-chores/:id**: `204 No Content`

All responses include the `Content-Type: application/json` header.

## 5. Data Flow

1. **Authentication**: JWT token verified by Supabase
2. **Authorization**: User's household_id retrieved via `current_user_household_members` view
3. **Validation**: Zod schema validation for request body
4. **Business Logic**: Business rules validation in service layer
5. **Database**: CRUD operations through Supabase client with RLS
6. **Response**: Mapping results to DTO and JSON serialization

## 6. Security Considerations

- **RLS (Row Level Security)**: All queries filtered by household_id
- **Authorization Checks**: Only task assignee or household administrator can modify tasks
- **Input Validation**: Complete Zod validation preventing injection attacks
- **UUID Validation**: All identifiers verified as valid UUIDs
- **Rate Limiting**: 100 requests/minute/IP through Astro middleware
- **Audit Trail**: All status changes logged in `chore_status_log` table

## 7. Error Handling

- **400 Bad Request**: Invalid JSON or Zod validation errors
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User doesn't belong to household or lacks modification permissions
- **404 Not Found**: Task doesn't exist or doesn't belong to user's household
- **409 Conflict**: Exceeding 50 tasks/day limit or uniqueness constraint violation
- **422 Validation Failed**: Invalid enum values or date format
- **500 Internal Server Error**: Database errors or unexpected exceptions

All errors include descriptive messages and are logged with `request_id`.

## 8. Performance Considerations

- **Indexes**: Utilizing existing indexes on `(household_id, date)` and `(assignee_id, status)`
- **Pagination**: Not implemented in MVP, but prepared for future through `Paginated<T>` type
- **N+1 Queries**: Avoided through single queries with JOIN to catalog if needed
- **Caching**: Not implemented in MVP, data always fresh from database
- **Limits**: Business constraints (50/day) prevent overload

## 9. Implementation Stages

1. **Create Zod schemas** in `dailyChores.service.ts` for Create/Update commands validation
2. **Implement service functions**:
   - `getDailyChores()` - filtering with optional parameters
   - `createDailyChore()` - creation with business rules validation
   - `updateDailyChore()` - update with permissions control
   - `deleteDailyChore()` - soft-delete with ownership verification
3. **Create directory structure**: `src/pages/api/v1/daily-chores/`
4. **Implement API endpoints**:
   - `index.ts` for GET and POST
   - `[id].ts` for PATCH and DELETE
5. **Add `export const prerender = false`** to all endpoints
6. **Integration testing**: Validation of all error and success scenarios
7. **Update API documentation** if needed
