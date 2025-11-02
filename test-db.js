import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'; // Service key for bypassing RLS

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDB() {
  console.log('Testing database connection...');

  try {
    // Test profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('Profiles error:', profilesError);
    } else {
      console.log('Profiles:', profiles);
    }

    // First check what chore catalog items exist
    const { data: catalogItems, error: catalogError } = await supabase
      .from('chores_catalog')
      .select('id, title, points')
      .limit(5);

    if (catalogError) {
      console.error('Catalog error:', catalogError);
    } else {
      console.log('Available catalog items:', catalogItems);

      if (catalogItems && catalogItems.length > 0) {
        // Create a test chore
        console.log('Creating test chore...');
        const { data: createdChore, error: createError } = await supabase
          .from('daily_chores')
          .insert({
            household_id: '11111111-aaaa-bbbb-cccc-222222222222',
            date: new Date().toISOString().split('T')[0],
            chore_catalog_id: catalogItems[0].id,
            assignee_id: 'e9d12995-1f3e-491d-9628-3c4137d266d1',
            points: catalogItems[0].points,
            time_of_day: 'morning',
            status: 'todo'
          })
          .select()
          .single();

        if (createError) {
          console.error('Create chore error:', createError);

          // Try to update the existing chore instead
          const existingChoreId = '30fa14c3-c198-4f1b-ad32-06b31eee7995';
          console.log('Trying to update existing chore...');
          const { data: updatedChore, error: updateError } = await supabase
            .from('daily_chores')
            .update({ status: 'done' })
            .eq('id', existingChoreId)
            .select()
            .single();

          if (updateError) {
            console.error('Update chore error:', updateError);
          } else {
            console.log('Updated chore:', updatedChore);
          }
        } else {
          console.log('Created chore:', createdChore);

          // Try to update the chore status
          console.log('Updating chore status to done...');
          const { data: updatedChore, error: updateError } = await supabase
            .from('daily_chores')
            .update({ status: 'done' })
            .eq('id', createdChore.id)
            .select()
            .single();

          if (updateError) {
            console.error('Update chore error:', updateError);
          } else {
            console.log('Updated chore:', updatedChore);
          }
        }
      }
    }

    // Test daily_chores table
    const { data: chores, error: choresError } = await supabase
      .from('daily_chores')
      .select('*')
      .limit(5);

    if (choresError) {
      console.error('Daily chores error:', choresError);
    } else {
      console.log('Daily chores:', chores);
    }

    // Test points_events table
    const { data: points, error: pointsError } = await supabase
      .from('points_events')
      .select('*')
      .limit(10);

    if (pointsError) {
      console.error('Points events error:', pointsError);
    } else {
      console.log('Points events:', points);
    }

    // Check if profile total_points was updated
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, total_points')
      .eq('id', 'e9d12995-1f3e-491d-9628-3c4137d266d1')
      .single();

    if (profileError) {
      console.error('Profile check error:', profileError);
    } else {
      console.log('Updated profile:', updatedProfile);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDB();
