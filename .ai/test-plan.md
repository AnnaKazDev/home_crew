# Test Plan - Home Crew

## Introduction and Testing Goals

The goal of this test plan is to ensure high quality of the Home Crew application through systematic testing of all key functionalities. The Home Crew project is a household task management application, built on Astro 5, React 19, TypeScript 5, Tailwind CSS 4, and Supabase.

Main testing goals:

- Ensure application security, especially in critical areas of authorization and PIN hashing
- Verify correct operation of points and tasks system
- Test integration with Supabase database and RLS policies
- Ensure application responsiveness and accessibility
- Verify performance with large amounts of data

## Test Scope

### Included scope:

- **Authorization and security**: registration, login, PIN hashing, route protection
- **Household management**: household creation, PIN joining, member management
- **Task system**: task catalog, daily tasks, drag & drop, task statuses
- **Points system**: point awarding, points history, statistics
- **User profiles**: profile editing, statistics display
- **Responsiveness**: mobile, tablet, and desktop device support
- **Supabase integration**: API endpoints, realtime subscriptions, RLS policies

### Excluded scope:

- Supabase infrastructure load tests (we assume standard performance)
- Browser compatibility tests for browsers older than 2 years
- WCAG 2.1 AA accessibility tests (only basic requirements)

## Test Types to Conduct

### 1. Unit Tests

- **Framework**: Vitest + React Testing Library
- **Coverage**: React components, hooks, utility functions, validations
- **Location**: `tests/unit/`
- **Running**: `npm run test:unit`

### 2. Integration Tests

- **Framework**: Vitest + MSW (Mock Service Worker) + Supertest
- **Coverage**: API endpoints, Supabase integration, business flows, direct API tests
- **Location**: `tests/integration/`
- **Running**: `npm run test:integration`

### 3. Component Tests

- **Framework**: Storybook + Vitest
- **Coverage**: Isolated testing of React components with different states and props
- **Location**: `tests/component/` + `.storybook/`
- **Running**: `npm run test:component`

### 4. End-to-End Tests (E2E)

- **Framework**: Playwright
- **Coverage**: full user scenarios, responsiveness, accessibility, visual tests
- **Location**: `tests/e2e/`
- **Running**: `npm run test:e2e`

### 5. Performance Tests

- **Framework**: Lighthouse CI + Playwright
- **Coverage**: Core Web Vitals, loading time, performance with large amounts of data
- **Location**: `tests/performance/`
- **Running**: `npm run test:performance`

### 6. Security Tests

- **Framework**: OWASP ZAP + Snyk + Semgrep + custom scripts
- **Coverage**: authorization, PIN hashing, RLS policies, rate limiting, SAST, dependency scanning
- **Location**: `tests/security/`
- **Running**: `npm run test:security`

## Test Scenarios for Key Functionalities

### Scenario 1: New Household Registration (CRITICAL PRIORITY)

**Prerequisites**: User is not logged in
**Steps**:

1. User navigates to `/auth` page
2. Selects administrator registration mode
3. Enters email and password
4. System creates household and generates 6-digit PIN
5. Displays green card with PIN

**Expected results**:

- PIN is properly hashed (bcrypt)
- Household is created in database
- User is automatically logged in
- PIN is displayed only to administrator

### Scenario 2: Member Joining Household

**Prerequisites**: Household exists with active PIN
**Steps**:

1. User navigates to `/auth` page
2. Selects member registration mode
3. Enters email, password and 6-digit PIN
4. System validates PIN and adds user to household

**Expected results**:

- PIN is properly verified
- User becomes household member
- Profile is automatically created

### Scenario 3: Adding Daily Task

**Prerequisites**: User is logged in and belongs to household
**Steps**:

1. User navigates to `/daily-chores` page
2. Clicks "Add task" button
3. Selects task from catalog or creates custom one
4. Assigns task to household member
5. Sets execution time

**Expected results**:

- Task is added to database
- Appears in appropriate column (morning/evening)
- All household members can see the task

### Scenario 4: Marking Task as Completed

**Prerequisites**: Task exists in "todo" status
**Steps**:

1. User drags task to "Done" column or clicks completion button
2. System updates task status
3. Awards points to executor

**Expected results**:

- Task status changes to "done"
- Points are added to user's profile
- Update is visible to all members

### Scenariusz 5: Wyświetlanie statystyk punktów

**Warunki wstępne**: Użytkownik ma ukończone zadania
**Kroki**:

1. Użytkownik przechodzi na stronę `/profile`
2. Przegląda sekcję punktów

**Oczekiwane rezultaty**:

- Wyświetlane są całkowite punkty
- Widoczna jest historia punktów
- Statystyki są podzielone na okresy

## Środowisko testowe

### Środowisko lokalne deweloperskie:

```bash
# Pliki środowiskowe
.env.test          # zmienne dla testów
.env.local         # zmienne lokalne

# Konfiguracja narzędzi
playwright.config.ts   # Playwright E2E
vitest.config.ts       # Vitest jednostkowe/integracyjne
lighthouserc.js        # Lighthouse CI
```

### Baza danych testowa:

- **Supabase Local**: dla testów integracyjnych i E2E
- **Test Database**: oddzielna instancja dla testów
- **Seed Data**: `supabase/seed.sql` z danymi testowymi

### Infrastruktura CI/CD:

- **GitHub Actions**: pełne pipeline testowe
- **Docker**: konteneryzacja środowiska testowego
- **Preview Deployments**: testy na staging

## Narzędzia do testowania

### Testy jednostkowe i integracyjne:

```json
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "msw": "^2.0.0",
  "supertest": "^6.3.0",
  "@supabase/supertest": "^1.0.0"
}
```

### Testy E2E:

```json
{
  "playwright": "^1.40.0",
  "@playwright/test": "^1.40.0",
  "codecov": "^3.8.0"
}
```

### Testy wydajnościowe:

```json
{
  "lighthouse": "^11.0.0",
  "@lhci/cli": "^0.12.0"
}
```

### Testy bezpieczeństwa:

```json
{
  "@types/jest": "^29.0.0",
  "snyk": "^1.1200.0",
  "semgrep": "^1.50.0"
}
```

### Testy komponentowe:

```json
{
  "@storybook/react": "^7.6.0",
  "@storybook/test-runner": "^0.16.0",
  "storybook": "^7.6.0"
}
```

### Dodatkowe narzędzia:

- **ESLint**: linting kodu
- **Prettier**: formatowanie kodu
- **Biome**: superszybka alternatywa dla ESLint + Prettier (opcja)
- **TypeScript**: sprawdzanie typów
- **Husky**: git hooks dla testów pre-commit
- **Codecov**: monitorowanie pokrycia kodu

## Harmonogram testów

### Faza 1: Konfiguracja infrastruktury (Tydzień 1)

- [ ] Instalacja narzędzi testowych
- [ ] Konfiguracja Vitest i Playwright
- [ ] Utworzenie struktury katalogów testów
- [ ] Konfiguracja CI/CD pipeline

### Faza 2: Testy krytyczne - Bezpieczeństwo (Tydzień 2)

- [ ] Konfiguracja Snyk i Semgrep
- [ ] Testy hashowania PIN-ów
- [ ] Testy autoryzacji i sesji
- [ ] Testy ochrony route'ów
- [ ] Testy RLS policies
- [ ] SAST scanning z Semgrep

### Faza 3: Testy komponentowe i jednostkowe (Tydzień 3)

- [ ] Konfiguracja Storybook
- [ ] Testy komponentów React (jednostkowe)
- [ ] Testy hooków i utilities
- [ ] Testy komponentowe w Storybook

### Faza 4: Testy integracyjne i E2E (Tydzień 4)

- [ ] Testy API z Supertest
- [ ] Integracja z Supabase
- [ ] Pełne scenariusze użytkownika w Playwright
- [ ] Testy wizualne
- [ ] Testy responsywności
- [ ] Testy dostępności

### Faza 5: Regresja i optymalizacja (Tydzień 5)

- [ ] Konfiguracja Codecov
- [ ] Testy regresji wszystkich typów
- [ ] Optymalizacja pokrycia kodu (>80%)
- [ ] Testy wydajnościowe
- [ ] Dokumentacja testów i Storybook
- [ ] Szkolenie zespołu

## Kryteria akceptacji testów

### Kryteria zakończenia fazy:

- **Pokrycie kodu**: minimum 80% dla komponentów krytycznych
- **Pokrycie funkcjonalności**: 100% kluczowych scenariuszy
- **Czas wykonania**: testy jednostkowe < 5min, E2E < 15min
- **Brak błędów krytycznych**: wszystkie testy bezpieczeństwa przechodzą

### Definicja zakończenia sprintu:

- Wszystkie testy automatyczne przechodzą
- Manualne testy regresji zakończone bez błędów krytycznych
- Dokumentacja testów zaktualizowana
- Code review testów zakończony

## Role i odpowiedzialności w procesie testowania

### QA Engineer / Test Automation Specialist:

- Projektowanie i implementacja automatycznych testów
- Konfiguracja narzędzi CI/CD
- Analiza wyników testów i raportowanie błędów
- Utrzymanie infrastruktury testowej

### Frontend Developer:

- Pisanie testów jednostkowych dla komponentów React
- Testowanie integracji z API
- Debugowanie błędów UI/UX
- Współpraca przy testach E2E

### Backend Developer:

- Testy API endpoints
- Testy integracji z Supabase
- Testy bezpieczeństwa po stronie serwera
- Optymalizacja zapytań bazy danych

### DevOps Engineer:

- Konfiguracja środowiska CI/CD
- Zarządzanie infrastrukturą testową
- Monitorowanie wydajności pipeline
- Zarządzanie kontenerami Docker

### Product Owner:

- Definiowanie kryteriów akceptacji
- Priorytetyzacja scenariuszy testowych
- Ocena ryzyka i planowanie wydań
- Akceptacja wyników testów

## Procedury raportowania błędów

### Klasyfikacja błędów:

#### Krytyczne (P0) - natychmiastowa naprawa:

- Problemy bezpieczeństwa (np. brak hashowania PIN-ów)
- Utrata danych użytkowników
- Nieprawidłowe działanie autoryzacji
- Aplikacja całkowicie niedostępna

#### Wysoki priorytet (P1) - naprawa w bieżącym sprincie:

- Błędy blokujące kluczowe funkcjonalności
- Problemy z wydajnością wpływające na UX
- Błędy bezpieczeństwa niekrytyczne
- Problemy z responsywnością na mobilnych

#### Średni priorytet (P2) - naprawa w następnym sprincie:

- Błędy w funkcjach drugorzędnych
- Problemy wizualne nieblokujące
- Błędy wydajnościowe niekrytyczne

#### Niski priorytet (P3) - naprawa gdy czas pozwoli:

- Sugestie ulepszeń UX
- Błędy kosmetyczne
- Problemy występujące rzadko

### Proces raportowania błędów:

#### 1. Odkrycie błędu:

- QA Engineer dokumentuje błąd z screenshotami/video
- Frontend/Backend Developer weryfikuje błąd lokalnie
- Klasyfikacja priorytetu według kryteriów powyżej

#### 2. Rejestrowanie błędu:

- Utworzenie issue w GitHub z template:
  ```
  ## Opis błędu
  ## Kroki reprodukcji
  ## Oczekiwane zachowanie
  ## Aktualne zachowanie
  ## Środowisko
  ## Priorytet
  ## Screenshot/Video
  ```

#### 3. Naprawa błędu:

- Przypisanie do odpowiedniego developera
- Implementacja fix z testami regresji
- Code review
- Testy integracyjne

#### 4. Weryfikacja naprawy:

- QA Engineer weryfikuje fix
- Testy automatyczne przechodzą
- Testy regresji wykonywane
- Product Owner akceptuje rozwiązanie

### Narzędzia do śledzenia błędów:

- **GitHub Issues**: główne narzędzie do śledzenia
- **Linear/Jira**: alternatywa dla złożonych projektów
- **Discord/Slack**: komunikacja zespołu
- **Miro/Figma**: wizualizacja złożonych błędów UI

### Metryki jakości:

- **Defect Density**: liczba błędów na 1000 linii kodu
- **Mean Time To Resolution**: średni czas naprawy błędu
- **Test Coverage**: procent pokrycia kodu testami
- **Automation Rate**: procent testów zautomatyzowanych

---

_Ten plan testów został utworzony na podstawie analizy projektu Home Crew i powinien być regularnie aktualizowany wraz z rozwojem aplikacji. Wszystkie krytyczne problemy bezpieczeństwa zidentyfikowane podczas analizy muszą być naprawione przed wdrożeniem do produkcji._
