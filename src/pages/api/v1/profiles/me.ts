import type { APIRoute } from "astro";
import { getProfile, updateProfile, UpdateProfileCmdSchema } from "@/lib/profiles.service";
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;

/**
 * GET /v1/profiles/me
 * Retrieves the current user's profile information
 *
 * Response: 200 OK with ProfileDTO
 * Errors: 404 Not Found (profile doesn't exist), 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    const supabase = supabaseClient as SupabaseClient;

    // Get the user's profile
    try {
      const profile = await getProfile(supabase, DEFAULT_USER_ID);

      return new Response(JSON.stringify(profile), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      if (errorMessage === "PROFILE_NOT_FOUND") {
        return new Response(JSON.stringify({ error: "Profile not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error in getProfile service:", serviceError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in GET /v1/profiles/me:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * PATCH /v1/profiles/me
 * Updates the current user's profile information
 *
 * Request body: UpdateProfileCmd
 * Response: 200 OK with updated ProfileDTO
 * Errors: 400 Bad Request (invalid JSON/validation), 404 Not Found (profile doesn't exist), 500 Internal Server Error
 */
export const PATCH: APIRoute = async (context) => {
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
    const validationResult = UpdateProfileCmdSchema.safeParse(requestData);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return new Response(JSON.stringify({ error: "Validation failed", details }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = supabaseClient as SupabaseClient;

    // Update the user's profile
    try {
      const updatedProfile = await updateProfile(supabase, DEFAULT_USER_ID, validationResult.data);

      return new Response(JSON.stringify(updatedProfile), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      if (errorMessage === "PROFILE_NOT_FOUND") {
        return new Response(JSON.stringify({ error: "Profile not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error in updateProfile service:", serviceError);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: errorMessage,
          stack: serviceError instanceof Error ? serviceError.stack : undefined,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error in PATCH /v1/profiles/me:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
