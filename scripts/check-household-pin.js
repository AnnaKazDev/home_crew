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

async function checkHouseholdPin() {
  try {
    const { data, error } = await supabase
      .from('households')
      .select('id, name, current_pin')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Household data:', data[0]);
    console.log('PIN:', data[0]?.current_pin);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkHouseholdPin();
