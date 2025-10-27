# API Endpoint Implementation Plan: POST /v1/households

## 1. Endpoint Overview

This endpoint allows creating a new household. This operation is available only to users who do not yet belong to any household. Upon successful creation, the user automatically becomes the administrator of the newly created household. The endpoint generates a 6-digit PIN code, which is returned only once in the response and can be used by other users to join the household.

## 2. Request Details

- **HTTP Method**: POST
- **URL Path**: `/v1/households`
- **Parameters**:
  - **Required**: No URL/query parameters
  - **Optional**: None
- **Request Body**:

```json
{
  "name": "string (required, 3-100 characters)"
}
```

## 3. Types Used

- **CreateHouseholdCmd**: `{ name: string }` - command model for request body
- **CreateHouseholdDTO**: `{ id: string, name: string, pin: string }` - response DTO
- **HouseholdRow**: Full row from `households` table
- **MemberRow**: Full row from `household_members` table

## 4. Response Details

- **Status 201 Created**:

```json
{
  "id": "uuid",
  "name": "string",
  "pin": "string (6 digits, returned only once)"
}
```

- **Status 400 Bad Request**: Invalid input data (JSON parse error, Zod validation)
- **Status 409 Conflict**: User already belongs to a household
- **Status 422 Validation Failed**: Invalid data (name empty, too short/long)
- **Status 500 Internal Server Error**: Server/database errors

## 5. Data Flow

1. **Request body validation** → Zod schema validation
2. **Authorization check** → JWT token verification (via Supabase)
3. **Existing membership check** → Query `household_members` for `auth.uid()`
4. **PIN generation** → Create 6-digit PIN code + bcrypt hash
5. **Database transaction**:
   - INSERT into `households` (name, pin_hash, pin_expires_at, timezone, current_pin)
   - INSERT into `household_members` (household_id, user_id, role='admin')
6. **Return response** → CreateHouseholdDTO with PIN (only once)

## 6. Security Considerations

- **Authentication**: Valid Supabase JWT token required
- **Business authorization**: User cannot belong to any household (constraint `unique_user_household`)
- **Data validation**: Zod schema validation for request body
- **Rate limiting**: 100 requests/min/IP (middleware)
- **RLS**: Row-level security policies in Supabase
- **PIN Security**: bcrypt hash for verification, plaintext PIN stored for admin access, expires_at for security
- **PIN Access**: Only household administrators can view current PIN via GET /v1/households/current
- **Input sanitization**: Trim and length validation for name

## 7. Error Handling

- **400 Bad Request**:
  - Invalid JSON: `"Invalid JSON in request body"`
  - Validation error: `"Validation error"` with details array
- **401 Unauthorized**:
  - Missing/invalid JWT: `"Unauthorized"`
- **409 Conflict**:
  - User already in household: `"User already belongs to a household"`
- **422 Validation Failed**:
  - Name validation: `"Name cannot be empty"`, `"Name must be at least 3 characters"`, or `"Name must be 100 characters or less"`
- **500 Internal Server Error**:
  - Database errors: `"Internal server error"`
  - PIN generation errors: `"Internal server error"`

## 8. Performance Considerations

- **Indexes**: Use existing `idx_members_household` for membership checking
- **Transaction**: Atomic INSERT operations for consistency
- **Caching**: No caching needed for this operation (rarely performed)
- **Database load**: Minimal impact - 2 INSERT operations
- **PIN generation**: bcrypt hash - acceptable computational cost

## 9. Implementation Stages

### Phase 1: Service Preparation

1. Create `src/lib/households.service.ts`
2. Define Zod schema for `CreateHouseholdCmd`
3. Implement `generateHouseholdPin()` function (6 digits + bcrypt)
4. Implement `createHousehold()` function with business validation

### Phase 2: Endpoint Implementation

1. Create `src/pages/api/v1/households.ts`
2. Implement POST handling following catalog endpoint pattern
3. Add authorization and membership validation
4. Implement error handling according to specification

### Phase 3: Testing and Validation

1. Unit tests for service functions
2. Integration tests for endpoint
3. Error case tests (409, 422, etc.)
4. RLS policies validation

### Phase 4: Documentation and Deployment

1. Update API documentation
2. Add JSDoc comments
3. E2E tests in staging environment
4. Deploy to production

---

## Additional Household Endpoints Implementation Plans

### POST /v1/households/join

#### Overview

This endpoint allows users to join an existing household using a 6-digit PIN code.

#### Request Details

- **HTTP Method**: POST
- **URL Path**: `/v1/households/join`
- **Request Body**:

```json
{
  "pin": "string (required, 6 digits)"
}
```

#### Response Details

- **Status 200 OK**:

```json
{
  "id": "uuid",
  "name": "string",
  "timezone": "string"
}
```

- **Status 400 Bad Request**: Invalid PIN format
- **Status 401 Unauthorized**: Missing/invalid JWT
- **Status 404 Not Found**: Household not found or PIN expired
- **Status 409 Conflict**: User already belongs to a household
- **Status 422 Validation Failed**: Invalid PIN format

#### Data Flow

1. **Request validation** → Zod schema for PIN format
2. **Authorization check** → JWT token verification
3. **Existing membership check** → Ensure user not already in household
4. **PIN verification** → Find household by PIN hash, check expiration
5. **Join household** → INSERT into household_members with role='member'
6. **Return household data**

### GET /v1/households/current

#### Overview

Retrieves information about the current user's household.

#### Request Details

- **HTTP Method**: GET
- **URL Path**: `/v1/households/current`
- **Parameters**: None

#### Response Details

- **Status 200 OK** (for admin):

```json
{
  "id": "uuid",
  "name": "string",
  "timezone": "string",
  "pin": "string (6 digits, only returned for admin)"
}
```

- **Status 200 OK** (for member):

```json
{
  "id": "uuid",
  "name": "string",
  "timezone": "string"
}
```

- **Status 401 Unauthorized**: Missing/invalid JWT
- **Status 404 Not Found**: User not in any household

#### Data Flow

1. **Authorization check** → JWT token verification
2. **Household lookup** → Query household_members for current user and role
3. **Role check** → If admin, include PIN in response; if member, exclude PIN
4. **Return household data** → With or without PIN based on user role

### PATCH /v1/households/:id

#### Overview

Updates household information (admin only).

#### Request Details

- **HTTP Method**: PATCH
- **URL Path**: `/v1/households/:id`
- **Parameters**:
  - **id**: Household UUID (URL parameter)
- **Request Body**:

```json
{
  "name": "string (3-100 characters, optional)",
  "timezone": "string (optional, defaults to 'UTC')"
}
```

#### Response Details

- **Status 200 OK**:

```json
{
  "id": "uuid",
  "name": "string",
  "timezone": "string"
}
```

- **Status 400 Bad Request**: Invalid request data
- **Status 401 Unauthorized**: Missing/invalid JWT
- **Status 403 Forbidden**: Not household admin
- **Status 404 Not Found**: Household not found
- **Status 422 Validation Failed**: Invalid field values

#### Data Flow

1. **Request validation** → Zod schema validation
2. **Authorization check** → JWT token verification
3. **Admin check** → Verify user is household admin
4. **Household verification** → Ensure household exists and user belongs to it
5. **Update household** → PATCH households table
6. **Return updated data**
