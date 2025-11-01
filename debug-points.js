import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPoints() {
  console.log('Debugging points discrepancy...');

  try {
    const currentUserId = 'e9d12995-1f3e-491d-9628-3c4137d266d1';
    const today = new Date().toISOString().split('T')[0];

    // 1. Check points from today's completed chores
    console.log('\n1. Today\'s completed chores:');
    const { data: todayChores, error: choresError } = await supabase
      .from('daily_chores')
      .select('id, chore_catalog_id, points, status, created_at')
      .eq('assignee_id', currentUserId)
      .eq('date', today)
      .eq('status', 'done');

    if (choresError) {
      console.error('Chores error:', choresError);
    } else {
      const totalFromChores = todayChores.reduce((sum, chore) => sum + (chore.points || 0), 0);
      console.log('Today\'s completed chores:', todayChores);
      console.log('Total points from today\'s chores:', totalFromChores);
    }

    // 2. Check points_events for today
    console.log('\n2. Today\'s points events:');
    const { data: todayEvents, error: eventsError } = await supabase
      .from('points_events')
      .select('*')
      .eq('user_id', currentUserId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    if (eventsError) {
      console.error('Events error:', eventsError);
    } else {
      const totalFromEvents = todayEvents.reduce((sum, event) => sum + event.points, 0);
      console.log('Today\'s points events:', todayEvents);
      console.log('Total points from today\'s events:', totalFromEvents);
    }

    // 3. Check all points_events for the last 7 days
    console.log('\n3. Points events for last 7 days:');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const { data: allEvents, error: allEventsError } = await supabase
      .from('points_events')
      .select('*')
      .eq('user_id', currentUserId)
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .order('created_at', { ascending: true });

    if (allEventsError) {
      console.error('All events error:', allEventsError);
    } else {
      const totalFromAllEvents = allEvents.reduce((sum, event) => sum + event.points, 0);
      console.log('All points events (last 7 days):', allEvents);
      console.log('Total points from all events (last 7 days):', totalFromAllEvents);
    }

    // 4. Check the mysterious chore
    console.log('\n4. Checking mysterious chore 7e034021-a12e-41bc-b7a0-bddf3139f296:');
    const { data: mysteryChore, error: mysteryError } = await supabase
      .from('daily_chores')
      .select('*')
      .eq('id', '7e034021-a12e-41bc-b7a0-bddf3139f296');

    if (mysteryError) {
      console.error('Mystery chore error:', mysteryError);
    } else {
      console.log('Mystery chore:', mysteryChore);
    }

    // 5. Check all chores for today
    console.log('\n5. All chores for today:');
    const { data: allTodayChores, error: allTodayError } = await supabase
      .from('daily_chores')
      .select('*')
      .eq('date', today);

    if (allTodayError) {
      console.error('All today chores error:', allTodayError);
    } else {
      console.log('All today chores:', allTodayChores);
    }

    // 6. Check profile total_points
    console.log('\n6. Profile total points:');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, total_points')
      .eq('id', currentUserId)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    } else {
      console.log('Profile:', profile);
    }

  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugPoints();
