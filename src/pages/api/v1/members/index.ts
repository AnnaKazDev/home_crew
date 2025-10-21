import type { APIRoute } from "astro";
import { getHouseholdMembers } from "@/lib/household-members.service";
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;

/**
 * GET /v1/members
 * Retrieves all members of the current user's household
 *
 * Response: 200 OK with MemberDTO[] array
 */
export const GET: APIRoute = async (context) => {
  try {
    // For development - use default user (same as other endpoints)
    const supabase = supabaseClient as SupabaseClient;

    // Get household members for current user
    try {
      const members = await getHouseholdMembers(supabase, DEFAULT_USER_ID);

      return new Response(JSON.stringify(members), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      if (errorMessage === "USER_NOT_IN_HOUSEHOLD") {
        return new Response(JSON.stringify({ error: "User not in household" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Service error getting household members:", serviceError);
      return new Response(JSON.stringify({ error: "Internal server error", details: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in GET /v1/members:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
