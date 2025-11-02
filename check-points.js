import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPoints() {
  console.log('Sprawdzanie punktów po migracji...');

  try {
    const currentUserId = 'e9d12995-1f3e-491d-9628-3c4137d266d1';

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
