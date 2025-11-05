# 🔐 Problemy z Rejestracją i Logowaniem

*Lista krytycznych problemów związanych z bezpieczeństwem i funkcjonalnością systemu autoryzacji.*

## 🚨 **KRYTYCZNE PROBLEMY BEZPIECZEŃSTWA:**

### 1. **PILNE: Słabe hashowanie PIN-ów gospodarstw**
**Plik:** `src/pages/api/auth/register.ts`
**Problem:** Używane jest niebezpieczne "hashowanie" PIN:
```typescript
function hashPIN(pin: string): string {
  return `hashed_${pin}`; // ❌ NIEBEZPIECZNE!
}
```
**Ryzyko:** PIN-y są przechowywane w czytelnej formie w bazie danych.
**Rozwiązanie:** Zaimplementować bcrypt lub argon2.

### 2. **Niespójna architektura autoryzacji**
**Problem:**
- `RegisterForm.tsx` używa API endpoint `/api/auth/register` ✅
- `LoginForm.tsx` bezpośrednio wywołuje Supabase bez API endpoint ❌
**Rozwiązanie:** Wszystkie operacje auth powinny przechodzić przez API endpoints.

## 🛠️ **BRAKUJĄCE FUNKCJONALNOŚCI:**

### 3. **Nieaktywny middleware bezpieczeństwa**
**Plik:** `src/middleware/index.ts`
**Problem:** Middleware sprawdza chronione route'y, ale **niczego nie robi**:
```typescript
if (requiresAuth) {
  // For server-side rendering, we need to check auth server-side
  // Since we're using client-side auth store, we'll let the components handle it
  // But we can still redirect on the client side as implemented in the components
}
```
**Rozwiązanie:** Zaimplementować rzeczywistą ochronę route'ów po stronie serwera.

### 4. **Brak obsługi refresh token**
**Problem:** Brak automatycznego odświeżania tokenów JWT.
**Rozwiązanie:** Zaimplementować mechanizm refresh token w Supabase client.

### 5. **Brak testów bezpieczeństwa**
**Problem:** Brak testów dla krytycznych funkcji autoryzacji.
**Rozwiązanie:** Dodać testy jednostkowe i integracyjne dla auth.

## 🔧 **PROBLEMY TECHNICZNE:**

### 6. **Niespójne zmienne środowiskowe**
**Problem:** W różnych miejscach kodu różne kombinacje zmiennych środowiskowych:
- Czasem `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`
- Czasem `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- Czasem fallback między nimi
**Rozwiązanie:** Ujednolicić używane zmienne środowiskowe.

### 7. **Brak rate limiting po stronie klienta**
**Problem:** Brak client-side rate limiting dla prób logowania.
**Rozwiązanie:** Dodać throttling po stronie klienta dla bezpieczeństwa.

## 📋 **PLAN NAPRAWY:**

### Priorytet 1 - Krytyczne bezpieczeństwo (natychmiast)
- [ ] Zaimplementować właściwe hashowanie PIN (bcrypt)
- [ ] Naprawić middleware do rzeczywistej ochrony route'ów
- [ ] Dodać testy bezpieczeństwa dla auth

### Priorytet 2 - Architektura (w tym tygodniu)
- [ ] Ujednolicić podejście do autoryzacji (tylko API endpoints)
- [ ] Zaimplementować obsługę refresh token
- [ ] Ujednolicić zmienne środowiskowe

### Priorytet 3 - UX i bezpieczeństwo (do końca sprintu)
- [ ] Dodać client-side rate limiting
- [ ] Poprawić obsługę błędów autoryzacji
- [ ] Dodać testy integracyjne dla całego flow rejestracji/logowania

## 🔍 **DOTYCZY PLIKÓW:**
- `src/pages/api/auth/register.ts`
- `src/pages/api/auth/login.ts`
- `src/components/LoginForm.tsx`
- `src/components/RegisterForm.tsx`
- `src/middleware/index.ts`
- `src/db/supabase.client.ts`

## ✅ **STATUS:**
- **Rozpoznane:** 2025-01-03
- **Priorytet:** Krytyczny
- **Przypisane do:** [nazwa developera]
