import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'
);

async function checkRLS() {
  console.log('Checking RLS status for tables...');

  const tables = ['profiles', 'households', 'household_members', 'daily_chores', 'chores_catalog'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('schemaname, tablename, rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', table)
        .single();

      if (error) {
        console.log(`${table}: Error - ${error.message}`);
      } else {
        console.log(`${table}: RLS ${data.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
      }
    } catch (error) {
      console.log(`${table}: Exception - ${error.message}`);
    }
  }

  console.log('\nChecking profiles data...');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.log('Profiles error:', error);
    } else {
      console.log('Profiles:', profiles);
    }
  } catch (error) {
    console.log('Profiles exception:', error);
  }

  console.log('\nChecking auth users...');
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('Auth users error:', error);
    } else {
      console.log('Auth users:', authUsers.users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })));
    }
  } catch (error) {
    console.log('Auth users exception:', error);
  }

  console.log('\nTesting profile fetch as authenticated user...');
  // Symuluj logowanie - to nie zadziała bez prawdziwej sesji, ale sprawdzę bez autentykacji
  try {
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'a32953da-0bf1-4c7b-828e-d38207c5f1fe')
      .single();

    if (testError) {
      console.log('Test profile fetch error:', testError);
    } else {
      console.log('Test profile fetch success:', testProfile);
    }
  } catch (error) {
    console.log('Test profile fetch exception:', error);
  }

  console.log('\nUpdating test profile name...');
  try {
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({ name: 'Test User' })
      .eq('id', 'a32953da-0bf1-4c7b-828e-d38207c5f1fe')
      .select();

    if (updateError) {
      console.log('Update profile error:', updateError);
    } else {
      console.log('Update profile success:', updateResult);
    }
  } catch (error) {
    console.log('Update profile exception:', error);
  }
}

checkRLS();
