import type { APIRoute } from 'astro';
import { 
  updateCatalogItem,
  deleteCatalogItem,
  UpdateCatalogItemCmdSchema 
} from '@/lib/choresCatalog.service';
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import type { Database } from '@/db/database.types';

export const prerender = false;

/**
 * PATCH /v1/catalog/{id}
 * Updates a catalog item (partial update)
 * 
 * Request body: Partial UpdateCatalogItemCmd (all fields optional)
 * Response: 200 OK with updated CatalogItemDTO
 */
export const PATCH: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Item ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let requestData: unknown;
    try {
      requestData = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate using Zod schema
    const validationResult = UpdateCatalogItemCmdSchema.safeParse(requestData);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return new Response(
        JSON.stringify({ error: 'Validation error', details }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get household for the current user
    const supabase = supabaseClient as SupabaseClient;
    const { data: householdMember, error: householdError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', DEFAULT_USER_ID)
      .single();

    if (householdError || !householdMember) {
      console.error('Household lookup error:', householdError);
      return new Response(
        JSON.stringify({ error: 'Household not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const householdId = householdMember.household_id;

    // Update the catalog item
    try {
      const updatedItem = await updateCatalogItem(
        supabase,
        householdId,
        id,
        validationResult.data
      );

      return new Response(
        JSON.stringify(updatedItem),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'NOT_FOUND') {
        return new Response(
          JSON.stringify({ error: 'Item not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (errorMessage === 'DUPLICATE_TITLE') {
        return new Response(
          JSON.stringify({ error: 'Duplicate title' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.error('Service error updating catalog item:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error in PATCH /v1/catalog/{id}:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /v1/catalog/{id}
 * Soft-deletes a catalog item (sets deleted_at timestamp)
 * 
 * Response: 204 No Content on success
 */
export const DELETE: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Item ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get household for the current user
    const supabase = supabaseClient as SupabaseClient;
    const { data: householdMember, error: householdError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', DEFAULT_USER_ID)
      .single();

    if (householdError || !householdMember) {
      console.error('Household lookup error:', householdError);
      return new Response(
        JSON.stringify({ error: 'Household not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const householdId = householdMember.household_id;

    // Delete the catalog item
    try {
      await deleteCatalogItem(supabase, householdId, id);

      return new Response(null, { status: 204 });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'NOT_FOUND') {
        return new Response(
          JSON.stringify({ error: 'Item not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.error('Service error deleting catalog item:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error in DELETE /v1/catalog/{id}:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
