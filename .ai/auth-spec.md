# AUTHENTICATION MODULE ARCHITECTURE SPECIFICATION - HOME CREW

## INTRODUCTION

This specification describes the comprehensive architecture of the registration, login, and password recovery module for the Home Crew application, compliant with the requirements defined in `prd.md` and utilizing Supabase Auth technology in combination with Astro + React architecture.

## 1. USER INTERFACE ARCHITECTURE

### 1.1 Page Structure and Routing

#### New authentication pages (non-auth mode):

- **`/auth`** - Main authentication page (Astro)
  - Component: `AuthPage.astro`
  - Contains toggle between registration and login
  - Responsive design for desktop/tablet/mobile
  - Automatic redirection for logged-in users

#### Modifications to existing pages (protection against unauthorized access):

- **`/`** (index.astro) - Welcome page
  - **Modification**: Adding middleware redirecting to `/daily_chores` for logged-in users
  - **Modification**: For non-logged-in users - displaying welcome page with registration/login buttons

- **`/daily_chores`** - Main application view
  - **Modification**: Adding authentication-required middleware
  - **Behavior**: Redirect to `/auth` for non-logged-in users

- **`/household`** - Household management
  - **Modification**: Adding authentication-required middleware
  - **Behavior**: Redirect to `/auth` for non-logged-in users

- **`/profile`** - User profile
  - **Modification**: Adding authentication-required middleware
  - **Behavior**: Redirect to `/auth` for non-logged-in users

- **`/chores`** - Task catalog
  - **Modification**: Adding authentication-required middleware
  - **Behavior**: Redirect to `/auth` for non-logged-in users

### 1.2 React Components (client-side islands)

#### New authentication components:

- **`AuthForm.tsx`** - Main authentication form component
  - Props: `{ mode: 'login' | 'register' | 'reset-password' }`
  - Internal state: loading, errors
  - Integration with Supabase Auth
  - Real-time field validation

- **`LoginForm.tsx`** - Login form
  - Fields: email, password
  - "Forgot password?" button
  - "Sign in" button

- **`RegisterForm.tsx`** - Registration form
  - Fields: name (login/nick), email, password, confirmPassword, role (radio: Admin/Member), householdName (only for Admin role), pin (only for Member role)
  - Dynamic field display based on selected role
  - "Register" button
  - Success screen for admin showing household PIN

- **`ResetPasswordForm.tsx`** - Password reset form
  - Fields: email
  - "Send reset link" button

- **`AuthModeToggle.tsx`** - Mode toggle switch
  - Buttons: "I have an account" / "I don't have an account"
  - Transition animations between forms

#### Modifications to existing components:

- **`AppHeader.tsx`**
  - **Addition**: "Log out" button next to user greeting
  - **Modification**: Conditional display of greeting only for logged-in users
  - **Addition**: Handling logout action from Supabase Auth

- **`HamburgerMenu.tsx`**
  - **Addition**: "Log out" menu item for mobile devices

### 1.3 Authentication Context and Hooks

#### New hooks:

- **`useAuthRedirect.ts`** - Hook for automatic redirection of non-logged-in users
  ```typescript
  interface UseAuthRedirectReturn {
    isAuthenticated: boolean;
    loading: boolean;
    user: User | null;
  }
  ```

#### Existing hooks (extended):

- **`useAuthStore`** (Zustand) - Main store for authentication state management
  - Managing user, profile, household state
  - Methods: signIn, signUp, signOut, resetPassword
  - Automatic synchronization with Supabase Auth

#### New contexts:

- **`AuthContext.tsx`** - Authentication context provider
  - Managing global user state
  - Automatic session refresh
  - Handling Supabase Auth events

### 1.4 Middleware and Route Protection

#### Current middleware (`src/middleware/index.ts`):

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client
  context.locals.supabase = getSupabaseServiceClient();

  // Authentication is handled on the client side by useAuthStore
  // Components use useAuthRedirect hook for automatic redirection
  // of non-logged-in users to /auth

  return next();
});
```

**Note:** In the current implementation, route protection is implemented on the client side through the `useAuthRedirect` hook in React components, not through server-side middleware. This provides better SPA experience without hydration issues.

### 1.5 Error Handling and Validation

#### Error components:

- **`AuthErrorDisplay.tsx`** - Displaying authentication errors
  - Mapping Supabase errors to user-friendly messages
  - Handling different error types (validation, network, authentication)

#### Validation schemas (Zod):

```typescript
// src/lib/validation/auth.schemas.ts
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'member']),
    pin: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'member') {
        return data.pin && data.pin.length === 6 && /^\d{6}$/.test(data.pin);
      }
      return true;
    },
    {
      message: 'PIN must consist of 6 digits',
      path: ['pin'],
    }
  );
```

### 1.6 Use Cases and Flows

#### Scenario 1: New Administrator Registration

1. User enters `/auth`
2. Selects registration mode
3. Fills out form (name, email, password, role=admin, householdName)
4. After submission: account creation in Supabase Auth + profile in `profiles`
5. Household creation with provided name and generated 6-digit PIN
6. Confirmation email sent with PIN
7. Success screen displayed with household name and PIN to share with family members
8. User can copy PIN or click "Continue to App" to go to `/daily_chores`

#### Scenario 2: Family Member Registration

1. User enters `/auth`
2. Selects registration mode
3. Fills out form (name, email, password, role=member, pin=XXXXXX)
4. PIN validation against existing household
5. After submission: account creation + joining household
6. Redirect to `/daily_chores`

#### Scenario 3: Existing User Login

1. User enters `/auth` or is redirected
2. Selects login mode
3. Fills in email and password
4. After successful login - redirect to `/daily_chores`

#### Scenario 4: Password Reset

1. User clicks "Forgot password?" in login form
2. Switches to password reset mode
3. Enters email
4. Receives email with reset link
5. After clicking link - new page to set new password

## 2. BACKEND LOGIC

### 2.1 API Endpoints Structure

#### New authentication endpoints:

- **`POST /api/v1/auth/register`** - User registration
- **`POST /api/v1/auth/login`** - Login (optional, may use Supabase directly)
- **`POST /api/v1/auth/logout`** - Logout
- **`POST /api/v1/auth/reset-password`** - Password reset

#### Extended existing endpoints:

- **`POST /api/v1/households`** - Extended with automatic household creation during admin registration
- **`POST /api/v1/households/join`** - Member joining household during registration

### 2.2 Data Models and DTOs

#### New authentication types:

```typescript
// src/types/auth.types.ts
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  pin?: string; // only for members
}

export interface AuthResponse {
  user: User;
  profile: ProfileDTO;
  household: HouseholdDTO;
  session: Session;
}

export interface ResetPasswordRequest {
  email: string;
}
```

### 2.3 Input Data Validation

#### Server-side validation schemas:

```typescript
// src/lib/validation/auth-api.schemas.ts
export const registerApiSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'member']),
  pin: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});

export const loginApiSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

### 2.4 Exception Handling

#### Authentication error classes:

```typescript
// src/lib/errors/auth.errors.ts
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RegistrationError extends AuthenticationError {
  constructor(message: string) {
    super(message, 'REGISTRATION_FAILED');
  }
}

export class HouseholdJoinError extends AuthenticationError {
  constructor(message: string) {
    super(message, 'HOUSEHOLD_JOIN_FAILED');
  }
}
```

#### Error handling middleware:

```typescript
// src/middleware/error-handler.ts
export function handleAuthError(error: unknown): Response {
  if (error instanceof AuthenticationError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  // handle other errors...
}
```

### 2.5 Integration with Existing Services

#### Extension of `profiles.service.ts`:

- Addition of `createProfileForAuth` function
- Addition of `linkProfileToHousehold` function

#### Extension of `households.service.ts`:

- Addition of `createHouseholdForAdmin` function
- Addition of `validateAndJoinHousehold` function

## 3. AUTHENTICATION SYSTEM

### 3.1 Supabase Auth Configuration

#### RLS Settings (Row Level Security):

```sql
-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Access policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for households
CREATE POLICY "Household members can view their household" ON households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = households.id
      AND user_id = auth.uid()
    )
  );
```

### 3.2 Astro Integration

#### Supabase client configuration:

```typescript
// src/db/supabase.client.ts - extension
export function getSupabaseAuthClient(): SupabaseClient {
  const client = getSupabaseClient();

  // Configure authentication event listeners
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // Automatically load profile and household
      loadUserData(session.user.id);
    }
  });

  return client;
}
```

#### Session handling in Astro:

```typescript
// src/lib/auth/astro-auth.ts
export async function getServerSession(context: APIContext): Promise<Session | null> {
  const {
    data: { session },
  } = await context.locals.supabase.auth.getSession();
  return session;
}

export async function requireAuth(context: APIContext): Promise<User> {
  const session = await getServerSession(context);
  if (!session) {
    throw new AuthenticationError('Authentication required');
  }
  return session.user;
}
```

### 3.3 Session Management

#### Automatic session refresh:

```typescript
// src/hooks/useAuth.ts - fragment
useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      await refreshProfile();
      navigate('/daily_chores');
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      setProfile(null);
      navigate('/auth');
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### 3.4 Security

#### Security mechanisms:

1. **HTTPS only** - all endpoints require HTTPS
2. **CSRF protection** - for sensitive operations
3. **Rate limiting** - limit login/reset password attempts
4. **Password policies** - password strength requirements
5. **Session management** - automatic session expiration
6. **Audit logging** - logging all authentication operations

#### Supabase Auth configuration:

```typescript
// Configuration in supabase/config.toml
[auth];
enabled = true;
site_url = 'https://home-crew.app';
additional_redirect_urls = ['http://localhost:3001'];
jwt_expiry = 3600;
enable_confirmations = true;
enable_password_reset = true[auth.email];
enable_signup = true;
double_confirm_changes = true;
enable_confirmations = true;
```

## 4. INTEGRATION WITH EXISTING CODE

### 4.1 Modifications to Existing Components

#### `useProfile.ts` - refactoring:

- Removal of hardcoded user ID
- Integration with `useAuth` hook
- Use of real Supabase authentication

#### `DailyViewWithProvider.tsx`:

- Addition of authentication check before rendering
- Loading data only for logged-in users

### 4.2 Data Migration

#### Migration strategy:

1. **Update existing profiles** - add required authentication fields
2. **Session migration** - transition from hardcoded ID to real Supabase sessions
3. **RLS update** - enable security policies for production

### 4.3 Integration Testing

#### Testing strategy:

1. **Unit tests** - authentication component tests
2. **Integration tests** - registration/login flow tests
3. **E2E tests** - full user scenarios with Cypress/Playwright
4. **Security tests** - penetration tests of sensitive endpoints

## 5. IMPLEMENTATION AND DEPLOYMENT

### 5.1 Implementation Order

#### Phase 1: Authentication Foundation

1. Supabase Auth configuration
2. Route protection middleware implementation
3. Simple authentication pages (login/register)
4. Integration with existing components

#### Phase 2: Advanced Features

1. Password reset
2. Household management during registration
3. Full validation and error handling
4. UI/UX improvements

#### Phase 3: Security and Optimization

1. RLS policy implementation
2. Rate limiting addition
3. Performance optimization
4. Monitoring and logging

### 5.2 Environment Configuration

#### Environment variables:

```env
# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Auth configuration
PUBLIC_SITE_URL=https://home-crew.app
AUTH_REDIRECT_URL=/daily_chores
```

### 5.3 Monitoring and Maintenance

#### Metrics to monitor:

- Number of daily registrations/logins
- Authentication endpoint response times
- Authentication error rates
- User session lifetimes

---

**Specification developed based on requirements from `prd.md` and technology stack from `tech-stack.md`. Ensures full compliance with existing application architecture while adding a complete authentication system.**
