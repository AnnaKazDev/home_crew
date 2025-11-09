import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Use environment variables for all configuration
// Get Supabase values from: supabase status -o env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test user configuration - set these in your .env.test file
const testUserEmail = process.env.TEST_USER_EMAIL;
const testUserPassword = process.env.TEST_USER_PASSWORD;
const testUserId = process.env.TEST_USER_ID;

if (!supabaseUrl || !supabaseServiceKey || !testUserEmail || !testUserPassword || !testUserId) {
  console.error('Missing required environment variables:');
  console.error('');
  console.error('Supabase configuration:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Test user configuration:');
  console.error('- TEST_USER_EMAIL');
  console.error('- TEST_USER_PASSWORD');
  console.error('- TEST_USER_ID');
  console.error('');
  console.error('Get Supabase values by running: supabase status -o env');
  console.error('Then add all variables to your .env.test file');
  console.error('');
  console.error('Example .env.test:');
  console.error('SUPABASE_URL=http://127.0.0.1:54321');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  console.error('TEST_USER_EMAIL=test@example.com');
  console.error('TEST_USER_PASSWORD=secure_password');
  console.error('TEST_USER_ID=generated_uuid');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  try {
    console.log('Checking if test user exists...');

    // Najpierw sprawdź czy użytkownik już istnieje
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const existingUser = existingUsers.users.find((user) => user.email === testUserEmail);

    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return;
    }

    console.log('Creating test user...');

    const { data, error } = await supabase.auth.admin.createUser({
      user_id: testUserId,
      email: testUserEmail,
      password: testUserPassword,
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('User created successfully:', data.user.email);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestUser();
