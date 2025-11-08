import type { APIRoute } from 'astro';
import { CreateHouseholdCmdSchema, createHousehold } from '@/lib/households.service';
import type { SupabaseClient } from '@/db/supabase.client';

export const prerender = false;

/**
 * POST /v1/households
 * Creates a new household and makes the authenticated user its administrator
 *
 * Request body: CreateHouseholdCmd
 * Response: 201 Created with CreateHouseholdDTO (includes PIN)
 */
export const POST: APIRoute = async (context) => {
  try {
    // Get authenticated user
    const supabase = context.locals.supabase as SupabaseClient;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
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
    const validationResult = CreateHouseholdCmdSchema.safeParse(requestData);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return new Response(JSON.stringify({ error: 'Validation error', details }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create the household
    try {
      const household = await createHousehold(supabase, user.id, validationResult.data);

      return new Response(JSON.stringify(household), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'USER_ALREADY_IN_HOUSEHOLD') {
        return new Response(JSON.stringify({ error: 'User already belongs to a household' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.error('Service error creating household:', serviceError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unexpected error in POST /v1/households:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
