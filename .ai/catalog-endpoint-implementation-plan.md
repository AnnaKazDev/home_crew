# API Endpoint Implementation Plan: POST /v1/catalog – Add Custom Chore

## 1. Endpoint Overview

Adds a new chore to the household catalog. Allows a household member to create their own entry in `chores_catalog`. Global (predefined) entries are added administratively and are not within the scope of this endpoint.

## 2. Request Details

- **HTTP Method:** `POST`
- **URL:** `/v1/catalog`
- **Authorization:** Valid Supabase JWT (session) required — endpoint available only for logged-in users.
- **URL/query parameters:** None
- **Request Body (JSON):**
  | Field | Type | Required | Validation |
  |-------|------|----------|------------|
  | `title` | `string` | ✓ | non-empty, `≤50` characters, `trim()` |
  | `category` | `string` | ✓ | enum or free text (per spec), non-empty |
  | `points` | `number` | ✓ | `0 ≤ points ≤ 100` && `points % 5 === 0` |
  | `time_of_day` | `'morning' \| 'afternoon' \| 'evening' \| 'night' \| 'any'` | ✗ | default `'any'` |
  | `emoji` | `string` | ✗ | any single emoji / short text |

Example:

```json
{
  "title": "Take out trash",
  "category": "cleaning",
  "points": 10,
  "time_of_day": "evening",
  "emoji": "🗑️"
}
```

## 3. Types Used

- **CreateCatalogItemCmd** – from `src/types.ts` (after change: optional `time_of_day`, `emoji`).
- **CatalogItemDTO** – returns full record, including `created_by_user_id` and `deleted_at` (remains `null` for active entries).

## 4. Response Details

| Status Code | Description                         | Content (`application/json`)             |
| ----------- | ----------------------------------- | ---------------------------------------- |
| **201**     | Created                             | `CatalogItemDTO` of newly created row    |
| 400         | Invalid input data (Zod validation) | `{ error: "Validation error", details }` |
| 401         | Unauthorized                        | `{ error: "Unauthorized" }`              |
| 404         | User does not belong to household   | `{ error: "Household not found" }`       |
| 409         | Duplicate title in catalog          | `{ error: "Duplicate title" }`           |
| 500         | Server error                        | `{ error: "Internal server error" }`     |

## 5. Data Flow

1. Client sends `POST /v1/catalog` with JSON body.
2. Astro API route (`src/pages/api/v1/catalog/index.ts`):
   1. Gets `supabase` from `context.locals` and session (`getSession()`).
   2. Validates body via Zod -> `CreateCatalogItemCmd`.
   3. Sets `userId = session.user.id`.
   4. Gets user's household (`SELECT household_id FROM household_members WHERE user_id = :userId`).
   5. Calls `createCatalogItem()` in service.
3. Service `src/lib/services/choresCatalog.ts#createCatalogItem`:
   - Checks duplicate: `SELECT 1 FROM chores_catalog WHERE household_id = :hh AND lower(title)=lower(:title) AND deleted_at IS NULL`.
   - Executes `INSERT INTO chores_catalog (...) VALUES (...) RETURNING *`.
   - Maps record → `CatalogItemDTO` and returns.
4. Endpoint returns `201` with DTO data.

## 6. Security Considerations

- **Authentication:** Supabase JWT (middleware already checks session).
- **Authorization:** RLS on `chores_catalog` + explicit check that user belongs to household.
- **Mass-assignment:** Server ignores/generates `household_id`, `predefined`, `created_by_user_id`, `created_at`.
- **SQLi:** Supabase uses parameterized queries.
- **Rate-limit:** (to consider) — middleware or Reverse Proxy.

## 7. Error Handling

| Scenario                                 | Code | Handling                                              |
| ---------------------------------------- | ---- | ----------------------------------------------------- |
| Missing JWT or invalid session           | 401  | Return `Unauthorized` error.                          |
| User has no household                    | 404  | "Household not found".                                |
| Zod validation fails                     | 400  | Zod details in `details`.                             |
| Duplicate `(household_id, lower(title))` | 409  | Postgres uniqueness error — map to `Duplicate title`. |
| Other DB/server errors                   | 500  | Log `console.error`, return generic.                  |

## 8. Performance Considerations

- Single insert operation → O(1).
- Index `idx_catalog_household_predefined` speeds up duplicate check. `SELECT` uses this index.
- No heavy computations. Request time << 50 ms.

## 9. Implementation Steps

1. **Zod schema** (CreateCatalogItemCmdSchema) in `src/lib/choresCatalog.services.ts`.
2. **Service** `createCatalogItem()` + export in this file.
3. **Endpoint** `src/pages/api/v1/catalog/index.ts`:
   - GET session, validation, get household, call service, error handling.
4. **Documentation** README/API-ref — add endpoint section.
5. **CI** — run tests; no migration changes.
6. **Commit:** `feat(api): add POST /v1/catalog endpoint` (ticket prefix per branch).

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

| Kod stanu | Opis                   | Treść                                                 |
| --------- | ---------------------- | ----------------------------------------------------- |
| **200**   | OK                     | `CatalogItemDTO[]`                                    |
| 400       | Invalid type parameter | `{ error: "Invalid type parameter", details: "..." }` |
| 404       | Household not found    | `{ error: "Household not found" }`                    |
| 500       | Server error           | `{ error: "Internal server error" }`                  |

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

| Pole          | Typ    | Walidacja                                                 |
| ------------- | ------ | --------------------------------------------------------- |
| `title`       | string | 1-50 chars, trimmed                                       |
| `category`    | string | non-empty                                                 |
| `points`      | number | 0-100, divisible by 5                                     |
| `time_of_day` | enum   | 'morning' \| 'afternoon' \| 'evening' \| 'night' \| 'any' |
| `emoji`       | string | optional, nullable                                        |

**Przykład:**

```json
{
  "title": "Take out all trash",
  "points": 15
}
```

## 3. Szczegóły odpowiedzi

| Kod stanu | Opis                          | Treść                                    |
| --------- | ----------------------------- | ---------------------------------------- |
| **200**   | OK                            | `CatalogItemDTO` (updated item)          |
| 400       | Validation error / Missing ID | `{ error: "Validation error", details }` |
| 404       | Item not found                | `{ error: "Item not found" }`            |
| 404       | Household not found           | `{ error: "Household not found" }`       |
| 409       | Duplicate title               | `{ error: "Duplicate title" }`           |
| 500       | Server error                  | `{ error: "Internal server error" }`     |

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

| Kod stanu | Opis                | Treść                                |
| --------- | ------------------- | ------------------------------------ |
| **204**   | No Content          | (empty)                              |
| 400       | Missing ID          | `{ error: "Item ID is required" }`   |
| 404       | Item not found      | `{ error: "Item not found" }`        |
| 404       | Household not found | `{ error: "Household not found" }`   |
| 500       | Server error        | `{ error: "Internal server error" }` |

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

| Operacja         | HTTP   | URL                           | Body                           | Response              |
| ---------------- | ------ | ----------------------------- | ------------------------------ | --------------------- |
| Fetch all        | GET    | `/v1/catalog?type=all`        | —                              | 200: CatalogItemDTO[] |
| Fetch predefined | GET    | `/v1/catalog?type=predefined` | —                              | 200: CatalogItemDTO[] |
| Fetch custom     | GET    | `/v1/catalog?type=custom`     | —                              | 200: CatalogItemDTO[] |
| Create custom    | POST   | `/v1/catalog`                 | CreateCatalogItemCmd           | 201: CatalogItemDTO   |
| Update           | PATCH  | `/v1/catalog/{id}`            | UpdateCatalogItemCmd (partial) | 200: CatalogItemDTO   |
| Delete (soft)    | DELETE | `/v1/catalog/{id}`            | —                              | 204: No Content       |

Wszystkie operacje:

- Pobierają `household_id` z `household_members` table (user_id = DEFAULT_USER_ID)
- Zwracają 404 jeśli user nie ma household
- Zwracają 500 przy błędach DB/serwera
