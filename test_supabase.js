import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
);

async function testSupabase() {
  console.log('Testing Supabase client...');

  // Test getting session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Session:', sessionData?.session ? 'present' : 'null', sessionError?.message);

  if (sessionData?.session) {
    console.log('User ID:', sessionData.session.user.id);
    console.log('User email:', sessionData.session.user.email);

    // Test fetching profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    console.log('Profile fetch result:', profile ? 'success' : 'failed', profileError?.message);
    if (profile) console.log('Profile:', profile);

    // Test fetching household
    const { data: membership, error: membershipError } = await supabase
      .from('household_members')
      .select(`
        role,
        households (
          id,
          name,
          timezone
        )
      `)
      .eq('user_id', sessionData.session.user.id)
      .single();

    console.log('Household fetch result:', membership ? 'success' : 'failed', membershipError?.message);
    if (membership) console.log('Membership:', membership);
  } else {
    console.log('No session found');
  }
}

testSupabase();
