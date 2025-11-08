# Plan Testów - Home Crew

## Wprowadzenie i cele testowania

Celem tego planu testów jest zapewnienie wysokiej jakości aplikacji Home Crew poprzez systematyczne testowanie wszystkich kluczowych funkcjonalności. Projekt Home Crew to aplikacja do zarządzania zadaniami w gospodarstwie domowym, zbudowana w oparciu o Astro 5, React 19, TypeScript 5, Tailwind CSS 4 oraz Supabase.

Główne cele testowania:

- Zapewnienie bezpieczeństwa aplikacji, szczególnie w krytycznych obszarach autoryzacji i hashowania PIN-ów
- Weryfikacja poprawności działania systemu punktów i zadań
- Testowanie integracji z bazą danych Supabase i politykami RLS
- Zapewnienie responsywności i dostępności aplikacji
- Weryfikacja wydajności przy dużej ilości danych

## Zakres testów

### Zakres uwzględniony:

- **Autoryzacja i bezpieczeństwo**: rejestracja, logowanie, hashowanie PIN-ów, ochrona route'ów
- **Zarządzanie gospodarstwami**: tworzenie gospodarstw, dołączanie przez PIN, zarządzanie członkami
- **System zadań**: katalog zadań, zadania dzienne, drag & drop, statusy zadań
- **System punktów**: przyznawanie punktów, historia punktów, statystyki
- **Profile użytkowników**: edycja profili, wyświetlanie statystyk
- **Responsywność**: obsługa urządzeń mobilnych, tabletów i desktop
- **Integracja Supabase**: API endpoints, realtime subscriptions, RLS policies

### Zakres wykluczony:

- Testy obciążeniowe infrastruktury Supabase (zakładamy standardową wydajność)
- Testy kompatybilności przeglądarek starszych niż 2 lata
- Testy dostępności WCAG 2.1 AA (tylko podstawowe wymagania)

## Typy testów do przeprowadzenia

### 1. Testy jednostkowe (Unit Tests)

- **Framework**: Vitest + React Testing Library
- **Pokrycie**: Komponenty React, hooki, utility functions, walidacje
- **Lokalizacja**: `tests/unit/`
- **Uruchamianie**: `npm run test:unit`

### 2. Testy integracyjne (Integration Tests)

- **Framework**: Vitest + MSW (Mock Service Worker) + Supertest
- **Pokrycie**: API endpoints, integracja z Supabase, przepływy biznesowe, testy bezpośrednie API
- **Lokalizacja**: `tests/integration/`
- **Uruchamianie**: `npm run test:integration`

### 3. Testy komponentowe (Component Tests)

- **Framework**: Storybook + Vitest
- **Pokrycie**: Izolowane testowanie komponentów React z różnymi stanami i props
- **Lokalizacja**: `tests/component/` + `.storybook/`
- **Uruchamianie**: `npm run test:component`

### 4. Testy end-to-end (E2E)

- **Framework**: Playwright
- **Pokrycie**: pełne scenariusze użytkownika, responsywność, dostępność, testy wizualne
- **Lokalizacja**: `tests/e2e/`
- **Uruchamianie**: `npm run test:e2e`

### 5. Testy wydajnościowe (Performance Tests)

- **Framework**: Lighthouse CI + Playwright
- **Pokrycie**: Core Web Vitals, czas ładowania, wydajność przy dużej ilości danych
- **Lokalizacja**: `tests/performance/`
- **Uruchamianie**: `npm run test:performance`

### 6. Testy bezpieczeństwa (Security Tests)

- **Framework**: OWASP ZAP + Snyk + Semgrep + custom scripts
- **Pokrycie**: autoryzacja, hashowanie PIN-ów, RLS policies, rate limiting, SAST, dependency scanning
- **Lokalizacja**: `tests/security/`
- **Uruchamianie**: `npm run test:security`

## Scenariusze testowe dla kluczowych funkcjonalności

### Scenariusz 1: Rejestracja nowego gospodarstwa (PRIORYTET KRYTYCZNY)

**Warunki wstępne**: Użytkownik nie jest zalogowany
**Kroki**:

1. Użytkownik przechodzi na stronę `/auth`
2. Wybiera tryb rejestracji administratora
3. Wprowadza email i hasło
4. System tworzy gospodarstwo i generuje 6-cyfrowy PIN
5. Wyświetla zieloną kartę z PIN-em

**Oczekiwane rezultaty**:

- PIN jest prawidłowo zahashowany (bcrypt)
- Gospodarstwo zostaje utworzone w bazie danych
- Użytkownik zostaje automatycznie zalogowany
- PIN jest wyświetlony tylko administratorowi

### Scenariusz 2: Dołączanie członka do gospodarstwa

**Warunki wstępne**: Istnieje gospodarstwo z aktywnym PIN-em
**Kroki**:

1. Użytkownik przechodzi na stronę `/auth`
2. Wybiera tryb rejestracji członka
3. Wprowadza email, hasło i 6-cyfrowy PIN
4. System waliduje PIN i dołącza użytkownika

**Oczekiwane rezultaty**:

- PIN jest prawidłowo zweryfikowany
- Użytkownik zostaje członkiem gospodarstwa
- Profile zostaje automatycznie utworzony

### Scenariusz 3: Dodawanie zadania dziennego

**Warunki wstępne**: Użytkownik jest zalogowany i należy do gospodarstwa
**Kroki**:

1. Użytkownik przechodzi na stronę `/daily-chores`
2. Klika przycisk "Dodaj zadanie"
3. Wybiera zadanie z katalogu lub tworzy własne
4. Przypisuje zadanie do członka gospodarstwa
5. Ustawia czas wykonania

**Oczekiwane rezultaty**:

- Zadanie zostaje dodane do bazy danych
- Pojawia się w odpowiedniej kolumnie (rano/wieczór)
- Wszystkie członkowie gospodarstwa widzą zadanie

### Scenariusz 4: Oznaczanie zadania jako wykonane

**Warunki wstępne**: Istnieje zadanie w statusie "todo"
**Kroki**:

1. Użytkownik przeciąga zadanie do kolumny "Done" lub klika przycisk ukończenia
2. System aktualizuje status zadania
3. Przyznaje punkty wykonawcy

**Oczekiwane rezultaty**:

- Status zadania zmienia się na "done"
- Punkty zostają dodane do profilu użytkownika
- Aktualizacja jest widoczna dla wszystkich członków

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
