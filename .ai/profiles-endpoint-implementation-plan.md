# API Endpoint Implementation Plan: Profiles

## 1. Overview
The profile endpoints allow users to view and update their own profile data in the Home Crew application. The implementation includes two basic operations:
- Retrieve own profile (`GET /v1/profiles/me`)
- Update profile (`PATCH /v1/profiles/me`)

These endpoints are crucial for user identity management and personalization experience in the household chores management application.

## 2. Request Details

### GET /v1/profiles/me
- **HTTP Method**: GET
- **URL Structure**: `/v1/profiles/me`
- **Parameters**:
  - Required: None
  - Optional: None
- **Request Body**: None
- **Authentication**: Required (Supabase JWT token in `Authorization: Bearer <token>` header)

### PATCH /v1/profiles/me
- **HTTP Method**: PATCH
- **URL Structure**: `/v1/profiles/me`
- **Parameters**:
  - Required: None
  - Optional: None
- **Request Body**:
  ```json
  {
    "name": "string (≤ 100 characters, required)",
    "avatar_url": "string (valid URL, optional)"
  }
  ```
- **Authentication**: Required (Supabase JWT token in `Authorization: Bearer <token>` header)

## 3. Types Used
- **ProfileDTO**: `Pick<ProfilesRow, "id" | "name" | "avatar_url" | "total_points">`
- **UpdateProfileCmd**: `Pick<ProfilesRow, "name" | "avatar_url">`
- **ProfileRow**: Database type from the `profiles` table

## 4. Response Details

### GET /v1/profiles/me
**Success (200 OK)**:
```json
{
  "id": "uuid",
  "name": "string",
  "avatar_url": "string | null",
  "total_points": 0
}
```

**Errors**:
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - User profile does not exist
- `500 Internal Server Error` - Server error

### PATCH /v1/profiles/me
**Success (200 OK)**:
```json
{
  "id": "uuid",
  "name": "string",
  "avatar_url": "string | null",
  "total_points": 0
}
```

**Errors**:
- `400 Bad Request` - Invalid JSON format in request body
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - User profile does not exist
- `422 Validation Failed` - Data validation error (name too long, invalid URL)
- `500 Internal Server Error` - Server error

## 5. Data Flow
1. **Authentication**: Supabase verifies JWT token and extracts `user_id`
2. **Authorization**: Access only to own profile (RLS in Supabase)
3. **Validation**: Zod schema validates input data
4. **Service Layer**: Call functions from `profiles.service.ts`
5. **Database**: Queries to `profiles` table via Supabase client
6. **Response**: Return `ProfileDTO` or appropriate error

## 6. Security Considerations
- **Authentication**: Valid Supabase JWT token required
- **Authorization**: Row Level Security (RLS) ensures access only to own profile
- **Input Validation**: Strict validation through Zod schemas
- **Mass Assignment Protection**: Explicit field specification for updates
- **SQL Injection**: Prevention through Supabase ORM
- **Rate Limiting**: General limit of 100 req/min/IP through Astro middleware
- **Data Sanitization**: Trim whitespace for `name` field

## 7. Error Handling
- **400 Bad Request**: Invalid JSON in request body
- **401 Unauthorized**: Missing JWT token or token invalid
- **404 Not Found**: Profile does not exist in database
- **422 Validation Failed**: Detailed field validation errors
- **500 Internal Server Error**: Unexpected application/database errors

All errors are logged with `request_id` for tracking and debugging.

## 8. Performance Considerations
- **Simple Queries**: Single SELECT/UPDATE query on `profiles` table
- **Indexes**: `profiles` table has index on `id` (primary key)
- **Cache**: No caching needed for sensitive profile data
- **Database Load**: Minimal load - operations on single record
- **Response Size**: Small JSON response (4 fields)

## 9. Implementation Steps

### Step 1: Create profiles.service.ts
1. Create file `src/lib/profiles.service.ts`
2. Implement Zod schema `UpdateProfileCmdSchema`
3. Add function `getProfile(supabase, userId)`
4. Add function `updateProfile(supabase, userId, data)`
5. Add error handling following other services pattern

### Step 2: Implement GET /v1/profiles/me
1. Create directory `src/pages/api/v1/profiles/`
2. Create file `src/pages/api/v1/profiles/me.ts`
3. Implement GET endpoint with error handling
4. Add `export const prerender = false`
5. Test endpoint with valid token

### Step 3: Implement PATCH /v1/profiles/me
1. Add PATCH method handling in `me.ts` file
2. Implement request body parsing and validation
3. Add `updateProfile` service call
4. Add validation error handling (422)
5. Test endpoint with various scenarios

### Step 4: Testing and Validation
1. Unit tests for `profiles.service.ts`
2. Integration tests for endpoints
3. Security tests (authorization, validation)
4. Error tests (401, 404, 422)
5. Update API documentation if needed

### Step 5: Deployment and Monitoring
1. Deploy to test environment
2. End-to-end tests
3. Error monitoring in Supabase logs
4. Update performance metrics if needed
