# API Endpoint Implementation Plan: GET /v1/points-events

## 1. Endpoint Overview

The GET /v1/points-events endpoint returns a paginated list of points events for the currently authenticated user. It allows filtering by event type and date range. Access is restricted by Row-Level Security - users can only see their own points events.

**Note:** Points events serve as a historical ledger of point transactions. Current point totals are calculated fresh from `daily_chores` table (excluding deleted tasks), not summed from points_events. This ensures accuracy when tasks are deleted or modified.

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/v1/points-events`
- **Parameters:**
  - **Required:** None (user_id inferred from JWT token)
  - **Optional:**
    - `cursor` (string) - pagination cursor pointing to the last item of the previous page
    - `limit` (integer, default 20, max 100) - number of items per page
    - `event_type` (string, enum: 'add' | 'subtract') - filter by event type
    - `from_date` (string, ISO 8601 format) - filter events from this date inclusive
    - `to_date` (string, ISO 8601 format) - filter events to this date inclusive
- **Request Body:** None (endpoint is read-only)

## 3. Types Used

- **PointsEventDTO** - represents a single points event
- **Paginated<PointsEventDTO>** - wrapper for paginated results
- **GetPointsEventsOptions** - interface for filtering and pagination options (to be defined in types.ts)

```typescript
export interface GetPointsEventsOptions {
  cursor?: string;
  limit?: number;
  event_type?: Enums<'points_event_type'>;
  from_date?: string;
  to_date?: string;
}
```

## 4. Response Details

- **200 OK:** Successful retrieval of points events
  ```json
  {
    "data": [
      {
        "id": 123,
        "points": 25,
        "event_type": "add",
        "created_at": "2025-10-21T10:30:00Z",
        "daily_chore_id": "uuid-here"
      }
    ],
    "next_cursor": "eyJpZCI6MTIzfQ=="
  }
  ```
- **400 Bad Request:** Invalid parameters (e.g., limit out of range)
- **401 Unauthorized:** Missing or invalid JWT token
- **422 Unprocessable Entity:** Invalid date range (from_date > to_date)
- **500 Internal Server Error:** Server/database errors

## 5. Data Flow

1. **Input Validation:** Zod schema validates query parameters
2. **Authorization:** Supabase JWT token verified by middleware
3. **Service Call:** Call `pointsEventsService.getUserPointsEvents(options)`
4. **Database Query:** Supabase executes query with RLS filter on user_id
5. **Pagination:** Cursor-based pagination with base64 encoding
6. **Response:** Serialize results to JSON with next_cursor if available

## 6. Security Considerations

- **RLS Policies:** The `points_events` table has RLS enabled with policies allowing access only to own events
- **JWT Authentication:** Valid JWT token required in Authorization header
- **Input Sanitization:** All parameters validated by Zod schemas
- **SQL Injection Prevention:** Supabase query builder automatically escapes parameters
- **Rate Limiting:** Consider implementation in the future (not in MVP)
- **Data Exposure:** Only user's own data, no access to other users' events

## 7. Error Handling

- **400 Bad Request:** Invalid pagination/filtering parameters
  ```json
  {
    "error": "Invalid limit parameter. Must be between 1 and 100.",
    "code": "INVALID_PAGINATION_PARAMS"
  }
  ```
- **401 Unauthorized:** Missing or invalid token
  ```json
  {
    "error": "Authentication required",
    "code": "UNAUTHORIZED"
  }
  ```
- **422 Unprocessable Entity:** Invalid date range
  ```json
  {
    "error": "Invalid date range: from_date cannot be after to_date",
    "code": "INVALID_DATE_RANGE"
  }
  ```
- **500 Internal Server Error:** Database errors
  ```json
  {
    "error": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
  ```

## 8. Performance Considerations

- **Indexes:** Utilize existing index `idx_points_events_user` on `user_id`
- **Pagination:** Cursor-based instead of offset-based for better performance with large datasets
- **Filtering:** Indexes on `event_type` and `created_at` may be added if needed
- **RLS Overhead:** Minimal impact thanks to policies based on `auth.uid()`
- **Cache:** Consider application-level cache for frequently accessed data

## 9. Implementation Steps

### Step 1: Prepare Types and Schemas

1. Add `GetPointsEventsOptions` interface to `src/types.ts`
2. Create Zod schema for query parameter validation in `src/lib/validation.schemas.ts`

### Step 2: Implement Service

1. Create `src/lib/pointsEvents.service.ts`
2. Implement `getUserPointsEvents(options: GetPointsEventsOptions)` method
3. Add cursor-based pagination with base64 encoding
4. Implement filtering by `event_type`, `from_date`, `to_date`

### Step 3: Implement API Endpoint

1. Create file `src/pages/api/v1/points-events/index.ts`
2. Implement GET handler with input validation
3. Call service and return paginated results
4. Add `export const prerender = false`

### Step 4: Testing and Validation

1. Add unit tests for service
2. Add integration tests for endpoint
3. Test pagination and filtering
4. Verify RLS policies work correctly

### Step 5: Documentation and Deployment

1. Update API documentation
2. Add endpoint to API specification
3. Deploy to staging and test with frontend
