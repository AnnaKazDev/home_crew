import type { APIRoute } from "astro";
import { CreateCatalogItemCmdSchema, createCatalogItem, getCatalogItems } from "@/lib/choresCatalog.service";
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;

/**
 * GET /v1/catalog
 * Fetches catalog items for the user's household
 * Query params: type (optional, default: 'all')
 *   - 'all': predefined + custom items (default)
 *   - 'predefined': only global predefined items
 *   - 'custom': only custom items for this household
 *
 * Response: 200 OK with CatalogItemDTO[]
 */
export const GET: APIRoute = async (context) => {
  try {
    // Parse query parameter
    const url = new URL(context.request.url);
    const typeParam = url.searchParams.get("type") || "all";

    // Validate type parameter
    const validTypes = ["all", "predefined", "custom"];
    if (!validTypes.includes(typeParam)) {
      return new Response(
        JSON.stringify({
          error: "Invalid type parameter",
          details: `type must be one of: ${validTypes.join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const type = typeParam as "all" | "predefined" | "custom";

    const supabase = supabaseClient as SupabaseClient;

    // For predefined queries we don't need household context
    let householdId: string | null = null;

    if (type !== "predefined") {
      const { data: householdMember, error: householdError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", DEFAULT_USER_ID)
        .single();

      if (householdError || !householdMember) {
        return new Response(JSON.stringify({ error: "Household not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      householdId = householdMember.household_id;
    }

    // Get catalog items
    try {
      const catalogItems = await getCatalogItems(supabase, householdId, type);

      return new Response(JSON.stringify(catalogItems), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      // Try to get the catalog items directly to see the actual error
      try {
        let query = supabase.from("chores_catalog").select("*").is("deleted_at", null);

        if (type === "predefined") {
          query = query.eq("predefined", true).is("household_id", null);
        }

        const { data: items, error: dbError } = await query.order("created_at", { ascending: false });

        return new Response(JSON.stringify({
          error: "Service error",
          serviceError: serviceError instanceof Error ? serviceError.message : String(serviceError),
          directQueryError: dbError,
          type: type,
          householdId: householdId
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      } catch (directError) {
        return new Response(JSON.stringify({
          error: "Service error",
          serviceError: serviceError instanceof Error ? serviceError.message : String(serviceError),
          directError: directError instanceof Error ? directError.message : String(directError),
          type: type,
          householdId: householdId
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
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
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate using Zod schema
    const validationResult = CreateCatalogItemCmdSchema.safeParse(requestData);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return new Response(JSON.stringify({ error: "Validation error", details }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get household for the current user
    const supabase = supabaseClient as SupabaseClient;
    const { data: householdMember, error: householdError } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (householdError || !householdMember) {
      return new Response(JSON.stringify({ error: "Household not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const householdId = householdMember.household_id;

    // Create the catalog item
    try {
      const catalogItem = await createCatalogItem(supabase, householdId, DEFAULT_USER_ID, validationResult.data);

      return new Response(JSON.stringify(catalogItem), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      if (errorMessage === "DUPLICATE_TITLE") {
        return new Response(JSON.stringify({ error: "A chore with this title already exists in your household" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};