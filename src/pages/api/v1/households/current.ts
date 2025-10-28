import type { APIRoute } from "astro";
import { getHouseholdForUser } from "@/lib/households.service";
import { getSupabaseServiceClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;

/**
 * GET /v1/households/current
 * Retrieves information about the current user's household
 * Includes PIN only for household administrators
 *
 * Response: 200 OK with HouseholdDTO (PIN included only for admins)
 */
export const GET: APIRoute = async (context) => {
  try {
    const supabase = getSupabaseServiceClient() as SupabaseClient;


    // Get household for current user
    try {
      const household = await getHouseholdForUser(supabase, DEFAULT_USER_ID);

      if (!household) {
        return new Response(JSON.stringify({ error: "User not in any household" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(household), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (serviceError) {
      console.error("Service error getting household:", serviceError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in GET /v1/households/current:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
