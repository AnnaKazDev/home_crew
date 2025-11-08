# SPECYFIKACJA ARCHITEKTURY MODUŁU AUTENTYKACJI - HOME CREW

## WSTĘP

Niniejsza specyfikacja opisuje kompleksową architekturę modułu rejestracji, logowania i odzyskiwania hasła dla aplikacji Home Crew, zgodną z wymaganiami zdefiniowanymi w `prd.md` oraz wykorzystującą technologię Supabase Auth w połączeniu z architekturą Astro + React.

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura stron i routingu

#### Nowe strony autentykacji (tryb non-auth):

- **`/auth`** - Główna strona autentykacji (Astro)
  - Komponent: `AuthPage.astro`
  - Zawiera przełącznik między rejestracją a logowaniem
  - Responsywny design dla desktop/tablet/mobile
  - Automatyczne przekierowanie dla zalogowanych użytkowników

#### Modyfikacje istniejących stron (ochrona przed dostępem niezalogowanych):

- **`/`** (index.astro) - Strona powitalna
  - **Modyfikacja**: Dodanie middleware przekierowującego do `/daily_chores` dla zalogowanych użytkowników
  - **Modyfikacja**: Dla niezalogowanych - wyświetlanie strony powitalnej z przyciskami do rejestracji/logowania

- **`/daily_chores`** - Główny widok aplikacji
  - **Modyfikacja**: Dodanie middleware wymagającego autentykacji
  - **Zachowanie**: Przekierowanie do `/auth` dla niezalogowanych użytkowników

- **`/household`** - Zarządzanie gospodarstwem
  - **Modyfikacja**: Dodanie middleware wymagającego autentykacji
  - **Zachowanie**: Przekierowanie do `/auth` dla niezalogowanych użytkowników

- **`/profile`** - Profil użytkownika
  - **Modyfikacja**: Dodanie middleware wymagającego autentykacji
  - **Zachowanie**: Przekierowanie do `/auth` dla niezalogowanych użytkowników

- **`/chores`** - Katalog zadań
  - **Modyfikacja**: Dodanie middleware wymagającego autentykacji
  - **Zachowanie**: Przekierowanie do `/auth` dla niezalogowanych użytkowników

### 1.2 Komponenty React (client-side islands)

#### Nowe komponenty autentykacji:

- **`AuthForm.tsx`** - Główny komponent formularza autentykacji
  - Props: `{ mode: 'login' | 'register' | 'reset-password' }`
  - Stan wewnętrzny: loading, errors
  - Integracja z Supabase Auth
  - Walidacja pól w czasie rzeczywistym

- **`LoginForm.tsx`** - Formularz logowania
  - Pola: email, password
  - Przycisk "Zapomniałeś hasła?"
  - Przycisk "Zaloguj się"

- **`RegisterForm.tsx`** - Formularz rejestracji
  - Pola: name (login/nick), email, password, confirmPassword, role (radio: Admin/Członek), householdName (tylko dla roli Admin), pin (tylko dla roli Członek)
  - Dynamiczne wyświetlanie pól w zależności od wybranej roli
  - Przycisk "Zarejestruj się"
  - Success screen dla admina pokazujący PIN gospodarstwa

- **`ResetPasswordForm.tsx`** - Formularz resetowania hasła
  - Pola: email
  - Przycisk "Wyślij link resetujący"

- **`AuthModeToggle.tsx`** - Przełącznik między trybami
  - Przyciski: "Mam konto" / "Nie mam konta"
  - Animacje przejścia między formularzami

#### Modyfikacje istniejących komponentów:

- **`AppHeader.tsx`**
  - **Dodanie**: Przycisk "Wyloguj się" obok powitania użytkownika
  - **Modyfikacja**: Warunkowe wyświetlanie powitania tylko dla zalogowanych użytkowników
  - **Dodanie**: Obsługa akcji wylogowania z Supabase Auth

- **`HamburgerMenu.tsx`**
  - **Dodanie**: Element menu "Wyloguj się" dla urządzeń mobilnych

### 1.3 Context i hooki autentykacji

#### Nowe hooki:

- **`useAuthRedirect.ts`** - Hook do automatycznego przekierowania niezalogowanych użytkowników
  ```typescript
  interface UseAuthRedirectReturn {
    isAuthenticated: boolean;
    loading: boolean;
    user: User | null;
  }
  ```

#### Istniejące hooki (rozszerzone):

- **`useAuthStore`** (Zustand) - Główny store zarządzania stanem autentykacji
  - Zarządzanie stanem użytkownika, profilu, gospodarstwa
  - Metody: signIn, signUp, signOut, resetPassword
  - Automatyczna synchronizacja z Supabase Auth

#### Nowe konteksty:

- **`AuthContext.tsx`** - Provider kontekstu autentykacji
  - Zarządzanie stanem globalnym użytkownika
  - Automatyczne odświeżanie sesji
  - Obsługa eventów Supabase Auth

### 1.4 Middleware i ochrona routów

#### Aktualny middleware (`src/middleware/index.ts`):

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  // Inicjalizacja Supabase client
  context.locals.supabase = getSupabaseServiceClient();

  // Autentykacja jest obsługiwana po stronie klienta przez useAuthStore
  // Komponenty używają useAuthRedirect hook do automatycznego przekierowania
  // niezalogowanych użytkowników na /auth

  return next();
});
```

**Uwaga:** W obecnej implementacji ochrona route'ów jest realizowana po stronie klienta przez `useAuthRedirect` hook w komponentach React, a nie przez middleware po stronie serwera. To zapewnia lepsze doświadczenie SPA bez problemów z hydratacją.

### 1.5 Obsługa błędów i walidacja

#### Komponenty błędów:

- **`AuthErrorDisplay.tsx`** - Wyświetlanie błędów autentykacji
  - Mapowanie błędów Supabase na przyjazne komunikaty
  - Obsługa różnych typów błędów (walidacja, sieć, autentykacja)

#### Schematy walidacji (Zod):

```typescript
// src/lib/validation/auth.schemas.ts
export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Imię musi mieć co najmniej 2 znaki')
      .max(50, 'Imię nie może przekraczać 50 znaków'),
    email: z.string().email('Nieprawidłowy adres email'),
    password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'member']),
    pin: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
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
      message: 'PIN musi składać się z 6 cyfr',
      path: ['pin'],
    }
  );
```

### 1.6 Scenariusze użycia i przepływy

#### Scenariusz 1: Rejestracja nowego administratora

1. Użytkownik wchodzi na `/auth`
2. Wybiera tryb rejestracji
3. Wypełnia formularz (name, email, password, role=admin, householdName)
4. Po wysłaniu: tworzenie konta w Supabase Auth + profilu w `profiles`
5. Utworzenie gospodarstwa z podaną nazwą i wygenerowanym 6-cyfrowym PIN
6. Wysłanie emaila potwierdzającego z PIN
7. Wyświetlenie success screen z nazwą gospodarstwa i PIN do udostępnienia członkom rodziny
8. Użytkownik może skopiować PIN lub kliknąć "Continue to App" żeby przejść do `/daily_chores`

#### Scenariusz 2: Rejestracja członka rodziny

1. Użytkownik wchodzi na `/auth`
2. Wybiera tryb rejestracji
3. Wypełnia formularz (name, email, password, role=member, pin=XXXXXX)
4. Walidacja PIN z istniejącym gospodarstwem
5. Po wysłaniu: tworzenie konta + dołączenie do gospodarstwa
6. Przekierowanie do `/daily_chores`

#### Scenariusz 3: Logowanie istniejącego użytkownika

1. Użytkownik wchodzi na `/auth` lub jest przekierowany
2. Wybiera tryb logowania
3. Wypełnia email i hasło
4. Po pomyślnym logowaniu - przekierowanie do `/daily_chores`

#### Scenariusz 4: Reset hasła

1. Użytkownik klika "Zapomniałeś hasła?" w formularzu logowania
2. Przechodzi do trybu resetowania hasła
3. Wprowadza email
4. Otrzymuje email z linkiem resetującym
5. Po kliknięciu w link - nowa strona do ustawienia nowego hasła

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API

#### Nowe endpointy autentykacji:

- **`POST /api/v1/auth/register`** - Rejestracja użytkownika
- **`POST /api/v1/auth/login`** - Logowanie (opcjonalne, może korzystać z Supabase bezpośrednio)
- **`POST /api/v1/auth/logout`** - Wylogowanie
- **`POST /api/v1/auth/reset-password`** - Reset hasła

#### Rozszerzone endpointy istniejące:

- **`POST /api/v1/households`** - Rozszerzony o automatyczne tworzenie gospodarstwa podczas rejestracji admina
- **`POST /api/v1/households/join`** - Dołączanie członka do gospodarstwa podczas rejestracji

### 2.2 Modele danych i DTO

#### Nowe typy autentykacji:

```typescript
// src/types/auth.types.ts
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  pin?: string; // tylko dla członków
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

### 2.3 Walidacja danych wejściowych

#### Schematy walidacji po stronie serwera:

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

### 2.4 Obsługa wyjątków

#### Klasy błędów autentykacji:

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

#### Middleware obsługi błędów:

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
  // obsługa innych błędów...
}
```

### 2.5 Integracja z istniejącymi serwisami

#### Rozszerzenie `profiles.service.ts`:

- Dodanie funkcji `createProfileForAuth`
- Dodanie funkcji `linkProfileToHousehold`

#### Rozszerzenie `households.service.ts`:

- Dodanie funkcji `createHouseholdForAdmin`
- Dodanie funkcji `validateAndJoinHousehold`

## 3. SYSTEM AUTENTYKACJI

### 3.1 Konfiguracja Supabase Auth

#### Ustawienia RLS (Row Level Security):

```sql
-- Włącz RLS dla wszystkich tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Polityki dostępu dla profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Polityki dla households
CREATE POLICY "Household members can view their household" ON households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = households.id
      AND user_id = auth.uid()
    )
  );
```

### 3.2 Integracja z Astro

#### Konfiguracja klienta Supabase:

```typescript
// src/db/supabase.client.ts - rozszerzenie
export function getSupabaseAuthClient(): SupabaseClient {
  const client = getSupabaseClient();

  // Konfiguracja event listenerów autentykacji
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // Automatyczne załadowanie profilu i gospodarstwa
      loadUserData(session.user.id);
    }
  });

  return client;
}
```

#### Obsługa sesji w Astro:

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

### 3.3 Zarządzanie sesjami

#### Automatyczne odświeżanie sesji:

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

### 3.4 Bezpieczeństwo

#### Mechanizmy bezpieczeństwa:

1. **HTTPS only** - wszystkie endpointy wymagają HTTPS
2. **CSRF protection** - dla wrażliwych operacji
3. **Rate limiting** - ograniczenie liczby prób logowania/reset hasła
4. **Password policies** - wymagania siły hasła
5. **Session management** - automatyczne wygasanie sesji
6. **Audit logging** - logowanie wszystkich operacji autentykacji

#### Konfiguracja Supabase Auth:

```typescript
// Konfiguracja w supabase/config.toml
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

## 4. INTEGRACJA Z ISTNIEJĄCYM KODEM

### 4.1 Modyfikacje istniejących komponentów

#### `useProfile.ts` - refaktoryzacja:

- Usunięcie hardcoded user ID
- Integracja z `useAuth` hook
- Użycie prawdziwej autentykacji Supabase

#### `DailyViewWithProvider.tsx`:

- Dodanie sprawdzenia autentykacji przed renderowaniem
- Ładowanie danych tylko dla zalogowanych użytkowników

### 4.2 Migracja danych

#### Strategia migracji:

1. **Aktualizacja istniejących profili** - dodanie wymaganych pól autentykacji
2. **Migracja sesji** - przejście z hardcoded ID na prawdziwe sesje Supabase
3. **Aktualizacja RLS** - włączenie polityk bezpieczeństwa dla produkcji

### 4.3 Testowanie integracji

#### Strategia testów:

1. **Unit tests** - testy komponentów autentykacji
2. **Integration tests** - testy przepływów rejestracji/logowania
3. **E2E tests** - pełne scenariusze użytkownika z Cypress/Playwright
4. **Security tests** - testy penetracyjne wrażliwych endpointów

## 5. WDRAŻANIE I DEPLOYMENT

### 5.1 Kolejność implementacji

#### Faza 1: Podstawa autentykacji

1. Konfiguracja Supabase Auth
2. Implementacja middleware ochrony routów
3. Proste strony autentykacji (login/register)
4. Integracja z istniejącymi komponentami

#### Faza 2: Zaawansowane funkcje

1. Reset hasła
2. Zarządzanie gospodarstwami podczas rejestracji
3. Pełna walidacja i obsługa błędów
4. UI/UX ulepszenia

#### Faza 3: Bezpieczeństwo i optymalizacja

1. Implementacja RLS polityk
2. Dodanie rate limiting
3. Optymalizacja wydajności
4. Monitoring i logowanie

### 5.2 Konfiguracja środowiska

#### Zmienne środowiskowe:

```env
# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Auth configuration
PUBLIC_SITE_URL=https://home-crew.app
AUTH_REDIRECT_URL=/daily_chores
```

### 5.3 Monitoring i utrzymanie

#### Metryki do monitorowania:

- Liczba rejestracji/logowań dziennie
- Czas odpowiedzi endpointów autentykacji
- Rate błędów autentykacji
- Czas życia sesji użytkowników

---

**Specyfikacja opracowana na podstawie wymagań z `prd.md` oraz stacku technologicznego z `tech-stack.md`. Zapewnia pełną zgodność z istniejącą architekturą aplikacji przy jednoczesnym dodaniu kompletnego systemu autentykacji.**
