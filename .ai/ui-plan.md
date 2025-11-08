# Architektura UI dla Home Crew

## 1. Przegląd struktury UI

Architektura UI aplikacji Home Crew została zaprojektowana jako responsywna aplikacja webowa oparta na frameworku Astro z komponentami React, skupiająca się na zarządzaniu obowiązkami domowymi w gospodarstwach domowych. Główny nacisk położono na:

- **Responsywność**: Grid layout automatycznie dostosowujący się do urządzeń desktop/tablet/mobile
- **Dostępność**: Pełne wsparcie ARIA (labels, role, live regions), nawigacja klawiszowa, kompatybilność ze screen readerami
- **Bezpieczeństwo**: Role-based UI controls ukrywające funkcje administracyjne dla zwykłych członków
- **UX**: Główny widok dzienny jako centrum nawigacji, collapsible sidebar, drag-and-drop między kolumnami To Do/Done z fallback dla urządzeń mobilnych

Aplikacja wykorzystuje shadcn/ui i Tailwind CSS dla spójnego design system, React Context dla globalnego zarządzania stanem oraz React Query dla efektywnego cachowania i aktualizacji danych API.

## 2. Lista widoków

### 2.1 Landing z autentyfikacją

- **Ścieżka**: `/`
- **Główny cel**: Przywitanie niezalogowanych użytkowników i jednoczesne umożliwienie rejestracji/logowania na jednej stronie
- **Kluczowe informacje**: Logo aplikacji, hasło reklamowe u góry; przełącznik rejestracja/logowanie poniżej, wieloetapowy proces rejestracji z wyborem roli (admin/członek), formularze rejestracji/logowania, wybór typu użytkownika, PIN dla członków
- **Kluczowe komponenty**: Welcome header (logo, tagline), auth toggle, multi-step forms, validation feedback, role selector
- **UX**: U góry powitanie, poniżej formularze; przełącznik między rejestracją a logowaniem, walidacja w czasie rzeczywistym, clear error messages, success redirect do dashboardu
- **Dostępność**: ARIA labels na wszystkich przyciskach, form labels, error announcements, keyboard navigation między sekcjami i przełącznikiem
- **Bezpieczeństwo**: Secure password fields, role-based validation, protection przed 409/422 errors, publiczny dostęp do sekcji powitalnej

### 2.3 Główny widok dzienny (Daily View)

- **Ścieżka**: `/daily_chores` (po zalogowaniu)
- **Główny cel**: Centrum aplikacji - przegląd obowiązków na wybrany dzień z możliwością zarządzania
- **Kluczowe informacje**: Dwie kolumny To Do/Done, lista zadań z przypisaniami, punkty użytkownika, data picker
- **Kluczowe komponenty**: Chore columns, date navigator, add chore button, points badge, collapsible sidebar
- **UX**: Drag-and-drop między kolumnami z mobile fallback, optimistic updates, toast notifications
- **Dostępność**: ARIA live regions dla status updates, keyboard navigation, screen reader support dla zadań
- **Bezpieczeństwo**: Role-based controls (tylko admin widzi niektóre funkcje), assignee validation

### 2.4 Zarządzanie gospodarstwem (Household Management)

- **Ścieżka**: `/household`
- **Główny cel**: Admin-only widok zarządzania gospodarstwem i członkami
- **Kluczowe informacje**: Lista członków, PIN gospodarstwa, nazwa gospodarstwa, role użytkowników
- **Kluczowe komponenty**: Member list, PIN display, household settings, role management controls
- **UX**: Clear hierarchy, confirmation dialogs dla destruktywnych akcji
- **Dostępność**: Table navigation, action button labels, screen reader announcements
- **Bezpieczeństwo**: Tylko admin ma dostęp, confirmation dla usunięcia członków, PIN ukryty dla członków

### 2.5 Profil użytkownika (Profile)

- **Ścieżka**: `/profile`
- **Główny cel**: Zarządzanie informacjami osobowymi i przegląd punktów
- **Kluczowe informacje**: Dane użytkownika, całkowite punkty, historia aktywności (poza mvp), avatar
- **Kluczowe komponenty**: Profile form, points summary, activity log, avatar upload
- **UX**: Edit-in-place dla prostych pól, points history z paginacją
- **Dostępność**: Form labels, data table navigation, progress indicators dla punktów
- **Bezpieczeństwo**: Tylko własne dane, validation dla wszystkich pól

### 2.6 Modal dodawania zadania (Add Chore Modal)

- **Ścieżka**: Modal w Daily View (/daily_chores)
- **Główny cel**: Dodanie nowego obowiązku do wybranego dnia z katalogu
- **Kluczowe informacje**: Katalog zadań (predefiniowane + mozliwośc dodania własnego), wybór daty/czasu/przypisania
- **Kluczowe komponenty**: Chore catalog browser, date/time selectors, assignee picker
- **UX**: Search/filter w katalogu, validation feedback, success toast
- **Dostępność**: Modal focus management, list navigation, form validation announcements
- **Bezpieczeństwo**: Walidacja limitu 50 zadań dziennie, household context

### 2.7 Modal przypisywania zadania (Assign Chore Modal)

- **Ścieżka**: Modal w Daily View
- **Główny cel**: Zmiana przypisania obowiązku do członka gospodarstwa
- **Kluczowe informacje**: Lista członków gospodarstwa, aktualne przypisanie
- **Kluczowe komponenty**: Member selector, current assignee display
- **UX**: Quick selection, immediate feedback
- **Dostępność**: Radio group navigation, current selection announcement
- **Bezpieczeństwo**: Tylko admin/członek może przypisywać, household validation

### 2.8 Historia punktów (Points History) - opcjonalny

- **Ścieżka**: `/points` lub modal w Profile
- **Główny cel**: Szczegółowy przegląd historii punktów i aktywności
- **Kluczowe informacje**: Lista zdarzeń punktów, filtry dat, podsumowanie
- **Kluczowe komponenty**: Points events table, date filters, summary stats
- **UX**: Paginated list, filter controls, export option (future)
- **Dostępność**: Table navigation, filter controls, data announcements
- **Bezpieczeństwo**: Tylko własne dane, date range validation

## 3. Mapa podróży użytkownika

### Główny przypadek użycia: Zarządzanie obowiązkami domowymi

1. **Pierwsze uruchomienie**: Użytkownik odwiedza `/` → jeśli niezalogowany: widzi landing z powitaniem u góry i formularzem rejestracji/logowania poniżej; jeśli zalogowany: automatyczne przekierowanie do Daily View (`/daily_chores`)
2. **Rejestracja**: Wybór roli (admin/członek) → formularz rejestracji → walidacja → sukces → przekierowanie do Daily View
3. **Admin flow**: Tworzenie gospodarstwa (nazwa) → otrzymanie PIN → zaproszenie rodziny
4. **Member flow**: Wprowadzenie PIN → dołączenie do gospodarstwa → dostęp do wspólnych zadań
5. **Codzienne użytkowanie**: Daily View (daily-chores) z zadaniami To Do/Done → dodawanie zadań z katalogu → drag-and-drop do Done → automatyczne przyznanie punktów
6. **Zarządzanie**: Admin może zarządzać członkami w Household Management → członkowie mogą edytować profil

### Kluczowe interakcje:

- **Dodanie zadania**: Przycisk "Dodaj" → modal wyboru z katalogu → konfiguracja → zapis → optimistic update w Daily View. z automatu zadanie przypisywane jest do danego usera, ale jest moliwośc zmiany listy wybranych czlonkow
- **Zmiana statusu**: Drag-and-drop między kolumnami → API call → points award jeśli Done
- **Przypisanie**: Klik na zadanie → modal wyboru członka (jezeli chcemy, aby byl inny niz dany, domyslny user) → update → live update dla wszystkich
- **Nawigacja dni**: Date picker → prefetch sąsiednich dni → smooth transition

## 4. Układ i struktura nawigacji

### Główne poziomy nawigacji:

1. **Publiczny**: Landing page z rejestracją/logowaniem
2. **Chroniony**: Wszystkie pozostałe widoki wymagają autoryzacji

### Struktura nawigacji:

- **Header**: Logo, points badge, user menu (profil, household, logout)
- **Sidebar**: Collapsible menu z: Daily View, Household (admin), Profile, Points History
- **Breadcrumbs**: W widokach zarządzania dla contextu
- **Modals**: Overlay dla akcji (dodaj zadanie, przypisz, potwierdzenia)

### Responsywność nawigacji:

- **Desktop**: Pełna sidebar + header
- **Tablet**: Collapsed sidebar z hamburger menu
- **Mobile**:Collapsed sidebar z hamburger menu

### Navigation guards:

- Role-based visibility (admin functions ukryte dla członków)
- Auth guards przekierowujące niezalogowanych do /
- Loading states podczas sprawdzania uprawnień

## 5. Kluczowe komponenty

### Komponenty UI (shadcn/ui):

- **Button**: Primary/secondary/destructive variants z loading states
- **Card**: Container dla zadań, członków, podsumowań
- **Dialog/Modal**: Overlay dla formularzy i potwierdzeń
- **Input/Textarea**: Form controls z validation
- **Table**: Lista członków, historia punktów
- **Badge**: Status zadania, role, punkty
- **Avatar**: Profile pictures członków

### Komponenty biznesowe:

- **ChoreCard**: Draggable card z tytułem, assignee, czasem, punktami
- **ChoreColumn**: Drop zone dla To Do/Done z limitami
- **DateNavigator**: Picker z prefetching sąsiednich dni
- **PointsBadge**: Header badge z aktualnymi punktami
- **MemberSelector**: Dropdown/radio dla wyboru członka
- **ChoreCatalog**: Searchable list predefiniowanych zadań

### Komponenty systemowe:

- **ErrorBoundary**: Global catch dla błędów z fallback UI
- **ToastProvider**: Notifications dla sukcesów/błędów
- **LoadingSpinner**: Consistent loading states
- **AuthGuard**: Route protection wrapper
- **RoleGuard**: Conditional rendering based on user role

Wszystkie komponenty implementują ARIA attributes, keyboard navigation i responsive design zgodnie z wytycznymi dostępności.
