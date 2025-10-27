# Plan implementacji widoku Daily View

## 1. Przegląd

Daily View to główny widok centrum aplikacji Home Crew, umożliwiający zarządzanie codziennymi obowiązkami domowymi. Widok wyświetla zadania podzielone na dwie kolumny To Do i Done, pozwala na nawigację między dniami, dodawanie nowych zadań z katalogu, przypisywanie członków oraz zmianę statusu zadań poprzez drag-and-drop lub przyciski. Celem jest zapewnienie przejrzystego przeglądu obowiązków z uwzględnieniem punktów użytkownika i funkcjonalności administracyjnych.

## 2. Routing widoku

Widok dostępny na ścieżce `/daily_chores` (po zalogowaniu). Wymaga autoryzacji użytkownika - niezalogowani użytkownicy są przekierowywani do strony logowania.

## 3. Struktura komponentów

```
DailyView (główny kontener)
├── DailyViewHeader
│   ├── PointsBadge
│   ├── DateNavigator
│   └── AddChoreButton
├── ChoreColumns (flex layout dla responsywności)
│   ├── ChoreColumn (To Do)
│   │   └── ChoreCard[] (lista zadań)
│   └── ChoreColumn (Done)
│       └── ChoreCard[] (lista zadań)
├── AddChoreModal
│   ├── ChoreCatalogSelector
│   ├── ChoreForm (dla customowych zadań)
│   └── ChoreConfigurator (data, czas, assignee)
└── AssignChoreModal
    └── MemberSelector
```

## 4. Szczegóły komponentów

### DailyView
- **Opis komponentu**: Główny kontener widoku dziennego, zarządza stanem globalnym i koordynuje wszystkie podkomponenty. Obsługuje ładowanie danych, zarządzanie modalami i integrację z React Query.
- **Główne elementy**: Container div z header, main content area dla kolumn zadań, overlay dla modali.
- **Obsługiwane zdarzenia**: onDateChange (zmiana dnia), onChoreAdd (dodanie zadania), onChoreUpdate (zmiana statusu/przypisania), onChoreDelete (usunięcie).
- **Warunki walidacji**: Użytkownik musi być członkiem gospodarstwa domowego; limit 50 zadań dziennie na gospodarstwo (blokada przycisku dodawania po przekroczeniu); assignee musi należeć do tego samego gospodarstwa.
- **Typy**: DailyChoreDTO[], ChoreViewModel[], HouseholdDTO, MemberDTO[].
- **Propsy**: Brak (komponent główny widoku).

### DailyViewHeader
- **Opis komponentu**: Header z badge punktów, nawigatorem daty i przyciskiem dodawania. Responsywny layout dostosowujący się do urządzeń mobilnych.
- **Główne elementy**: Flex container z PointsBadge, DateNavigator i AddChoreButton.
- **Obsługiwane zdarzenia**: onDateChange (przekazywane do rodzica), onAddChoreClick (otwarcie modala).
- **Warunki walidacji**: Przycisk dodawania ukryty gdy osiągnięto limit 50 zadań dziennie.
- **Typy**: HouseholdDTO (dla kontekstu), number (punkty użytkownika).
- **Propsy**: currentDate: ISODate, totalPoints: number, choresCount: number, onDateChange: (date: ISODate) => void, onAddChoreClick: () => void.

### ChoreColumns
- **Opis komponentu**: Kontener dla dwóch kolumn To Do i Done z obsługą drag-and-drop między nimi.
- **Główne elementy**: Flex container z dwoma ChoreColumn komponentami, DropZone dla drag-and-drop.
- **Obsługiwane zdarzenia**: onChoreDrop (przeniesienie zadania między kolumnami), onChoreClick (kliknięcie na zadanie).
- **Warunki walidacji**: Drag-and-drop tylko dla zadań przypisanych do bieżącego użytkownika lub przez admina.
- **Typy**: ChoreViewModel[], MemberDTO[].
- **Propsy**: chores: ChoreViewModel[], members: MemberDTO[], currentUserId: UUID, onChoreUpdate: (id: UUID, updates: UpdateDailyChoreCmd) => void, onChoreClick: (chore: ChoreViewModel) => void.

### ChoreColumn
- **Opis komponentu**: Pojedyncza kolumna zadań (To Do lub Done) z możliwością upuszczania zadań.
- **Główne elementy**: Column container z tytułem, listą ChoreCard komponentów, DropZone.
- **Obsługiwane zdarzenia**: onDrop (akceptacja upuszczonego zadania), onChoreClick (przekazywane do rodzica).
- **Warunki walidacji**: Akceptuje tylko zadania z odpowiednim statusem docelowym.
- **Typy**: ChoreViewModel[], 'todo' | 'done'.
- **Propsy**: title: string, status: 'todo' | 'done', chores: ChoreViewModel[], onDrop: (choreId: UUID) => void, onChoreClick: (chore: ChoreViewModel) => void.

### ChoreCard
- **Opis komponentu**: Karta pojedynczego zadania z informacjami i kontrolkami akcji.
- **Główne elementy**: Card container z tytułem, emoji, czasem, assignee avatar/name, przyciskami akcji (assign, delete).
- **Obsługiwane zdarzenia**: onDragStart (rozpoczęcie przeciągania), onAssignClick (otwarcie modala przypisania), onDeleteClick (usunięcie zadania).
- **Warunki walidacji**: Przycisk assign widoczny tylko dla assignee lub admin; przycisk delete tylko dla twórcy zadania lub admin.
- **Typy**: ChoreViewModel, MemberDTO[].
- **Propsy**: chore: ChoreViewModel, assignee: MemberDTO | null, onAssign: () => void, onDelete: () => void.

### DateNavigator
- **Opis komponentu**: Komponent nawigacji między dniami z date picker i przyciskami strzałek.
- **Główne elementy**: Flex container z przyciskami prev/next i date picker input.
- **Obsługiwane zdarzenia**: onDateChange (zmiana wybranej daty).
- **Warunki walidacji**: Brak specyficznych walidacji, ale prefetch sąsiednich dni dla optymalizacji.
- **Typy**: ISODate.
- **Propsy**: currentDate: ISODate, onDateChange: (date: ISODate) => void.

### AddChoreModal
- **Opis komponentu**: Modal dodawania nowego zadania z wyborem z katalogu lub tworzeniem własnego.
- **Główne elementy**: Dialog z ChoreCatalogSelector, opcjonalnym ChoreForm dla custom zadań, ChoreConfigurator.
- **Obsługiwane zdarzenia**: onChoreSelect (wybór z katalogu), onCustomChoreCreate (utworzenie własnego), onSubmit (zapis zadania).
- **Warunki walidacji**: Tytuł ≤50 znaków, punkty 0-100, assignee musi być w gospodarstwie; limit 50 zadań dziennie.
- **Typy**: CatalogItemDTO[], CreateDailyChoreCmd, MemberDTO[].
- **Propsy**: isOpen: boolean, onClose: () => void, onSubmit: (cmd: CreateDailyChoreCmd) => void, catalogItems: CatalogItemDTO[], members: MemberDTO[].

### AssignChoreModal
- **Opis komponentu**: Modal przypisywania członka do zadania.
- **Główne elementy**: Dialog z listą członków gospodarstwa do wyboru.
- **Obsługiwane zdarzenia**: onMemberSelect (wybór członka), onSubmit (zapis przypisania).
- **Warunki walidacji**: Wybrany członek musi należeć do gospodarstwa; tylko assignee lub admin może zmieniać przypisanie.
- **Typy**: ChoreViewModel, MemberDTO[].
- **Propsy**: isOpen: boolean, chore: ChoreViewModel, members: MemberDTO[], onClose: () => void, onSubmit: (assigneeId: UUID | null) => void.

## 5. Typy

### Istniejące typy z types.ts:
- `DailyChoreDTO`: id, date, time_of_day, status, assignee_id, points, chore_catalog_id
- `CreateDailyChoreCmd`: date, chore_catalog_id, assignee_id?, time_of_day?
- `UpdateDailyChoreCmd`: status?, assignee_id?
- `CatalogItemDTO`: id, title, emoji, time_of_day, category, points, predefined, created_by_user_id, created_at, deleted_at
- `MemberDTO`: id, user_id, name, avatar_url, role, joined_at
- `HouseholdDTO`: id, name, timezone, pin?

### Nowe typy ViewModel:
```typescript
interface ChoreViewModel extends DailyChoreDTO {
  catalogTitle: string;           // Tytuł z katalogu
  catalogEmoji?: string;          // Emoji z katalogu  
  catalogCategory: string;        // Kategoria z katalogu
  catalogTimeOfDay: TimeOfDayType; // Czas dnia z katalogu
  assigneeName?: string;          // Nazwa przypisanego członka
  assigneeAvatar?: string;        // Avatar przypisanego członka
  canEdit: boolean;               // Czy użytkownik może edytować (assignee lub admin)
  canDelete: boolean;             // Czy użytkownik może usunąć (twórca lub admin)
}

interface DailyViewState {
  currentDate: ISODate;
  chores: ChoreViewModel[];
  members: MemberDTO[];
  household: HouseholdDTO;
  currentUserId: UUID;
  isAddModalOpen: boolean;
  isAssignModalOpen: boolean;
  selectedChore: ChoreViewModel | null;
  isLoading: boolean;
  error: string | null;
}
```

## 6. Zarządzanie stanem

Stan zarządzany poprzez kombinację React Context (globalny stan aplikacji) i lokalnych hooków. Główny stan widoku przechowywany w komponencie DailyView z użyciem useState dla modali i tymczasowych stanów. Dla danych API używany React Query z invalidation po mutacjach.

Custom hook `useDailyView` enkapsuluje logikę:
- Fetching danych (chores, members, household)
- Obsługa mutacji (create, update, delete chores)
- Optimistic updates z rollback na błędy
- Cache invalidation przy zmianach daty

Stan lokalny dla:
- Otwartych modali (isAddModalOpen, isAssignModalOpen)
- Wybranego zadania (selectedChore)
- Stanów ładowania i błędów

## 7. Integracja API

Integracja poprzez React Query z custom hookami w `src/hooks/useChores.ts` i `src/hooks/useHousehold.ts`.

**GET /v1/daily-chores**:
- Request: query params `date`, opcjonalnie `status`, `assignee_id`
- Response: `DailyChoreDTO[]`
- Użycie: Pobieranie zadań dla wybranej daty przy zmianie dnia lub odświeżeniu

**POST /v1/daily-chores**:
- Request body: `CreateDailyChoreCmd`
- Response: `DailyChoreDTO`
- Użycie: Dodawanie nowego zadania z modala, optimistic update

**PATCH /v1/daily-chores/:id**:
- Request body: `UpdateDailyChoreCmd` (status lub assignee_id)
- Response: `DailyChoreDTO`
- Użycie: Zmiana statusu przez drag-and-drop lub przypisanie członka

**DELETE /v1/daily-chores/:id**:
- Response: 204 No Content
- Użycie: Usuwanie zadania, potwierdzenie przez dialog

Wszystkie wywołania używają service client z bypass RLS dla autoryzacji.

## 8. Interakcje użytkownika

- **Dodanie zadania**: Kliknięcie "Dodaj" → otwarcie AddChoreModal → wybór z katalogu lub utworzenie custom → konfiguracja daty/czasu/assignee → zapis → zamknięcie modala i odświeżenie listy
- **Zmiana statusu**: Drag-and-drop karty zadania między kolumnami To Do/Done → natychmiastowa aktualizacja UI → API call w tle → przyznanie punktów przy Done
- **Przypisanie członka**: Kliknięcie na kartę zadania → otwarcie AssignChoreModal → wybór członka z listy → zapis → zamknięcie modala
- **Nawigacja dni**: Użycie date pickera lub przycisków strzałek → zmiana daty → prefetch nowych danych → płynna animacja przejścia
- **Usuwanie zadania**: Kliknięcie przycisku delete na karcie → potwierdzenie dialog → usunięcie → aktualizacja listy

## 9. Warunki i walidacja

- **Limit zadań dziennych**: Sprawdzany przed otwarciem AddChoreModal; przycisk dodawania ukryty/disabled gdy ≥50 zadań
- **Przypisanie członka**: Walidacja czy wybrany członek należy do gospodarstwa; błąd 400 jeśli nie
- **Uprawnienia edycji**: assignee lub admin może zmieniać status/przypisanie; błąd 403 jeśli nie
- **Uprawnienia usuwania**: twórca zadania lub admin; błąd 403 jeśli nie
- **Unikalność zadania**: Zapobieganie duplikatom (household_id, date, chore_catalog_id, assignee_id, time_of_day); błąd 409
- **Walidacja pól**: assignee_id nullable, status enum ('todo'|'done'), date w formacie ISO

Warunki weryfikowane na poziomie komponentów przez disabled states i ukrywanie przycisków, oraz przez API z odpowiednimi kodami błędów.

## 10. Obsługa błędów

- **Błędy sieciowe**: Toast notification z opcją retry; fallback UI dla stanów offline
- **Błędy autoryzacji (403)**: Error message "Brak uprawnień do wykonania tej akcji"
- **Błędy walidacji (400/422)**: Highlight błędnych pól w formularzach z szczegółowymi komunikatami
- **Konflikty (409)**: Specyficzne komunikaty dla limitu zadań lub duplikatów
- **Błędy serwera (500)**: Generic error message z opcją ponowienia próby
- **Optymistyczne update błędy**: Rollback do poprzedniego stanu z powiadomieniem użytkownika

Error boundary na poziomie aplikacji przechwytuje nieoczekiwane błędy z fallback UI.

## 11. Kroki implementacji

1. **Utworzenie struktury plików**: `src/pages/daily_chores.astro`, `src/components/DailyView.tsx`, komponenty podrzędne w `src/components/daily-view/`

2. **Implementacja typów ViewModel**: Rozszerzenie istniejących DTO o ChoreViewModel i DailyViewState w `src/types/daily-view.types.ts`

3. **Custom hook useDailyView**: Implementacja w `src/hooks/useDailyView.ts` z React Query integracją dla wszystkich API calls

4. **Podstawowy layout DailyView**: Kontener z header i placeholder dla kolumn, integracja z hook

5. **DateNavigator komponent**: Picker z przyciskami nawigacji, obsługa prefetch

6. **ChoreColumn i ChoreCard**: Implementacja drag-and-drop z React DnD, responsive design

7. **AddChoreModal**: Integracja z ChoreCatalog, walidacja formularza, obsługa custom zadań

8. **AssignChoreModal**: Lista członków z selektorem, walidacja uprawnień

9. **Integracja punktów**: PointsBadge w header z aktualizacją przy status change

10. **Responsywność i dostępność**: Dodanie ARIA labels, keyboard navigation, mobile fallbacks

11. **Testowanie**: Unit testy komponentów, integracyjne testy API, testy dostępności

12. **Optymalizacja**: Lazy loading obrazów, memoizacja komponentów, bundle splitting
