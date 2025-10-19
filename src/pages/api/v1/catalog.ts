import type { APIRoute } from 'astro';
import { 
  CreateCatalogItemCmdSchema, 
  createCatalogItem,
  getCatalogItems,
  updateCatalogItem,
  deleteCatalogItem,
  UpdateCatalogItemCmdSchema
} from '@/lib/choresCatalog.service';
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import type { Database } from '@/db/database.types';

export const prerender = false;

/**
 * GET /v1/catalog
 * Fetches all active catalog items for the user's household
 * 
 * Response: 200 OK with CatalogItemDTO[]
 */
export const GET: APIRoute = async () => {
  try {
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

    // Fetch catalog items
    try {
      const catalogItems = await getCatalogItems(supabase, householdId);

      return new Response(
        JSON.stringify(catalogItems),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (serviceError) {
      console.error('Service error fetching catalog items:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error in GET /v1/catalog:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /v1/catalog
 * Creates a new custom chore in the household's catalog
 * 
 * Request body: CreateCatalogItemCmd
 * Response: 201 Created with CatalogItemDTO
 */
export const POST: APIRoute = async (context) => {
  try {
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
    const validationResult = CreateCatalogItemCmdSchema.safeParse(requestData);
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

    // Create the catalog item
    try {
      const catalogItem = await createCatalogItem(
        supabase,
        householdId,
        DEFAULT_USER_ID,
        validationResult.data
      );

      return new Response(
        JSON.stringify(catalogItem),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'DUPLICATE_TITLE') {
        return new Response(
          JSON.stringify({ error: 'Duplicate title' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.error('Service error creating catalog item:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /v1/catalog:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PATCH /v1/catalog/[id]
 * Updates a catalog item (partial update)
 * Route params: id
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
    console.error('Unexpected error in PATCH /v1/catalog:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /v1/catalog/[id]
 * Soft-deletes a catalog item
 * Route params: id
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
    console.error('Unexpected error in DELETE /v1/catalog:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
