import type { APIRoute } from 'astro';
import { getHouseholdForUser } from '@/lib/households.service';
import {
  getSupabaseServiceClient,
  DEFAULT_USER_ID,
  type SupabaseClient,
} from '@/db/supabase.client';

export const prerender = false;

/**
 * GET /v1/households/current
 * Retrieves information about the current user's household
 * Includes PIN only for household administrators
 *
 * Response: 200 OK with HouseholdDTO (PIN included only for admins)
 */
export const GET: APIRoute = async (context) => {
  try {
    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // Try to get authenticated user from session, fallback to DEFAULT_USER_ID for dev
    let userId = DEFAULT_USER_ID;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch (error) {
      console.warn('Could not get authenticated user, using DEFAULT_USER_ID:', error);
    }

    // Get household for current user
    try {
      const household = await getHouseholdForUser(supabase, userId);

      if (!household) {
        return new Response(JSON.stringify({ error: 'User not in any household' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(household), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (serviceError) {
      console.error('Service error getting household:', serviceError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unexpected error in GET /v1/households/current:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
