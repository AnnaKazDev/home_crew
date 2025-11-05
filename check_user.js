import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'
);

async function checkUser() {
  console.log('Checking user: eeb99f16-e998-4a5f-8fc6-7d987221dee9');

  try {
    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'eeb99f16-e998-4a5f-8fc6-7d987221dee9')
      .single();

    console.log('Profile exists:', !!profile, profileError?.message);
    if (profile) console.log('Profile data:', profile);

    // Check household_members table
    const { data: membership, error: membershipError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', 'eeb99f16-e998-4a5f-8fc6-7d987221dee9');

    console.log('Household membership exists:', membership?.length > 0, membershipError?.message);
    if (membership && membership.length > 0) console.log('Membership data:', membership);

    // Check auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById('eeb99f16-e998-4a5f-8fc6-7d987221dee9');
    console.log('Auth user exists:', !!authUser?.user, authError?.message);
    if (authUser?.user) console.log('Auth user email:', authUser.user.email);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
