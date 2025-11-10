import type { APIRoute } from 'astro';
import {
  UpdateDailyChoreCmdSchema,
  updateDailyChore,
  deleteDailyChore,
} from '@/lib/dailyChores.service';
import {
  getSupabaseServiceClient,
  DEFAULT_USER_ID,
  type SupabaseClient,
} from '@/db/supabase.client';

export const prerender = false;

/**
 * PATCH /v1/daily-chores/:id
 * Updates a daily chore (status or assignee)
 *
 * Request body: UpdateDailyChoreCmd (at least one field required)
 * Response: 200 OK with updated DailyChoreDTO
 */
export const PATCH: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    // Validate ID parameter
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid chore ID',
          details: 'ID must be a valid UUID',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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
    const validationResult = UpdateDailyChoreCmdSchema.safeParse(requestData);
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

    // Get household for the current user (use service client to bypass RLS)
    const supabase = getSupabaseServiceClient() as SupabaseClient;
    const { data: householdMember, error: householdError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', DEFAULT_USER_ID)
      .single();

    if (householdError || !householdMember) {
      return new Response(JSON.stringify({ error: 'User not in any household' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const householdId = householdMember.household_id;

    // Update the daily chore (use service client to bypass RLS)
    try {
      const updatedChore = await updateDailyChore(
        supabase as SupabaseClient,
        householdId,
        id,
        DEFAULT_USER_ID,
        validationResult.data
      );

      return new Response(JSON.stringify(updatedChore), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: 'Daily chore not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (errorMessage === 'UNAUTHORIZED') {
        return new Response(
          JSON.stringify({ error: 'Only the assignee or household admin can update this chore' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (errorMessage === 'ASSIGNEE_NOT_IN_HOUSEHOLD') {
        return new Response(
          JSON.stringify({ error: 'New assignee does not belong to this household' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.error('Service error updating daily chore:', serviceError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unexpected error in PATCH /v1/daily-chores/:id:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * DELETE /v1/daily-chores/:id
 * Soft-deletes a daily chore
 *
 * Response: 204 No Content
 */
export const DELETE: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    // Validate ID parameter
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid chore ID',
          details: 'ID must be a valid UUID',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get household for the current user
    const supabase = getSupabaseServiceClient() as SupabaseClient;
    const { data: householdMember, error: householdError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', DEFAULT_USER_ID)
      .single();

    if (householdError || !householdMember) {
      console.error('Household lookup error:', householdError);
      return new Response(JSON.stringify({ error: 'Household not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const householdId = householdMember.household_id;

    // Delete the daily chore (use service client to bypass RLS)
    try {
      await deleteDailyChore(supabase as SupabaseClient, householdId, id, DEFAULT_USER_ID);

      return new Response(null, {
        status: 204,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: 'Daily chore not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (errorMessage === 'UNAUTHORIZED') {
        return new Response(
          JSON.stringify({ error: 'Only the assignee or household admin can delete this chore' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.error('Service error deleting daily chore:', serviceError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unexpected error in DELETE /v1/daily-chores/:id:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
