import type { APIRoute } from 'astro';
import { getHouseholdMembers } from '@/lib/household-members.service';
import {
  getSupabaseServiceClient,
  DEFAULT_USER_ID,
  type SupabaseClient,
} from '@/db/supabase.client';

export const prerender = false;

/**
 * GET /v1/members
 * Retrieves all members of the current user's household
 *
 * Response: 200 OK with MemberDTO[] array
 */
export const GET: APIRoute = async () => {
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

    // Get household members for current user
    try {
      const members = await getHouseholdMembers(supabase, userId);

      return new Response(JSON.stringify(members), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'USER_NOT_IN_HOUSEHOLD') {
        return new Response(JSON.stringify({ error: 'User not in household' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.error('Service error getting household members:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: errorMessage }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error in GET /v1/members:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
