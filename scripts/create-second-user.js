import { createClient } from '@supabase/supabase-js';

// Use environment variables for all configuration
// Get Supabase values from: supabase status -o env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Get Supabase values by running: supabase status -o env');
  console.error('Then add them to your .env.test file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createSecondUser() {
  try {
    console.log('Checking if second test user exists...');

    // Najpierw sprawdź czy użytkownik już istnieje
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const existingUser = existingUsers.users.find(user => user.email === 'testmember@example.com');

    if (existingUser) {
      console.log('Second test user already exists:', existingUser.email);
      return;
    }

    console.log('Creating second test user...');

    // Create user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'testmember@example.com',
      password: 'password',
      email_confirm: true
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log('User created successfully:', userData.user.email);
    console.log('User ID:', userData.user.id);

    // Update profile name (trigger should create profile automatically)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ name: 'Test Member' })
      .eq('id', userData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }

    console.log('Profile updated successfully');

    // Now join the household using the PIN via direct database insert
    console.log('Joining household with PIN...');

    const { data: joinData, error: joinError } = await supabase
      .from('household_members')
      .insert({
        household_id: '11111111-aaaa-bbbb-cccc-222222222222', // From check-household-pin.js
        user_id: userData.user.id,
        role: 'member'
      });

    if (joinError) {
      console.error('Error joining household:', joinError);
      return;
    }

    console.log('Successfully joined household:', joinData);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createSecondUser();
