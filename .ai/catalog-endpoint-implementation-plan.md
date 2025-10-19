# API Endpoint Implementation Plan: POST /v1/catalog – Add Custom Chore

## 1. Przegląd punktu końcowego
Dodaje nowe zadanie (chore) do katalogu gospodarstwa domowego. Umożliwia członkowi gospodarstwa utworzenie własnej pozycji w `chores_catalog`. Pozycje globalne (predefined) są dodawane administracyjnie i nie należą do zakresu tego endpointu.

## 2. Szczegóły żądania
- **Metoda HTTP:** `POST`
- **URL:** `/v1/catalog`
- **Autoryzacja:** wymagany ważny JWT Supabase (session) — endpoint dostępny tylko dla zalogowanych użytkowników.
- **Parametry URL / query:** brak
- **Request Body (JSON):**
  | Pole | Typ | Wymagane | Walidacja |
  |------|-----|----------|-----------|
  | `title` | `string` | ✓ | niepuste, `≤50` znaków, `trim()` |
  | `category` | `string` | ✓ | enum lub wolny tekst (wg spec), niepuste |
  | `points` | `number` | ✓ | `0 ≤ points ≤ 100` && `points % 5 === 0` |
  | `time_of_day` | `'morning' \| 'afternoon' \| 'evening' \| 'night' \| 'any'` | ✗ | domyślnie `'any'` |
  | `emoji` | `string` | ✗ | dowolny pojedynczy emoji / krótki tekst |

Przykład:
```json
{
  "title": "Take out trash",
  "category": "cleaning",
  "points": 10,
  "time_of_day": "evening",
  "emoji": "🗑️"
}
```

## 3. Wykorzystywane typy
- **CreateCatalogItemCmd** – z `src/types.ts` (po zmianie: opcjonalne `time_of_day`, `emoji`).
- **CatalogItemDTO** – zwraca pełny rekord, w tym `created_by_user_id` oraz `deleted_at` (pozostaje `null` dla aktywnych pozycji).

## 4. Szczegóły odpowiedzi
| Kod stanu | Opis | Treść (`application/json`) |
|-----------|------|---------------------------|
| **201** | Utworzono | `CatalogItemDTO` nowo utworzonego wiersza |
| 400 | Nieprawidłowe dane wejściowe (Walidacja Zod) | `{ error: "Validation error", details }` |
| 401 | Brak autoryzacji | `{ error: "Unauthorized" }` |
| 404 | Użytkownik nie należy do gospodarstwa | `{ error: "Household not found" }` |
| 409 | Duplikat tytułu w katalogu | `{ error: "Duplicate title" }` |
| 500 | Błąd serwera | `{ error: "Internal server error" }` |

## 5. Przepływ danych
1. Klient wysyła `POST /v1/catalog` z JSON body.
2. Astro API route (`src/pages/api/v1/catalog.ts`):
   1. Pobiera `supabase` z `context.locals` i sesję (`getSession()`).
   2. Waliduje body poprzez Zod -> `CreateCatalogItemCmd`.
   3. Ustala `userId = session.user.id`.
   4. Pobiera gospodarstwo użytkownika (`SELECT household_id FROM household_members WHERE user_id = :userId`).
   5. Wywołuje `createCatalogItem()` w serwisie.
3. Serwis `src/lib/services/choresCatalog.ts#createCatalogItem`:
   - Sprawdza duplikat: `SELECT 1 FROM chores_catalog WHERE household_id = :hh AND lower(title)=lower(:title) AND deleted_at IS NULL`.
   - Wykonuje `INSERT INTO chores_catalog (...) VALUES (...) RETURNING *`.
   - Mapuje rekord → `CatalogItemDTO` i zwraca.
4. Endpoint zwraca `201` z danymi DTO.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Supabase JWT (middleware już sprawdza sesję).
- **Autoryzacja:** RLS na `chores_catalog` + jawne sprawdzenie, że użytkownik należy do gospodarstwa.
- **Mass-assignment:** Serwer ignoruje/generuje `household_id`, `predefined`, `created_by_user_id`, `created_at`.
- **SQLi:** Supabase używa zapytań parametryzowanych.
- **Rate-limit:** (do rozważenia) — middleware lub Reverse Proxy.

## 7. Obsługa błędów
| Scenariusz | Kod | Obsługa |
|------------|-----|---------|
| Brak JWT lub nieważna sesja | 401 | Zwróć błąd `Unauthorized`. |
| Użytkownik nie ma gospodarstwa | 404 | „Household not found”. |
| Walidacja Zod nie przechodzi | 400 | Szczegóły z Zod w `details`. |
| Duplikat `(household_id, lower(title))` | 409 | Błąd unikalności Postgres — mapuj na `Duplicate title`. |
| Inne błędy DB/serwera | 500 | Log `console.error`, zwróć generic. |

## 8. Rozważania dotyczące wydajności
- Operacja pojedynczego inserta → O(1).
- Indeks `idx_catalog_household_predefined` przyspiesza sprawdzenie duplikatu.`SELECT` używa tego indeksu.
- Brak ciężkich obliczeń. Request time << 50 ms.

## 9. Etapy wdrożenia
1. **Zod schema** (CreateCatalogItemCmdSchema) w `src/lib/services/choresCatalog.ts`.
2. **Serwis** `createCatalogItem()` + export w tym pliku.
3. **Endpoint** `src/pages/api/v1/catalog.ts`:
   - GET session, walidacja, pobranie household, wywołanie serwisu, obsługa błędów.
4. **Dokumentacja** README/API-ref — dodaj sekcję endpointu.
5. **CI** — uruchom testy; brak zmian w migracjach.
6. **Commit:** `feat(api): add POST /v1/catalog endpoint` (ticket prefix wg branch).
