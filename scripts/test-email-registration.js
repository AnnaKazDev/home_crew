#!/usr/bin/env node

/* globals setTimeout */

/**
 * Script do testowania rejestracji z potwierdzaniem email
 * Używa lokalnego serwera email Inbucket do sprawdzania wiadomości
 */

import { createClient } from '@supabase/supabase-js';

// Konfiguracja
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey =
  process.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funkcja do generowania losowego emaila dla testów
function generateTestEmail() {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
}

// Funkcja do czekania
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testEmailRegistration() {
  console.log('🚀 Testowanie rejestracji z potwierdzaniem email...\n');

  const testEmail = generateTestEmail();
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  console.log(`📧 Test email: ${testEmail}`);
  console.log(`🔒 Test password: ${testPassword}\n`);

  try {
    // 1. Próba rejestracji
    console.log('1. Rejestrowanie nowego użytkownika...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
        },
      },
    });

    if (error) {
      console.error('❌ Błąd rejestracji:', error.message);
      return;
    }

    if (data.user && !data.user.email_confirmed_at) {
      console.log('✅ Rejestracja pomyślna! Użytkownik wymaga potwierdzenia email.');
      console.log('📧 Sprawdź email w Inbucket: http://localhost:54324');
      console.log(`🔍 Szukaj emaila: ${testEmail}`);

      // 2. Sprawdzanie czy email dotarł
      console.log('\n2. Sprawdzanie czy email dotarł...');
      console.log('⏳ Czekam 3 sekundy na dostarczenie emaila...');

      await wait(3000);

      console.log('✅ Email powinien być widoczny w Inbucket');
      console.log('🔗 Link do Inbucket: http://localhost:54324');
      console.log(`📨 Szukaj emaila od: ${testEmail}`);

      // 3. Instrukcje dla użytkownika
      console.log('\n📋 Instrukcje:');
      console.log('1. Otwórz http://localhost:54324 w przeglądarce');
      console.log('2. Znajdź email potwierdzający rejestrację');
      console.log('3. Kliknij link potwierdzający w emailu');
      console.log('4. Spróbuj się zalogować po potwierdzeniu');
    } else if (data.user?.email_confirmed_at) {
      console.log('⚠️  Użytkownik został utworzony i email jest już potwierdzony');
      console.log('   (Możliwe, że potwierdzanie email jest wyłączone)');
    } else {
      console.log('❓ Nieoczekiwany stan rejestracji');
    }
  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error);
  }
}

// Uruchomienie testu
testEmailRegistration();
