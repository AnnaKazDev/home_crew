import type { APIRoute } from "astro";
import type { CatalogItemDTO } from "@/types";
import { CreateCatalogItemCmdSchema, createCatalogItem, getCatalogItems } from "@/lib/choresCatalog.service";
import { getSupabaseServiceClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;
// Fallback predefined items when Supabase is unavailable (dev-only convenience)
const FALLBACK_PREDEFINED_ITEMS: CatalogItemDTO[] = [
  { id: "cat-1", title: "Dust furniture", emoji: "🪑", time_of_day: "any" as const, category: "Living Room", points: 25, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-2", title: "Wash dishes", emoji: "🍽️", time_of_day: "any" as const, category: "Kitchen", points: 40, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-3", title: "Take out trash", emoji: "🗑️", time_of_day: "any" as const, category: "Kitchen", points: 20, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-4", title: "Clean stovetop", emoji: "🔥", time_of_day: "any" as const, category: "Kitchen", points: 60, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-5", title: "Change bed sheets", emoji: "🛌", time_of_day: "any" as const, category: "Bedroom", points: 35, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-6", title: "Clean toilet", emoji: "🚽", time_of_day: "any" as const, category: "Bathroom", points: 60, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-7", title: "Make bed", emoji: "🛏️", time_of_day: "morning" as const, category: "Bedroom", points: 5, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-8", title: "Feed dog", emoji: "🐕", time_of_day: "morning" as const, category: "Pets", points: 5, predefined: true, created_by_user_id: null, created_at: new Date().toISOString(), deleted_at: null },
];

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

    let type = typeParam as "all" | "predefined" | "custom";

    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // For predefined queries we don't need household context
    let householdId: string | null = null;

    if (type !== "predefined") {
      const { data: householdMember } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", DEFAULT_USER_ID)
        .single();

      if (!householdMember) {
        // No household → gracefully fall back to predefined only
        type = "predefined";
      } else {
        householdId = householdMember.household_id;
      }
    }

    // Get catalog items
    try {
      const catalogItems = await getCatalogItems(supabase, householdId, type);

      return new Response(JSON.stringify(catalogItems), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Graceful fallback to predefined static items when DB is unavailable
      return new Response(JSON.stringify(FALLBACK_PREDEFINED_ITEMS), {
        status: 200,
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
    const supabase = getSupabaseServiceClient() as SupabaseClient;
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
