import type { APIRoute } from "astro";
import { UpdateMemberRoleCmdSchema, updateMemberRole, removeHouseholdMember } from "@/lib/household-members.service";
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;

/**
 * PATCH /v1/members/:id
 * Updates a household member's role (admin only)
 *
 * Request body: UpdateMemberRoleCmd
 * Response: 200 OK with MemberDTO
 */
export const PATCH: APIRoute = async (context) => {
  try {
    // For development - use default user (same as other endpoints)
    const supabase = supabaseClient as SupabaseClient;

    const { id } = context.params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Member ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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
    const validationResult = UpdateMemberRoleCmdSchema.safeParse(requestData);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return new Response(JSON.stringify({ error: "Validation error", details }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update member role
    try {
      const updatedMember = await updateMemberRole(supabase, id, validationResult.data.role, DEFAULT_USER_ID);

      return new Response(JSON.stringify(updatedMember), {
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

      if (errorMessage === "NOT_HOUSEHOLD_ADMIN") {
        return new Response(JSON.stringify({ error: "Not household admin" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "MEMBER_NOT_FOUND") {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "MEMBER_NOT_IN_SAME_HOUSEHOLD") {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "CANNOT_REMOVE_LAST_ADMIN") {
        return new Response(JSON.stringify({ error: "Cannot remove last admin" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Service error updating member role:", serviceError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in PATCH /v1/members/:id:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE /v1/members/:id
 * Removes a member from household (admin only, soft delete)
 *
 * Response: 204 No Content
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // For development - use default user (same as other endpoints)
    const supabase = supabaseClient as SupabaseClient;

    const { id } = context.params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Member ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Remove household member
    try {
      await removeHouseholdMember(supabase, id, DEFAULT_USER_ID);

      return new Response(null, { status: 204 });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      if (errorMessage === "USER_NOT_IN_HOUSEHOLD") {
        return new Response(JSON.stringify({ error: "User not in household" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "NOT_HOUSEHOLD_ADMIN") {
        return new Response(JSON.stringify({ error: "Not household admin" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "MEMBER_NOT_FOUND") {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "MEMBER_NOT_IN_SAME_HOUSEHOLD") {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "CANNOT_REMOVE_SELF") {
        return new Response(JSON.stringify({ error: "Cannot remove self" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "CANNOT_REMOVE_LAST_ADMIN") {
        return new Response(JSON.stringify({ error: "Cannot remove last admin" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Service error removing household member:", serviceError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in DELETE /v1/members/:id:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
