import type { APIRoute } from "astro";
import { getSupabaseServiceClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";
import { getHouseholdForUser, createHousehold } from "@/lib/households.service";

export const prerender = false;

/**
 * POST /v1/households/dev-ensure
 * Ensures a development household exists for DEFAULT_USER_ID and returns it.
 * Dev-only helper to unblock UI flows without auth.
 */
export const POST: APIRoute = async () => {
  try {
    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // If user already in a household, return it
    const existing = await getHouseholdForUser(supabase, DEFAULT_USER_ID);
    if (existing) {
      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a demo household
    const created = await createHousehold(supabase, DEFAULT_USER_ID, { name: "Demo Household" });

    // Fetch and return the full household view (with PIN for admin)
    const household = await getHouseholdForUser(supabase, DEFAULT_USER_ID);
    return new Response(JSON.stringify(household ?? created), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in POST /v1/households/dev-ensure:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};


