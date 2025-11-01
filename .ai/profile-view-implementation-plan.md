# Plan implementacji widoku Profil użytkownika

## 1. Przegląd
Widok Profil użytkownika umożliwia użytkownikom przeglądanie i edycję swoich danych osobowych, takich jak nazwa i avatar, oraz wyświetlanie zgromadzonych punktów za ukończone zadania. Jest to kluczowy element aplikacji Home Crew, zapewniający personalizację i motywację poprzez system punktowy, zgodny z wymaganiami bezpieczeństwa i prywatności danych.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/profile`. W aplikacji Astro należy utworzyć plik `src/pages/profile.astro` lub `src/pages/profile.tsx` z odpowiednią konfiguracją routingu.

## 3. Struktura komponentów
- **ProfileView**: Główny komponent strony, zawierający layout i zarządzanie stanem.
  - **ProfileForm**: Formularz edycji profilu z polami nazwy i avatara.
  - **PointsDisplay**: Komponent wyświetlający całkowitą liczbę punktów użytkownika.

## 4. Szczegóły komponentów
### ProfileView
- **Opis komponentu**: Główny komponent widoku, odpowiedzialny za ładowanie danych profilu, zarządzanie stanem i renderowanie podkomponentów. Składa się z nagłówka, formularza edycji i sekcji punktów.
- **Główne elementy**: `<div>` kontener z `<h1>` tytułem, `<ProfileForm>`, `<PointsDisplay>`.
- **Obsługiwane zdarzenia**: onLoad (pobranie danych), onFormSubmit (aktualizacja profilu).
- **Warunki walidacji**: Walidacja pól formularza zgodnie z API (name: 1-100 znaków, avatar_url: opcjonalny URL). Błędy walidacji wyświetlane w czasie rzeczywistym.
- **Typy**: ProfileDTO dla danych profilu, ViewModel dla stanu formularza.
- **Propsy**: Brak (komponent główny).

### ProfileForm
- **Opis komponentu**: Formularz do edycji nazwy użytkownika i avatara, z przyciskiem zapisu. Wykorzystuje shadcn/ui dla pól input i button.
- **Główne elementy**: `<form>` z `<Input>` dla name, `<Input>` dla avatar_url, `<Button>` submit.
- **Obsługiwane zdarzenia**: onChange pól, onSubmit formularza.
- **Warunki walidacji**: name wymagane, ≤100 znaków, trimmed; avatar_url opcjonalne, musi być prawidłowym URL jeśli podane.
- **Typy**: UpdateProfileCmd dla danych formularza, ProfileDTO dla wstępnego wypełnienia.
- **Propsy**: { profile: ProfileDTO, onUpdate: (data: UpdateProfileCmd) => Promise<void> }

### PointsDisplay
- **Opis komponentu**: Prosty komponent wyświetlający liczbę punktów, używający badge z shadcn/ui.
- **Główne elementy**: `<Badge>` lub `<span>` z tekstem punktów.
- **Obsługiwane zdarzenia**: Brak (tylko wyświetlanie).
- **Warunki walidacji**: Brak.
- **Typy**: ProfileDTO.total_points (number) - punkty obliczane na świeżo z aktualnych zadań.
- **Propsy**: { points: number }

## 5. Typy
- **ProfileDTO**: { id: string, name: string, avatar_url: string | null, total_points: number } - DTO z API dla danych profilu.
- **UpdateProfileCmd**: { name: string, avatar_url?: string | null } - Command dla aktualizacji.
- **ProfileFormViewModel**: { formData: UpdateProfileCmd, isLoading: boolean, errors: Record<string, string> } - ViewModel dla stanu formularza, zawierający dane, flagę ładowania i błędy walidacji.

## 6. Zarządzanie stanem
Stan zarządzany jest przez główny komponent ProfileView z użyciem useState dla profilu i formularza. Dla złożonych operacji zalecany jest custom hook `useProfile`, który obsługuje fetch i update via API, zwracając { profile, loading, error, updateProfile }.

## 7. Integracja API
Integracja z endpointem `/v1/profiles/me` (GET dla pobrania, PATCH dla aktualizacji). Żądanie GET zwraca ProfileDTO, PATCH przyjmuje UpdateProfileCmd i zwraca zaktualizowany ProfileDTO. Użyj Supabase client z context.locals w Astro routes. Obsługuj JWT token automatycznie.

## 8. Interakcje użytkownika
- **Edycja nazwy**: Użytkownik wpisuje nową nazwę w polu input, walidacja w czasie rzeczywistym.
- **Edycja avatara**: Opcjonalne pole URL, walidacja formatu URL.
- **Zapisywanie**: Kliknięcie przycisku submit wysyła PATCH, wyświetla toast sukcesu lub błędy.
- **Przegląd punktów**: Statyczne wyświetlanie punktów bez interakcji.

## 9. Warunki i walidacja
- **Name**: Wymagane, 1-100 znaków, trimmed, sprawdzane przez Zod schema w komponencie.
- **Avatar URL**: Opcjonalne, musi być prawidłowym URL jeśli podane, walidacja w formularzu.
- **Stan interfejsu**: Przy błędach walidacji przycisk submit disabled, komunikaty błędów wyświetlane pod polami.

## 10. Obsługa błędów
- **Błędy API**: 401 - przekierowanie do logowania, 422 - wyświetl błędy walidacji z API, 404 - komunikat "profil nie znaleziony", 500 - ogólny błąd serwera.
- **Błędy sieci**: Toast z komunikatem "problem z połączeniem", możliwość retry.
- **Błędy walidacji**: Wyświetlanie pod polami formularza, blokowanie submit.

## 11. Kroki implementacji
1. Utwórz plik `src/pages/profile.astro` z podstawowym layoutem.
2. Zaimplementuj komponent ProfileView z ładowaniem danych.
3. Utwórz ProfileForm z walidacją przy użyciu React Hook Form i shadcn/ui.
4. Dodaj PointsDisplay jako prosty komponent.
5. Zintegruj API calls w useProfile hook.
6. Dodaj obsługę błędów i toasty dla feedbacku użytkownika.
7. Przetestuj responsywność i dostępność zgodnie z shadcn/ui.
8. Przeprowadź testy integracyjne z backendem.
