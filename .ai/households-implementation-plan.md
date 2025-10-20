# API Endpoint Implementation Plan: POST /v1/households

## 1. Przegląd punktu końcowego
Ten endpoint umożliwia utworzenie nowego gospodarstwa domowego (household). Jest to operacja dostępna tylko dla użytkowników, którzy jeszcze nie należą do żadnego gospodarstwa. Po pomyślnym utworzeniu, użytkownik automatycznie zostaje administratorem nowo utworzonego gospodarstwa. Endpoint generuje 6-cyfrowy kod PIN, który jest zwracany tylko raz w odpowiedzi i może być użyty przez innych użytkowników do dołączenia do gospodarstwa.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Ścieżka URL**: `/v1/households`
- **Parametry**:
  - **Wymagane**: Brak parametrów URL/query
  - **Opcjonalne**: Brak
- **Request Body**:
```json
{
  "name": "string (wymagane, ≤ 100 znaków)"
}
```

## 3. Wykorzystywane typy
- **CreateHouseholdCmd**: `{ name: string }` - command model dla request body
- **CreateHouseholdDTO**: `{ id: string, name: string, pin: string }` - response DTO
- **HouseholdRow**: Pełny wiersz z tabeli `households`
- **MemberRow**: Pełny wiersz z tabeli `household_members`

## 4. Szczegóły odpowiedzi
- **Status 201 Created**:
```json
{
  "id": "uuid",
  "name": "string",
  "pin": "string (6 cyfr, zwracane tylko raz)"
}
```
- **Status 400 Bad Request**: Nieprawidłowe dane wejściowe (JSON parse error, walidacja Zod)
- **Status 409 Conflict**: Użytkownik już należy do gospodarstwa
- **Status 422 Validation Failed**: Błędne dane (nazwa pusta/przekracza limit)
- **Status 500 Internal Server Error**: Błędy serwera/bazy danych

## 5. Przepływ danych
1. **Walidacja request body** → Zod schema validation
2. **Sprawdzenie autoryzacji** → Weryfikacja JWT token (via Supabase)
3. **Sprawdzenie istniejącego członkostwa** → Query `household_members` dla `auth.uid()`
4. **Generowanie PIN** → Tworzenie 6-cyfrowego kodu PIN + bcrypt hash
5. **Transakcja bazy danych**:
   - INSERT into `households` (name, pin_hash, pin_expires_at, timezone)
   - INSERT into `household_members` (household_id, user_id, role='admin')
6. **Zwracanie odpowiedzi** → CreateHouseholdDTO z PIN (tylko raz)

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Wymagany ważny JWT token Supabase
- **Autoryzacja biznesowa**: Użytkownik nie może należeć do żadnego gospodarstwa (constraint `unique_user_household`)
- **Walidacja danych**: Zod schema validation dla request body
- **Rate limiting**: 100 requestów/min/IP (middleware)
- **RLS**: Polityki dostępu na poziomie wierszy w Supabase
- **PIN Security**: bcrypt hash dla PIN, expires_at dla bezpieczeństwa
- **Input sanitization**: Trim i walidacja długości nazwy

## 7. Obsługa błędów
- **400 Bad Request**:
  - Invalid JSON: `"Invalid JSON in request body"`
  - Validation error: `"Validation error"` z details tablicą
- **401 Unauthorized**:
  - Missing/invalid JWT: `"Unauthorized"`
- **409 Conflict**:
  - User already in household: `"User already belongs to a household"`
- **422 Validation Failed**:
  - Name validation: `"Name cannot be empty"` lub `"Name must be 100 characters or less"`
- **500 Internal Server Error**:
  - Database errors: `"Internal server error"`
  - PIN generation errors: `"Internal server error"`

## 8. Rozważania dotyczące wydajności
- **Indeksy**: Wykorzystanie istniejącego `idx_members_household` dla sprawdzenia członkostwa
- **Transakcja**: Atomiczne operacje INSERT dla consistency
- **Caching**: Brak potrzeby cache dla tej operacji (rzadko wykonywana)
- **Database load**: Minimalny wpływ - 2 INSERT operations
- **PIN generation**: bcrypt hash - koszt obliczeniowy akceptowalny

## 9. Etapy wdrożenia

### Faza 1: Przygotowanie service
1. Utworzyć `src/lib/households.service.ts`
2. Zdefiniować Zod schema dla `CreateHouseholdCmd`
3. Zaimplementować funkcję `generateHouseholdPin()` (6 cyfr + bcrypt)
4. Zaimplementować funkcję `createHousehold()` z walidacją biznesową

### Faza 2: Implementacja endpointu
1. Utworzyć `src/pages/api/v1/households.ts`
2. Implementować obsługę POST z wzorca catalog endpoint
3. Dodać walidację autoryzacji i członkostwa
4. Implementować error handling zgodnie ze specyfikacją

### Faza 3: Testowanie i walidacja
1. Test jednostkowy dla service functions
2. Test integracyjny dla endpointu
3. Test przypadków błędów (409, 422, etc.)
4. Walidacja RLS policies

### Faza 4: Dokumentacja i deployment
1. Zaktualizować API documentation
2. Dodać JSDoc comments
3. Test E2E w środowisku staging
4. Deploy do produkcji
