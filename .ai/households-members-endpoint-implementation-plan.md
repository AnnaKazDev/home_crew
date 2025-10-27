# API Endpoint Implementation Plan: Household Members Management

## 1. Endpoint Overview

These endpoints enable household member management. They include listing members, changing their roles, and removing members. All operations work within the context of the current user's household - household_id is automatically resolved based on the JWT token. Modification operations (PATCH, DELETE) are available only to household administrators.

## 2. Request Details

### GET /v1/members

- **HTTP Method**: GET
- **URL Path**: `/v1/members`
- **Parameters**:
  - **Required**: None
  - **Optional**: None
- **Request Body**: None

### PATCH /v1/members/:id

- **HTTP Method**: PATCH
- **URL Path**: `/v1/members/:id`
- **Parameters**:
  - **Required**: `id` (member UUID in URL)
  - **Optional**: None
- **Request Body**:

```json
{
  "role": "admin | member"
}
```

### DELETE /v1/members/:id

- **HTTP Method**: DELETE
- **URL Path**: `/v1/members/:id`
- **Parameters**:
  - **Required**: `id` (member UUID in URL)
  - **Optional**: None
- **Request Body**: None

## 3. Types Used

- **MemberDTO**: `{ id: string, user_id: string, name: string, avatar_url: string | null, role: "admin" | "member", joined_at: string }`
- **UpdateMemberRoleCmd**: `{ role: "admin" | "member" }`
- **UpdateMemberRoleCmdSchema**: Zod schema for validating PATCH request body
- **HouseholdRow**: Full row from `households` table
- **MemberRow**: Full row from `household_members` table
- **ProfileRow**: Full row from `profiles` table

## 4. Response Details

### GET /v1/members

- **Status 200 OK**:

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "string",
    "avatar_url": "string | null",
    "role": "admin | member",
    "joined_at": "2025-10-20T10:30:00Z"
  }
]
```

### PATCH /v1/members/:id

- **Status 200 OK**:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "avatar_url": "string | null",
  "role": "admin | member",
  "joined_at": "2025-10-20T10:30:00Z"
}
```

### DELETE /v1/members/:id

- **Status 204 No Content**: No response body

### Errors for all endpoints:

- **Status 400 Bad Request**: Invalid input data (JSON parse error, Zod validation)
- **Status 401 Unauthorized**: Missing/invalid JWT token
- **Status 403 Forbidden**: User is not an administrator (for PATCH/DELETE)
- **Status 404 Not Found**: User not in any household or member does not exist
- **Status 422 Validation Failed**: Invalid data (invalid role, empty fields)
- **Status 500 Internal Server Error**: Server/database errors

## 5. Data Flow

### GET /v1/members

1. **JWT validation** → Extract userId from token
2. **Membership check** → Verify user belongs to a household
3. **Fetch members** → Query household_members + JOIN profiles for user's household
4. **Data transformation** → Map to MemberDTO format
5. **Return response** → List of members sorted by joined_at

### PATCH /v1/members/:id

1. **Request body validation** → Zod schema validation
2. **JWT validation** → Extract userId from token
3. **Permissions check** → Verify user is household admin
4. **Member verification** → Check member exists and belongs to same household
5. **Business validation** → Ensure not removing last admin
6. **Role update** → UPDATE household_members SET role = newRole
7. **Return response** → Updated member data in MemberDTO format

### DELETE /v1/members/:id

1. **JWT validation** → Extract userId from token
2. **Permissions check** → Verify user is household admin
3. **Member verification** → Check member exists and belongs to same household
4. **Business validation** → Ensure not removing self or last admin
5. **Soft delete** → UPDATE household_members SET deleted_at = NOW()
6. **Return response** → Status 204 No Content

## 6. Security Considerations

- **Authentication**: Valid Supabase JWT token required for all endpoints
- **Business authorization**: Only administrators can perform PATCH and DELETE operations
- **Data validation**: Zod schema validation for all request bodies
- **Rate limiting**: 100 requests/min/IP (middleware)
- **Row-Level Security**: RLS policies in Supabase filter data access
- **Input sanitization**: UUID format validation for URL parameters
- **Business rules enforcement**:
  - Cannot remove the last administrator
  - Cannot remove oneself
  - Only members of the same household can be modified
- **SQL injection protection**: Using parameterized queries instead of string concatenation
- **Soft delete**: Member removal via deleted_at timestamp instead of hard delete

## 7. Error Handling

### Household Members specific error codes:

- **400 Bad Request**:
  - Invalid JSON: `"Invalid JSON in request body"`
  - Validation error: `"Validation error"` with details array
- **401 Unauthorized**:
  - Missing/invalid JWT: `"Unauthorized"`
- **403 Forbidden**:
  - Not household admin: `"Not household admin"`
- **404 Not Found**:
  - User not in household: `"User not in household"`
  - Member not found: `"Member not found"`
- **409 Conflict**:
  - Cannot remove last admin: `"Cannot remove last admin"`
  - Cannot remove self: `"Cannot remove self"`
- **422 Validation Failed**:
  - Invalid role: `"Role must be either 'admin' or 'member'"`
- **500 Internal Server Error**:
  - Database errors: `"Internal server error"`
  - Unexpected errors: `"Internal server error"`

### Error logging:

All 5xx errors are logged with `request_id` according to the specification in api-plan.md section 6.

## 8. Performance Considerations

- **Indexes**: Utilization of existing `idx_members_household` indexes for membership queries
- **Query optimization**: JOIN only necessary fields from profiles table
- **Sorting**: Results sorted by joined_at for consistency
- **Caching**: No caching needed for these operations (rarely performed, sensitive data)
- **Database load**: Minimal impact - simple SELECT/UPDATE operations
- **RLS overhead**: Additional costs from security policy filtering
- **Concurrent access**: Possible conflicts with simultaneous last admin role changes

## 9. Implementation Stages

### Phase 1: Endpoint Preparation

1. Create `src/pages/api/v1/members/index.ts` for GET
2. Create `src/pages/api/v1/members/[id].ts` for PATCH and DELETE
3. Configure Astro routing for both paths
4. Add basic error handling structure

### Phase 2: GET /v1/members Implementation

1. Implement GET handler with `getHouseholdMembers()` call
2. Add JWT validation and authorization
3. Implement response mapping to MemberDTO
4. Add error handling according to specification

### Phase 3: PATCH /v1/members/:id Implementation

1. Implement PATCH handler with Zod validation
2. Add `updateMemberRole()` call with proper authorization
3. Implement admin check for current user
4. Add business validation (last admin protection)
5. Implement error handling

### Phase 4: DELETE /v1/members/:id Implementation

1. Implement DELETE handler
2. Add `removeHouseholdMember()` call with authorization
3. Implement business validation (last admin, self-removal protection)
4. Add error handling and 204 status

### Phase 5: Testing and Validation

1. Unit tests for all service functions
2. Integration tests for endpoints
3. Error case tests (403, 404, 409, 422)
4. RLS policy validation
5. Concurrency tests for edge cases

### Phase 6: Documentation and Deployment

1. Update API documentation
2. Add JSDoc comments to all functions
3. Conduct E2E tests in staging environment
4. Deploy to production
5. Monitor error logs for first 24 hours
