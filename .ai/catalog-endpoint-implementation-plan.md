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
1. **Zod schema** (CreateCatalogItemCmdSchema) w `src/lib/choresCatalog.services.ts`.
2. **Serwis** `createCatalogItem()` + export w tym pliku.
3. **Endpoint** `src/pages/api/v1/catalog.ts`:
   - GET session, walidacja, pobranie household, wywołanie serwisu, obsługa błędów.
4. **Dokumentacja** README/API-ref — dodaj sekcję endpointu.
5. **CI** — uruchom testy; brak zmian w migracjach.
6. **Commit:** `feat(api): add POST /v1/catalog endpoint` (ticket prefix wg branch).

---

# GET /v1/catalog – Fetch Catalog Items

## 1. Przegląd endpointu
Pobiera pozycje katalogu dla gospodarstwa użytkownika. Obsługuje filtrowanie po typie (predefiniowane, custom, lub wszystkie).

## 2. Szczegóły żądania
- **Metoda HTTP:** `GET`
- **URL:** `/v1/catalog?type=all`
- **Query Parameters:**
  - `type` (optional, default: `'all'`): `'all'` | `'predefined'` | `'custom'`

**Przykłady:**
```bash
GET /v1/catalog
GET /v1/catalog?type=all
GET /v1/catalog?type=predefined
GET /v1/catalog?type=custom
```

## 3. Szczegóły odpowiedzi

| Kod stanu | Opis | Treść |
|-----------|------|-------|
| **200** | OK | `CatalogItemDTO[]` |
| 400 | Invalid type parameter | `{ error: "Invalid type parameter", details: "..." }` |
| 404 | Household not found | `{ error: "Household not found" }` |
| 500 | Server error | `{ error: "Internal server error" }` |

**Response 200:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Take out trash",
    "category": "cleaning",
    "points": 10,
    "time_of_day": "evening",
    "emoji": "🗑️",
    "predefined": false,
    "created_by_user_id": "e3b50950-7881-4983-8888-63d3f5ea455d",
    "created_at": "2025-10-19T12:34:56.789Z",
    "deleted_at": null
  }
]
```

## 4. Logika filtrowania
- **type=all**: `(predefined = true AND household_id IS NULL) OR (predefined = false AND household_id = :householdId)`
- **type=predefined**: `predefined = true AND household_id IS NULL`
- **type=custom**: `predefined = false AND household_id = :householdId`

Wszystkie queries exclude soft-deleted items: `AND deleted_at IS NULL`

## 5. Przepływ
1. Parse query parameter `type` z validacją
2. Pobranie household_id użytkownika
3. Wywołanie `getCatalogItems(supabase, householdId, type)`
4. Zwrócenie 200 z tablicą CatalogItemDTO

---

# PATCH /v1/catalog/{id} – Update Catalog Item

## 1. Przegląd endpointu
Aktualizuje pozycję katalogu (partial update). Tylko pola dostarczone w body są zmieniane.

## 2. Szczegóły żądania
- **Metoda HTTP:** `PATCH`
- **URL:** `/v1/catalog/{id}`
- **Route Params:** `id` (UUID of catalog item)
- **Request Body (wszystkie pola opcjonalne):**

| Pole | Typ | Walidacja |
|------|-----|-----------|
| `title` | string | 1-50 chars, trimmed |
| `category` | string | non-empty |
| `points` | number | 0-100, divisible by 5 |
| `time_of_day` | enum | 'morning' \| 'afternoon' \| 'evening' \| 'night' \| 'any' |
| `emoji` | string | optional, nullable |

**Przykład:**
```json
{
  "title": "Take out all trash",
  "points": 15
}
```

## 3. Szczegóły odpowiedzi

| Kod stanu | Opis | Treść |
|-----------|------|-------|
| **200** | OK | `CatalogItemDTO` (updated item) |
| 400 | Validation error / Missing ID | `{ error: "Validation error", details }` |
| 404 | Item not found | `{ error: "Item not found" }` |
| 404 | Household not found | `{ error: "Household not found" }` |
| 409 | Duplicate title | `{ error: "Duplicate title" }` |
| 500 | Server error | `{ error: "Internal server error" }` |

## 4. Logika
1. Parse URL param `{id}`
2. Parse & validate request body (Zod UpdateCatalogItemCmdSchema)
3. Pobranie household_id użytkownika
4. Sprawdzenie czy item istnieje i należy do tego household (NOT soft-deleted)
5. Jeśli `title` jest aktualizowany → sprawdzenie duplikatu
6. Update tylko dostarczone pola
7. Zwrócenie 200 z zaktualizowanym DTO

---

# DELETE /v1/catalog/{id} – Soft Delete Catalog Item

## 1. Przegląd endpointu
Soft delete pozycji katalogu — ustawia timestamp `deleted_at`. Dane pozostają w bazie dla audit trail.

## 2. Szczegóły żądania
- **Metoda HTTP:** `DELETE`
- **URL:** `/v1/catalog/{id}`
- **Route Params:** `id` (UUID of catalog item)
- **Request Body:** brak

## 3. Szczegóły odpowiedzi

| Kod stanu | Opis | Treść |
|-----------|------|-------|
| **204** | No Content | (empty) |
| 400 | Missing ID | `{ error: "Item ID is required" }` |
| 404 | Item not found | `{ error: "Item not found" }` |
| 404 | Household not found | `{ error: "Household not found" }` |
| 500 | Server error | `{ error: "Internal server error" }` |

## 4. Logika
1. Parse URL param `{id}`
2. Pobranie household_id użytkownika
3. Sprawdzenie czy item istnieje i należy do tego household (NOT soft-deleted)
4. Update: `SET deleted_at = NOW()` WHERE `id = :id` AND `household_id = :householdId`
5. Zwrócenie 204 No Content

## 5. Uwagi bezpieczeństwa
- Item należący do innego household zwraca 404 (nie 403)
- Soft delete zachowuje dane dla audit log i chore_status_log
- Daily chores mogą referencować deleted catalog items (integrność)

---

# Podsumowanie Implementacji (GET, POST, PATCH, DELETE)

| Operacja | HTTP | URL | Body | Response |
|----------|------|-----|------|----------|
| Fetch all | GET | `/v1/catalog?type=all` | — | 200: CatalogItemDTO[] |
| Fetch predefined | GET | `/v1/catalog?type=predefined` | — | 200: CatalogItemDTO[] |
| Fetch custom | GET | `/v1/catalog?type=custom` | — | 200: CatalogItemDTO[] |
| Create custom | POST | `/v1/catalog` | CreateCatalogItemCmd | 201: CatalogItemDTO |
| Update | PATCH | `/v1/catalog/{id}` | UpdateCatalogItemCmd (partial) | 200: CatalogItemDTO |
| Delete (soft) | DELETE | `/v1/catalog/{id}` | — | 204: No Content |

Wszystkie operacje:
- Pobierają `household_id` z `household_members` table (user_id = DEFAULT_USER_ID)
- Zwracają 404 jeśli user nie ma household
- Zwracają 500 przy błędach DB/serwera
