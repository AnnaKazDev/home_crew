import { createClient } from '@supabase/supabase-js';

const supabase = createClient('http://127.0.0.1:54321', 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz');
const userId = 'e9d12995-1f3e-491d-9628-3c4137d266d1';

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
