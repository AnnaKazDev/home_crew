import type { APIRoute } from "astro";
import { JoinHouseholdCmdSchema, joinHousehold } from "@/lib/households.service";
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;

/**
 * POST /v1/households/join
 * Joins an existing household using a PIN code
 *
 * Request body: JoinHouseholdCmd
 * Response: 200 OK with HouseholdDTO
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
    const validationResult = JoinHouseholdCmdSchema.safeParse(requestData);
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

    const supabase = supabaseClient as SupabaseClient;

    // Join the household
    try {
      const household = await joinHousehold(supabase, DEFAULT_USER_ID, validationResult.data);

      return new Response(JSON.stringify(household), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      if (errorMessage === "USER_ALREADY_IN_HOUSEHOLD") {
        return new Response(JSON.stringify({ error: "User already belongs to a household" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "INVALID_PIN") {
        return new Response(JSON.stringify({ error: "Invalid PIN" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "PIN_EXPIRED") {
        return new Response(JSON.stringify({ error: "PIN has expired" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Service error joining household:", serviceError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in POST /v1/households/join:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

