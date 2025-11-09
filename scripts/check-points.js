import { createClient } from '@supabase/supabase-js';

// Use environment variables for all configuration
// Get Supabase values from: supabase status -o env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const currentUserId = process.env.TEST_USER_ID;

if (!supabaseUrl || !supabaseServiceKey || !currentUserId) {
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

async function checkPoints() {
  console.log('Sprawdzanie punktów po migracji...');

  try {
    // Sprawdź wszystkie points_events z task_date
    const { data: allEvents, error: allEventsError } = await supabase
      .from('points_events')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: true });

    if (allEventsError) {
      console.error('Błąd pobierania wydarzeń:', allEventsError);
    } else {
      console.log('Wszystkie wydarzenia punktów:', allEvents);
    }

    // Sprawdź profile total_points
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, total_points')
      .eq('id', currentUserId)
      .single();

    if (profileError) {
      console.error('Błąd profilu:', profileError);
    } else {
      console.log('Profil:', profile);
    }
  } catch (error) {
    console.error('Błąd:', error);
  }
}

checkPoints();
