# Plan implementacji widoku Household Management

## 1. Przegląd

Widok Household Management to admin-only interfejs pozwalający administratorom gospodarstwa domowego na zarządzanie ustawieniami gospodarstwa oraz członkami rodziny. Główny cel to umożliwienie adminom przeglądania i modyfikowania informacji o gospodarstwie (nazwa, PIN), zarządzania listą członków oraz kontrolowania ich ról w systemie. Widok zapewnia bezpieczny dostęp tylko dla administratorów i zawiera odpowiednie mechanizmy walidacji oraz obsługi błędów.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/household`. Dostęp do tej ścieżki powinien być chroniony - tylko zalogowani użytkownicy z rolą administratora gospodarstwa mogą uzyskać dostęp do widoku.

## 3. Struktura komponentów

```
HouseholdManagementView (główny kontener)
├── HouseholdInfo (informacje o gospodarstwie + inline edycja)
│   ├── HouseholdName (nazwa gospodarstwa z przyciskiem Edit dla adminów)
│   ├── HouseholdNameEditor (inline formularz edycji nazwy)
│   └── HouseholdPin (PIN - tylko dla adminów)
└── MembersList (lista członków)
    └── MemberCard[] (karty poszczególnych członków)
        ├── MemberInfo (informacje o członku)
        ├── RoleSelector (zmiana roli - tylko dla adminów)
        └── RemoveButton (usunięcie członka - tylko dla adminów)
```

## 4. Szczegóły komponentów

### HouseholdManagementView

- **Opis komponentu**: Główny komponent widoku zarządzającego gospodarstwem domowym. Odpowiada za ładowanie danych gospodarstwa i członków, zarządzanie stanem oraz koordynację między podkomponentami.
- **Główne elementy**: Kontener główny z sekcjami dla informacji o gospodarstwie, listy członków i ustawień. Wykorzystuje shadcn/ui Card komponenty dla organizacji layoutu.
- **Obsługiwane interakcje**: Ładowanie danych przy montowaniu, obsługa błędów, aktualizacja danych po zmianach w podkomponentach.
- **Obsługiwana walidacja**: Sprawdzenie czy użytkownik jest administratorem gospodarstwa, walidacja dostępu do wrażliwych danych (PIN).
- **Typy**: HouseholdManagementViewModel, HouseholdDTO, MemberDTO[].
- **Propsy**: Brak (komponent standalone).

### HouseholdInfo

- **Opis komponentu**: Komponent wyświetlający podstawowe informacje o gospodarstwie oraz umożliwiający inline edycję nazwy dla administratorów.
- **Główne elementy**: Pole z nazwą (z przyciskiem Edit dla adminów), inline formularz edycji, PIN dostępu (tylko dla adminów).
- **Obsługiwane interakcje**: Wyświetlanie danych, ukrywanie PIN-u dla członków, inline edycja nazwy przez adminów.
- **Obsługiwana walidacja**: PIN widoczny tylko dla adminów, walidacja nazwy (3-100 znaków).
- **Typy**: HouseholdDTO, UpdateHouseholdCmd.
- **Propsy**: household: HouseholdDTO, currentUserRole: 'admin' | 'member', onUpdate?: (updates: UpdateHouseholdCmd) => Promise<void>, isUpdating?: boolean.

### MembersList

- **Opis komponentu**: Lista wszystkich członków gospodarstwa z możliwością zarządzania rolami i usuwania.
- **Główne elementy**: Lista kart MemberCard w kontenerze z przewijaniem, przyciski akcji widoczne tylko dla adminów.
- **Obsługiwane interakcje**: Renderowanie listy członków, przekazywanie zdarzeń zmiany roli i usunięcia.
- **Obsługiwana walidacja**: Kontrola dostępu do kontrolek modyfikacji (tylko admin), zapobieganie usunięciu ostatniego admina lub siebie.
- **Typy**: MemberDTO[].
- **Propsy**: members: MemberDTO[], currentUserRole: 'admin' | 'member', onUpdateRole: (memberId: string, role: string) => void, onRemoveMember: (memberId: string) => void.

### MemberCard

- **Opis komponentu**: Pojedyncza karta członka gospodarstwa zawierająca avatar, nazwę, rolę i kontrolki zarządzania.
- **Główne elementy**: Avatar (lub placeholder), informacje tekstowe, dropdown do zmiany roli, przycisk usunięcia.
- **Obsługiwane interakcje**: Zmiana roli przez dropdown, usunięcie członka z potwierdzeniem.
- **Obsługiwana walidacja**: Nie można zmienić roli na członka jeśli jest to ostatni admin, nie można usunąć siebie lub ostatniego admina.
- **Typy**: MemberDTO.
- **Propsy**: member: MemberDTO, currentUserRole: 'admin' | 'member', currentUserId: string, onUpdateRole: (role: string) => void, onRemove: () => void.

## 5. Typy

### Istniejące typy z types.ts

- `HouseholdDTO`: { id: UUID, name: string, timezone: string, pin?: string }
- `MemberDTO`: { id: UUID, user_id: UUID, name: string, avatar_url?: string | null, role: "admin" | "member", joined_at: ISODate }
- `UpdateMemberRoleCmd`: { role: "admin" | "member" }
- `UpdateHouseholdCmd`: { name?: string, timezone?: string }

### Nowe typy ViewModel

```typescript
interface HouseholdManagementViewModel {
  household: HouseholdDTO | null;
  members: MemberDTO[];
  currentUserRole: 'admin' | 'member';
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
  isUpdatingHousehold: boolean;
  isUpdatingMember: boolean;
}

interface HouseholdManagementActions {
  loadData: () => Promise<void>;
  updateHousehold: (updates: UpdateHouseholdCmd) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}
```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany przez customowy hook `useHouseholdManagement`. Hook będzie odpowiedzialny za:

- **Stan lokalny**: household, members, loading states, error states
- **Pobieranie danych**: Automatyczne ładowanie danych przy montowaniu komponentu
- **Aktualizacje**: Optimistic updates dla lepszego UX, rollback przy błędach
- **Synchronizacja**: Aktualizacja stanu po pomyślnych operacjach API
- **Błędy**: Centralne zarządzanie błędami z odpowiednimi komunikatami

Hook będzie używał biblioteki do zarządzania stanem (prawdopodobnie React Query lub Zustand) dla cache'owania i synchronizacji danych.

## 7. Integracja API

Widok integruje się z następującymi endpointami:

- **GET /v1/households/current**: Pobranie informacji o aktualnym gospodarstwie użytkownika
  - Request: Brak body, autoryzacja przez JWT
  - Response: HouseholdDTO (PIN tylko dla adminów)

- **GET /v1/members**: Pobranie listy członków gospodarstwa
  - Request: Brak body, household_id resolvowany server-side
  - Response: MemberDTO[]

- **PATCH /v1/households/:id**: Aktualizacja gospodarstwa
  - Request: UpdateHouseholdCmd w body
  - Response: HouseholdDTO

- **PATCH /v1/members/:id**: Zmiana roli członka
  - Request: UpdateMemberRoleCmd w body
  - Response: MemberDTO

- **DELETE /v1/members/:id**: Usunięcie członka
  - Request: Brak body
  - Response: 204 No Content

Wszystkie wywołania API będą obsługiwane przez service layer z odpowiednią obsługą błędów i retry logic.

## 8. Interakcje użytkownika

1. **Wyświetlanie danych**: Przy wejściu na stronę automatycznie ładują się dane gospodarstwa i członków
2. **Inline edycja gospodarstwa**: Admin może kliknąć przycisk "Edit" obok nazwy gospodarstwa, wprowadzić zmiany inline i zapisać
3. **Zarządzanie członkami**: Admin może zmienić rolę członka przez dropdown lub usunąć członka
4. **Potwierdzenia**: Destruktywne akcje (usunięcie członka) wymagają potwierdzenia przez dialog
5. **Feedback**: Wszystkie akcje dają natychmiastowy feedback przez toast notifications
6. **Responsywność**: Interfejs dostosowuje się do różnych rozmiarów ekranów

## 9. Warunki i walidacja

- **Dostęp do widoku**: Tylko administratorzy gospodarstwa mogą zobaczyć pełny widok
- **Wyświetlanie PIN**: PIN widoczny tylko dla administratorów
- **Zmiana ról**: Tylko administratorzy mogą zmieniać role innych członków
- **Usunięcie członków**: Tylko administratorzy, nie można usunąć ostatniego admina ani siebie
- **Nazwa gospodarstwa**: Wymagana, 3-100 znaków, automatycznie trimowana
- **Liczba członków**: Maksymalnie 10 osób (wymuszane przez backend)

Walidacja odbywa się na poziomie:

- **Komponentów**: Walidacja dostępu i uprawnień
- **Formularzy**: Walidacja danych wejściowych (Zod schemas)
- **API**: Business logic validation na backendzie

## 10. Obsługa błędów

- **401 Unauthorized**: Przekierowanie do logowania, wyczyszczenie lokalnego stanu
- **403 Forbidden**: Komunikat o braku uprawnień, ukrycie kontrolek admin
- **404 Not Found**: Komunikat o braku gospodarstwa/członka
- **409 Conflict**: Szczegółowe komunikaty dla business rules (ostatni admin, usunięcie siebie)
- **422 Validation Failed**: Wyświetlanie błędów walidacji przy polach formularza
- **500 Internal Server Error**: Ogólny komunikat błędu z propozycją ponowienia próby

Błędy będą prezentowane przez toast notifications oraz odpowiednie stany UI (loading, error states).

## 11. Kroki implementacji

1. **Przygotowanie struktury**: Utworzyć plik `src/pages/household.astro` i komponenty w `src/components/household/`
2. **Implementacja hooka**: Stworzyć `useHouseholdManagement` hook z logiką pobierania i aktualizacji danych
3. **Podstawowe komponenty**: Zaimplementować HouseholdManagementView i HouseholdInfo z inline edycją
4. **Lista członków**: Dodać MembersList i MemberCard komponenty
5. **Walidacja i bezpieczeństwo**: Dodać sprawdzenia ról i uprawnień
6. **Obsługa błędów**: Zaimplementować kompleksową obsługę błędów API
7. **UI/UX**: Dodać responsywność, animacje i poprawki wizualne
8. **Testowanie**: Dodać unit testy i integration tests
9. **Optymalizacja**: Implementować lazy loading i optymalizacje wydajności
