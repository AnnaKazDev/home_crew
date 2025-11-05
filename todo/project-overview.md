# Home Crew - Team TODO & Documentation

*Ten plik zawiera nasze pomysły, zadania, decyzje, notatki zespołu. Nie jest commitowany do repo - służy tylko do wewnętrznego użytku zespołu.*

## 🏗️ Architektura & Decyzje

### ✅ Zaimplementowane
- **Client-side auth**: Uwierzytelnianie obsługiwane przez `useAuthRedirect` hook zamiast middleware
- **Success screen dla admina**: Zielona karta z PIN po rejestracji administratora
- **Globalna ochrona route'ów**: Wszystkie chronione strony używają `useAuthRedirect`
- **Hook kolejność naprawiona**: Wszystkie hooki wywoływane w tej samej kolejności (fix błędu "change in the order of Hooks")

### 🔄 Ongoing
- **Email confirmations**: Obecnie wyłączone w dev (`enable_confirmations = false`), włączone w prod

## 🎯 Priorytety na następne sprinty

### MVP Features (do zakończenia)
- [ ] System punktów - dodawanie punktów za ukończone zadania
- [ ] Statystyki punktów w profilu użytkownika
- [ ] Edycja zadań (usuwanie działa, edycja TODO)
- [ ] Drag & drop między kolumnami To Do / Done
- [ ] Responsywność mobile/tablet

### Future Enhancements
- [ ] Obsługa resetowania hasła (Supabase Auth integration)
- [ ] Powiadomienia push/email o nowych zadaniach
- [ ] Kategorie zadań z ikonami emoji
- [ ] Harmonogram powtarzających się zadań
- [ ] Eksport danych użytkownika
- [ ] Wielojęzyczność (EN/PL)
- [ ] Dark/Light theme toggle (częściowo zrobione)

## 🐛 Znane problemy & TODO

### Błędy do naprawienia
- [ ] Hook errors naprawione ✅ (2025-01-03)
- [ ] Auth redirect loops - sprawdzić edge cases

### UX Improvements
- [ ] Loading states w komponentach (zamiast pustych ekranów)
- [ ] Error boundaries dla lepszej obsługi błędów
- [ ] Toast notifications dla akcji użytkownika
- [ ] Animacje przejść między stanami

## 📝 Notatki techniczne

### Supabase Configuration
- **Local dev**: `enable_confirmations = false` (szybkie testowanie)
- **Production**: `enable_confirmations = true` (bezpieczeństwo)
- **Email testing**: Inbucket na `localhost:54324`

### Database Schema Notes
- **RLS enabled**: Wszystkie tabele mają Row Level Security
- **Household isolation**: Użytkownicy widzą tylko swoje gospodarstwo
- **PIN security**: Hashed PINs w bazie, plaintext tylko dla admina

### Component Patterns
- **useAuthRedirect**: Globalny hook do przekierowań niezalogowanych
- **Success screens**: Zielone karty dla pozytywnych akcji (rejestracja admina)
- **Loading states**: Skeleton loaders zamiast spinnerów

## 🎨 UI/UX Decisions

### Colors & Themes
- **Success**: Green-50/100/200/600/700 (zielone dla sukcesów)
- **Primary**: Purple-600/700 (fioletowe dla głównych akcji)
- **Background**: Dynamiczne dla light/dark theme

### Component Library
- **Shadcn/ui**: Buttons, Cards, Select, Dialogs
- **Lucide**: Icons (Copy, Eye, EyeOff, etc.)
- **Tailwind**: Utility-first CSS z custom design tokens

## 🚀 Deployment & Production

### Environment Variables Needed
```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 🔍 Pre-deployment Testing Checklist

#### Auth & Security
- [ ] **Email confirmations włączone** w prod (`enable_confirmations = true`)
- [ ] **RLS policies włączone** dla wszystkich tabel
- [ ] **SMTP skonfigurowany** dla wysyłania emaili potwierdzających
- [ ] **Rate limiting ustawiony** (nie więcej niż 2 emaile/h w dev)
- [ ] **HTTPS wymuszone** dla wszystkich endpointów

#### Functional Testing
- [ ] **Rejestracja admina** - zielona karta z PIN wyświetla się poprawnie
- [ ] **Rejestracja członka** - przekierowanie po wpisaniu PIN działa
- [ ] **Logowanie/wylogowanie** - działa bez błędów
- [ ] **Ochrona route'ów** - niezalogowani są przekierowywani na /auth
- [ ] **Hook errors** - brak błędów "change in the order of Hooks"
- [ ] **Responsywność** - działa na mobile/tablet/desktop

#### Data & Database
- [ ] **Profile creation** - automatycznie po rejestracji
- [ ] **Household creation** - tylko dla adminów z nazwą i PIN
- [ ] **Member joining** - walidacja PIN działa
- [ ] **Points system** - podstawowe dodawanie punktów
- [ ] **Seed data** - testowe dane dla developmentu

#### UI/UX Testing
- [ ] **Loading states** - zamiast pustych ekranów
- [ ] **Error handling** - przyjazne komunikaty błędów
- [ ] **Success screens** - zielone karty dla pozytywnych akcji
- [ ] **Copy PIN button** - działa poprawnie w Household settings
- [ ] **Theme toggle** - dark/light mode działa

### 🚨 Production-Specific Settings
- **Supabase Config Changes:**
  ```toml
  [auth.email]
  enable_confirmations = true  # zmienić z false na true

  [auth]
  site_url = "https://twoja-domena.com"  # zmienić z localhost
  ```
- **Environment Variables:**
  - `PUBLIC_SITE_URL` - produkcyjna domena
  - SMTP credentials dla emaili
  - Analytics tokens jeśli używane

### 📊 Monitoring & Analytics
- [ ] **Error tracking** - Sentry/LogRocket skonfigurowany
- [ ] **Analytics** - Google Analytics/Mixpanel podłączony
- [ ] **Performance monitoring** - Core Web Vitals tracking

---

*Pamiętaj:** Przed każdym deploymentem sprawdzić czy `enable_confirmations = true` w supabase config! W dev jest `false` dla szybkiego testowania, ale w prod musi być `true` dla bezpieczeństwa.

## 💡 Pomysły & Brainstorming

### Możliwe rozszerzenia
- **Family rewards system**: Wymienianie punktów na nagrody
- **Task templates**: Gotowe zestawy zadań dla różnych rodzin
- **Time tracking**: Jak długo zajmuje wykonanie zadania
- **Photo attachments**: Zdjęcia zrobionych zadań
- **Voice notes**: Dyktafon dla zadań

### Integracje
- **Google Calendar**: Sync z kalendarzem rodzinnym
- **Slack/Discord**: Powiadomienia o nowych zadaniach
- **IFTTT/Zapier**: Automatyzacja z innymi serwisami

---

*Dodawaj swoje pomysły, zadania i notatki poniżej. Używaj formatowania markdown dla czytelności.*
