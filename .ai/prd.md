# Dokument wymagań produktu (PRD) - Home Crew

## 1. Przegląd produktu
Home Crew to responsywna web-aplikacja (EN) pomagająca rodzinom sprawiedliwie planować i śledzić codzienne obowiązki/zadania domowe. 
System umożliwia tworzenie gospodarstwa domowego (do 10 osób), wybór z listy 50 predefiniowanych zadań lub dodawanie własnych, 
przypisywanie się do zadań, przenoszenie ich ze statusu „To Do” do „Done” oraz przegląd historii zadań w widoku dziennym. 
Wszystkie operacje są logowane w bazie danych.

## 2. Problem użytkownika
Domownicy nie mają przejrzystego sposobu śledzenia, kto i kiedy wykonał dany obowiązek/zadanie domowe. 
Prowadzi to do sporów o sprawiedliwy podział pracy i trudności w przypominaniu sobie kolejności wykonywania zadań.

## 3. Wymagania funkcjonalne
FR-01  Rejestracja użytkownika z wyborem roli „Admin rodziny” lub „Członek rodziny”.  
FR-02  Autoryzacja: e-mail, hasło + reset hasła via e-mail. Login (imię/nick) jest osobnym polem w profilu.
FR-03  Admin tworzy gospodarstwo domowe (nazwa) i otrzymuje 6-cyfrowy PIN; członek dołącza, podając PIN.  
FR-04  Dzienny widok kalendarza z dwoma kolumnami: To Do / Done; możliwość przełączania dni (przeszłe / przyszłe) oraz przyciskiem dodawania obowiązków do danego dnia (button "Dodaj").  
FR-05  Lista 50 zadań wbudowanych + możliwość dodania/edycji/usunięcia własnych zadań (tytuł, pora dnia (rano, popołudniu, wieczorem), emoji z puli ~50 ikon).
FR-06  Przeciąganie lub klik do zmiany statusu zadania (To Do → Done, odwrotnie). 
FR-07  Moliwość przypisania członka rodziny (siebie lub kogoś innego) do zadania (zarówno w statusie To Do jak i Done)
FR-08  Limit 50 zadań dziennie na gospodarstwo; po przekroczeniu przycisk „Dodaj” jest ukrywany.  
FR-09  Obsługa RWD - desktop, tablet, telefon.  
FR-10  Edycja i usuwanie zadań tylko dodanych przez danego członka rodziny.  
FR-11  Log audytowy (tworzenie, przypisanie, status, edycje) zapisywany w bazie, brak widoku UI w MVP.    
FR-12  Język: EN z detekcją przeglądarki.
FR-13  Dane o obowiązkach przechowywane są w sposób zapewniający skalowalność i bezpieczeństwo.
FR-14  Dane osobowe userów i ich obowiązków domowych przechowywane zgodnie z RODO
FR-15  Prawo do wglądu i usunięcia danych (konto wraz z obowiązkami) na wniosek usera.
FR-16  Tylko zalogowany user moze widzieć widok dzienny, listę zadań/obowiązków itd.
FR-17  System punktów: każde zadanie ma przypisaną liczbę punktów (0-100); po oznaczeniu "Done" punkty są dodawane do konta użytkownika. Punkty kumulują się i mogą być wykorzystane do nagród (np. 1 h gry na komputerze). W MVP tylko gromadzenie punktów, bez ekranu nagród.


## 4. Granice produktu
• Brak powiadomień push/SMS, aplikacji mobilnej, sortowania ani filtrowania zadań w MVP.  
• Jedno gospodarstwo na jedno konto admina; brak obsługi wielu gospodarstw.  
• Brak eksportu danych i panelu statystyk w MVP.  
• Realtime odświeżanie opcjonalne (rozważane tylko dla zmiany statusu).
• UI nagród i wymiany punktów poza MVP (punkty są zapisywane w bazie).

## 5. Historyjki użytkowników

### US-001: Rejestracja admina
**Jako nowy użytkownik chcę utworzyć gospodarstwo, nadać mu nazwę i otrzymać PIN, aby zaprosić rodzinę.**

**Kryteria akceptacji:**
1. Formularz rejestracji z rolą „Admin"
2. Po wysłaniu: konto utworzone, PIN i nazwa zapisane, e-mail potwierdzający wysłany
3. Użytkownik zostaje zalogowany i widzi pustą listę zadań na dany dzień

---

### US-002: Rejestracja członka
**Jako członek rodziny chcę dołączyć, przy rejestracji podaję PIN, abym widział wspólne obowiązki.**

**Kryteria akceptacji:**
1. Formularz z polem PIN
2. PIN zweryfikowany; konto przypisane do gospodarstwa
3. Po rejestracji użytkownik widzi dzisiejszy widok zadań

---

### US-003: Reset hasła
**Jako użytkownik chcę zresetować hasło, gdy je zapomnę.**

**Kryteria akceptacji:**
1. Link „Zapomniałeś hasła"
2. E-mail resetujący wysłany
3. Po ustawieniu nowego hasła mogę się zalogować

---

### US-004: Przegląd dzienny
**Jako użytkownik chcę widzieć obowiązki na dziś podzielone na To Do i Done.**

**Kryteria akceptacji:**
1. Dwie kolumny widoczne
2. Zadania przypisane odpowiednio do statusu
3. Widok responsywny na mobile
4. W danym zadaniu widzę: tytuł, opcjonalnie czas, emoji, osobę przypisaną

---

### US-005: Nawigacja dni
**Jako użytkownik chcę przełączać się na wczorajsze i jutrzejsze dni, by planować lub sprawdzić wykonanie.**

**Kryteria akceptacji:**
1. Strzałki / date-picker pozwalają zmienić dzień
2. Dane ładowane dla wybranej daty

---

### US-006: Dodanie zadania
**Jako użytkownik chcę dodać nowe zadanie z tytułem (obowiązkowe), porą dnia (rano, popołudniu, wieczorem) (opcjonalnie) i emoji (opcjonalnie).**

**Kryteria akceptacji:**
1. Formularz dodawania otwiera się
2. Walidacja pola tytułu (50 znaków) i limit emoji (1)
3. Po zapisaniu zadanie pojawia się w kolumnie To Do

---

### US-007: Wybór z listy
**Jako użytkownik chcę wybrać zadanie z predefiniowanej listy 50 pozycji, by szybciej tworzyć obowiązki.**

**Kryteria akceptacji:**
1. Lista predefiniowana wyświetla 50 pozycji
2. Wybranie pozycji dodaje ją do dzisiejszej listy

---

### US-008: Przypisanie się
**Jako użytkownik chcę przypisać się do zadania w To Do, aby było jasne, kto je wykona.**

**Kryteria akceptacji:**
1. Klik „Przypisz" (pokazuje się lista dostępnych członków rodziny, mogę wybrać kogoś lub siebie)
2. Ikona/tekst wskazuje przypisanego użytkownika

---

### US-009: Oznaczenie Done
**Jako użytkownik chcę przenieść zadanie do kolumny Done, gdy je wykonam.**

**Kryteria akceptacji:**
1. Drag-and-drop lub przycisk „Zrobione"
2. Status zadania zmieniony; aktualizacja widoczna wszystkim

---

### US-010: Edycja zadania
**Jako użytkownik chcę edytować tytuł/porę/emoji zadania, także z przeszłych dni.**

**Kryteria akceptacji:**
1. Edycja dostępna
2. Zmiany zapisują się; log audytowy aktualizowany
3. Edytować status mogę każdego zadania, natomiast tytuł, czas i emoji tylko zadania dopisanego przeze mnie

---

### US-011: Usunięcie zadania
**Jako użytkownik chcę usunąć zadanie, które jest nieaktualne.**

**Kryteria akceptacji:**
1. Akcja „Usuń" z potwierdzeniem
2. Zadanie znika z widoku danego dnia

### US-012: Zdobywanie punktów
**Jako** członek rodziny **chcę** otrzymywać punkty za każde ukończone zadanie, **aby** mieć motywację i móc je później wymienić na nagrody.

**Kryteria akceptacji:**
1. Po oznaczeniu zadania "Done" liczba punktów przypisana do zadania dodaje się do mojego konta.
2. Punkty są przechowywane w profilu użytkownika.
3. W MVP brak widoku nagród; punkty można zobaczyć w profilu (lub tylko w bazie).


## 6. Metryki sukcesu
• MS-01 Średnio 2 lub więcej obowiązków dodawanych dziennie na aktywnego członka gospodarstwa
```