import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    console.log('Creating test user...');

    const { data, error } = await supabase.auth.admin.createUser({
      user_id: 'e9d12995-1f3e-491d-9628-3c4137d266d1',
      email: 'dev@example.com',
      password: 'password',
      email_confirm: true
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('User created successfully:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestUser();
