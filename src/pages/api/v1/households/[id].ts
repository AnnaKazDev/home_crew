import type { APIRoute } from 'astro';
import { UpdateHouseholdCmdSchema, updateHousehold } from '@/lib/households.service';
import {
  getSupabaseServiceClient,
  DEFAULT_USER_ID,
  type SupabaseClient,
} from '@/db/supabase.client';

export const prerender = false;

/**
 * PATCH /v1/households/:id
 * Updates household information (admin only)
 *
 * Request body: UpdateHouseholdCmd
 * Response: 200 OK with HouseholdDTO (includes PIN for admin)
 */
export const PATCH: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Household ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let requestData: unknown;
    try {
      requestData = await context.request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate using Zod schema
    const validationResult = UpdateHouseholdCmdSchema.safeParse(requestData);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return new Response(JSON.stringify({ error: 'Validation error', details }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // Update the household
    try {
      const household = await updateHousehold(supabase, id, DEFAULT_USER_ID, validationResult.data);

      return new Response(JSON.stringify(household), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'NOT_HOUSEHOLD_MEMBER') {
        return new Response(JSON.stringify({ error: 'Not a member of this household' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (errorMessage === 'NOT_HOUSEHOLD_ADMIN') {
        return new Response(
          JSON.stringify({
            error: 'Only household administrators can update household information',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.error('Service error updating household:', serviceError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unexpected error in PATCH /v1/households/:id:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
