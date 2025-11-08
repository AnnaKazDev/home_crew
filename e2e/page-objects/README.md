# Page Object Model (POM) Classes

Ten katalog zawiera klasy Page Object Model dla testów e2e związanych z funkcjonalnością dodawania zadań (chore'ów) w aplikacji Home Crew.

## Struktura POM

### Klasy Bazowe

#### `DailyChoresPage`

Reprezentuje główną stronę `/daily_chores` z widokiem dziennym zadań.

**Metody główne:**

- `goto()` - nawigacja do strony
- `clickAddChore()` - kliknięcie przycisku "Add Chore"
- `getTodoChores()` - pobranie wszystkich zadań z kolumny "To Do"
- `getDoneChores()` - pobranie wszystkich zadań z kolumny "Done"

#### `AddChoreModal`

Obsługuje modal dodawania nowego zadania z jego różnymi krokami.

**Metody główne:**

- `selectRandomChore()` - wybór losowego zadania z katalogu
- `waitForCatalogStep()` - oczekiwanie na krok wyboru z katalogu
- `waitForConfigStep()` - oczekiwanie na krok konfiguracji

#### `ChoreConfigurator`

Obsługuje krok konfiguracji zadania (data, przypisanie, zatwierdzenie).

**Metody główne:**

- `verifyCurrentDate()` - sprawdzenie czy data jest ustawiona na dzisiaj
- `assignToUser(userId)` - przypisanie zadania do użytkownika
- `assignToUnassigned()` - pozostawienie zadania bez przypisania
- `submitChore()` - zatwierdzenie konfiguracji

#### `ChoreCard`

Reprezentuje pojedynczą kartę zadania z metodami do weryfikacji danych.

**Metody główne:**

- `getTitle()` - pobranie tytułu zadania
- `getPoints()` - pobranie ilości punktów
- `getAssignee()` - pobranie nazwy przypisanego użytkownika
- `verifyChore()` - kompleksowa weryfikacja danych zadania

#### `DateNavigator`

Obsługuje nawigację między datami w aplikacji.

**Metody główne:**

- `selectDate(date)` - wybór konkretnej daty w kalendarzu
- `getCurrentDate()` - pobranie obecnie wyświetlanej daty

### Klasa Złożona

#### `AddChoreFlow`

Łączy wszystkie komponenty w kompletny przepływ dodawania zadania.

**Metoda główna:**

- `addRandomChore(userId?, userName?)` - kompletny scenariusz dodawania losowego zadania
- `verifyChoreInTodoList()` - weryfikacja czy zadanie pojawiło się na liście To Do

## Dane Użytkowników Testowych

Testy używają danych użytkowników z bazy Supabase. **Użytkownicy są tworzeni tylko raz podczas setupu bazy testowej**.

### Główny Użytkownik Testowy (Admin)

- **ID**: `e9d12995-1f3e-491d-9628-3c4137d266d1`
- **Email**: `dev@example.com`
- **Hasło**: `password`
- **Nazwa**: `Test User`
- **Rola**: `admin`
- **Household**: `Test Household` (ID: `11111111-aaaa-bbbb-cccc-222222222222`)

### Drugi Użytkownik Testowy (Member)

- **Email**: `testmember@example.com`
- **Hasło**: `password`
- **Nazwa**: `Test Member`
- **Rola**: `member`

### Setup Użytkowników Testowych

**Użytkownicy są tworzeni automatycznie przez endpoint `/api/auth/dev-login`** - nie trzeba uruchamiać skryptów ręcznie!

Każdy test używa specjalnego endpointu `/api/auth/dev-login` który:

1. Próbuje zalogować użytkownika testowego
2. Jeśli użytkownik nie istnieje - tworzy go automatycznie
3. Ustawia odpowiednie ciasteczka sesji

**Dla ręcznego setupu** (jeśli potrzebujesz dostępu do bazy poza testami):

```bash
# Utwórz użytkowników ręcznie
node create-test-user.js
node create-second-user.js
```

**Automatyczne podejście przez `/api/auth/dev-login` jest zalecane** - endpoint obsługuje wszystko automatycznie.

### Strategia Cleanup w Testach

**Każdy test jest odpowiedzialny za czyszczenie po sobie** - podejście "leave no trace":

#### 1. **Unikalne identyfikatory**

- Każdy test generuje unikalny suffix: `e2e-${timestamp}-${random}`
- Zapobiega kolizjom między równolegle uruchomionymi testami

#### 2. **Cleanup na końcu testu**

```typescript
// Dodaj zadanie
const addedChore = await addChoreFlow.addRandomChore({...});

// Wykonaj test
await addChoreFlow.verifyChoreInTodoList(addedChore);

// WYCZYŚĆ PO SOBIE
await addChoreFlow.dailyChoresPage.deleteChoreById(addedChore.id!);
```

#### 3. **Korzyści tego podejścia**

- ✅ **Izolacja testów** - każdy test działa na czystym środowisku
- ✅ **Równoległość** - testy mogą być uruchamiane równolegle bez interferencji
- ✅ **Niezawodność** - jeśli test się wysypie, następne testy mają czyste środowisko
- ✅ **Śledzenie** - łatwo zobaczyć które testy dodały które zadania

### Przygotowanie Bazy Testowej

1. Uruchom Supabase lokalnie: `supabase start`
2. Zastosuj migracje: `supabase db reset`
3. Uruchom skrypty tworzenia użytkowników (tylko raz)
4. Uruchamiaj testy e2e - będą korzystać z istniejących użytkowników

## Przykład Użycia

### Podstawowy scenariusz dodawania zadania

```typescript
import { test, expect } from '@playwright/test';
import { AddChoreFlow } from './page-objects';

// Dane użytkownika testowego
const testUser = {
  id: 'e9d12995-1f3e-491d-9628-3c4137d266d1',
  email: 'dev@example.com',
  password: 'password',
  name: 'Test User',
};

// Funkcja pomocnicza do logowania
async function loginWithTestUser(page, user) {
  await page.goto('/auth');
  await page.locator('button').filter({ hasText: 'Sign in' }).click();
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').first().fill(user.password);
  await page.locator('button').filter({ hasText: 'Sign in' }).last().click();
  await page.waitForURL((url) => !url.pathname.includes('/auth'));
}

test.describe('Add Chore Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Zaloguj się użytkownikiem testowym
    await loginWithTestUser(page);
  });

  test('should add and verify chore', async ({ page }) => {
    const addChoreFlow = new AddChoreFlow(page);

    // Dodaj zadanie dla zalogowanego użytkownika z unikalnym identyfikatorem
    const uniqueSuffix = `e2e-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const addedChore = await addChoreFlow.addRandomChore({
      userId: testUser.id,
      userName: testUser.name,
      uniqueSuffix,
    });

    // Zweryfikuj że zadanie pojawiło się na liście
    await addChoreFlow.verifyChoreInTodoList(addedChore);

    // WYCZYŚĆ PO SOBIE: Usuń dodane zadanie
    await addChoreFlow.dailyChoresPage.deleteChoreById(addedChore.id!);
  });
});
```

### Zaawansowane scenariusze

```typescript
test('add chore with custom date and unique identifier', async ({ page }) => {
  const addChoreFlow = new AddChoreFlow(page);

  // Dodaj zadanie na jutrzejszą datę z unikalnym identyfikatorem
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const addedChore = await addChoreFlow.addRandomChore({
    userId: 'user-123',
    userName: 'John Doe',
    date: tomorrow,
    uniqueSuffix: 'test-run-1',
  });

  // Przejdź do jutrzejszej daty
  await addChoreFlow.dailyChoresPage.dateNavigator.selectDate(tomorrow);

  // Zweryfikuj zadanie na nowej dacie
  await addChoreFlow.verifyChoreInTodoList(addedChore);
});

test('cleanup chores before test', async ({ page }) => {
  const addChoreFlow = new AddChoreFlow(page);

  // Wyczyść wszystkie istniejące zadania przed testem
  await addChoreFlow.dailyChoresPage.goto();
  await addChoreFlow.dailyChoresPage.clearAllChores();

  // Teraz możesz bezpiecznie dodać nowe zadania bez obawy o duplikaty
  const addedChore = await addChoreFlow.addRandomChore({
    userId: 'user-123',
    userName: 'John Doe',
    uniqueSuffix: 'fresh-test',
  });

  await addChoreFlow.verifyChoreInTodoList(addedChore);
});
```

## Scenariusz Testu E2E

Klasy POM zostały zaprojektowane dla następującego scenariusza:

1. **Wejście zalogowanego użytkownika na `/daily_chores`**
   - `DailyChoresPage.goto()`

2. **Kliknięcie w przycisk "Add Chore"**
   - `DailyChoresPage.clickAddChore()`

3. **Wybranie losowego chore'a z modalu**
   - `AddChoreModal.selectRandomChore()`

4. **Sprawdzenie daty w "Configure Chore"**
   - `ChoreConfigurator.verifyCurrentDate()`

5. **Przypisanie do użytkownika i kliknięcie "Add Chore"**
   - `ChoreConfigurator.submitChore(userId)`

6. **Sprawdzenie czy zadanie jest na liście To Do**
   - `AddChoreFlow.verifyChoreInTodoList()`

## Korzyści POM

- **Enkapsulacja** - logika interakcji z elementami UI jest ukryta w klasach
- **Łatwość utrzymania** - zmiana selektorów wymaga zmian tylko w jednej klasie
- **Czytelność testów** - testy skupiają się na logice biznesowej
- **Reużywalność** - klasy mogą być używane w wielu testach
- **Abstrakcja** - testy nie wiedzą o szczegółach implementacji UI

## Wymagania

Klasy POM wymagają obecności atrybutów `data-test-id` w komponentach React, które zostały dodane wcześniej.
