import type { APIRoute } from 'astro';
import { CreateCatalogItemCmdSchema, createCatalogItem } from '@/lib/choresCatalog.service';
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import type { Database } from '@/db/database.types';

export const prerender = false;

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
