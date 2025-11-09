import { createClient } from '@supabase/supabase-js';

// Use environment variables for all configuration
// Get Supabase values from: supabase status -o env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.TEST_USER_ID;

if (!supabaseUrl || !supabaseServiceKey || !userId) {
  console.error('Missing required environment variables:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('- TEST_USER_ID');
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

async function testFreshCalc() {
  try {
    const { data: result, error } = await supabase
      .from('daily_chores')
      .select('points')
      .eq('assignee_id', userId)
      .eq('status', 'done')
      .is('deleted_at', null);

    if (error) {
      console.error('Error:', error);
      return;
    }

    const total = result.reduce((sum, chore) => sum + (chore.points || 0), 0);
    console.log('Fresh calculated points:', total);
    console.log('Chores found:', result.length);
    console.log('Chores:', result);
  } catch (error) {
    console.error('Exception:', error);
  }
}

testFreshCalc();
