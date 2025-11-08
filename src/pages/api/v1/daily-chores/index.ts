import type { APIRoute } from "astro";
import { CreateDailyChoreCmdSchema, getDailyChores, createDailyChore, deleteDailyChore, deleteDailyChoresByDate } from "@/lib/dailyChores.service";
import { getHouseholdForUser } from "@/lib/households.service";
import { getSupabaseServiceClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";
import type { Database } from "@/db/database.types";

export const prerender = false;

/**
 * GET /v1/daily-chores
 * Fetches daily chores for the user's household
 * Query params:
 *   - date: ISO date string (default: today)
 *   - status: 'todo' | 'done' (optional)
 *   - assignee_id: UUID of assignee (optional)
 *
 * Response: 200 OK with DailyChoreDTO[]
 */
export const GET: APIRoute = async (context) => {
  try {
    // Parse query parameters
    const url = new URL(context.request.url);
    const dateParam = url.searchParams.get("date");
    const statusParam = url.searchParams.get("status") as "todo" | "done" | null;
    const assigneeIdParam = url.searchParams.get("assignee_id");

    // Validate status parameter if provided
    if (statusParam && !["todo", "done"].includes(statusParam)) {
      return new Response(
        JSON.stringify({
          error: "Invalid status parameter",
          details: "status must be either 'todo' or 'done'",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate assignee_id parameter if provided
    if (assigneeIdParam && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigneeIdParam)) {
      return new Response(
        JSON.stringify({
          error: "Invalid assignee_id parameter",
          details: "assignee_id must be a valid UUID",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // Try to get authenticated user from session, fallback to DEFAULT_USER_ID for dev
    let userId = DEFAULT_USER_ID;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch (error) {
      console.warn("Could not get authenticated user, using DEFAULT_USER_ID:", error);
    }

    // Get household for the current user
    const household = await getHouseholdForUser(supabase, userId);
    if (!household) {
      return new Response(JSON.stringify({ error: "User not in any household" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch daily chores using service layer
    try {
      const dailyChores = await getDailyChores(supabase, household.id, {
        date: dateParam || undefined,
        status: statusParam || undefined,
        assignee_id: assigneeIdParam || undefined,
      });

      return new Response(JSON.stringify(dailyChores), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      console.error("Service error fetching daily chores:", serviceError);
      return new Response(JSON.stringify({ error: "Failed to fetch daily chores" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in GET /v1/daily-chores:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST /v1/daily-chores
 * Creates a new daily chore from catalog
 *
 * Request body: CreateDailyChoreCmd
 * Response: 201 Created with DailyChoreDTO
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
    const validationResult = CreateDailyChoreCmdSchema.safeParse(requestData);
    if (!validationResult.success) {
      const details = validationResult.error.issues.map((err: any) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return new Response(JSON.stringify({ error: "Validation error", details }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // Try to get authenticated user from session, fallback to DEFAULT_USER_ID for dev
    let userId = DEFAULT_USER_ID;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch (error) {
      console.warn("Could not get authenticated user, using DEFAULT_USER_ID:", error);
    }

    // Get household for the current user
    const household = await getHouseholdForUser(supabase, userId);
    if (!household) {
      return new Response(
        JSON.stringify({
          error: "Household not found",
          userId: userId,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create the daily chore using service layer (use service client to bypass RLS)
    try {
      const dailyChore = await createDailyChore(supabase, household.id, validationResult.data);

      return new Response(JSON.stringify(dailyChore), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";
      console.error("Service error creating daily chore:", serviceError);
      console.error("Error message:", errorMessage);

      if (errorMessage === "CATALOG_ITEM_NOT_FOUND") {
        return new Response(JSON.stringify({ error: "Chore catalog item not found or not accessible" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "ASSIGNEE_NOT_IN_HOUSEHOLD") {
        return new Response(JSON.stringify({ error: "Assignee does not belong to this household" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "DAILY_LIMIT_EXCEEDED") {
        return new Response(JSON.stringify({ error: "Daily limit of 50 chores exceeded" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (errorMessage === "DUPLICATE_CHORE") {
        return new Response(
          JSON.stringify({ error: "Duplicate chore already exists for this date, catalog item, assignee, and time" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

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
    console.error("Unexpected error in POST /v1/daily-chores:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE /v1/daily-chores?date=YYYY-MM-DD
 * Deletes all daily chores for the given date (admin only)
 *
 * Query params:
 *   - date: ISO date string (required)
 *
 * Response: 204 No Content
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Parse query parameters
    const url = new URL(context.request.url);
    const dateParam = url.searchParams.get("date");

    // Validate date parameter
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return new Response(
        JSON.stringify({
          error: "Invalid date parameter",
          details: "date must be in YYYY-MM-DD format",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // Try to get authenticated user from session, fallback to DEFAULT_USER_ID for dev
    let userId = DEFAULT_USER_ID;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch (error) {
      console.warn("Could not get authenticated user, using DEFAULT_USER_ID:", error);
    }

    // Get household for the current user
    const household = await getHouseholdForUser(supabase, userId);
    if (!household) {
      return new Response(JSON.stringify({ error: "User not in any household" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete all chores for the given date (admin only)
    try {
      await deleteDailyChoresByDate(supabase, household.id, dateParam, DEFAULT_USER_ID);

      return new Response(null, {
        status: 204,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      if (errorMessage === "UNAUTHORIZED") {
        return new Response(JSON.stringify({ error: "Only household admin can delete chores by date" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Service error deleting chores by date:", serviceError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error in DELETE /v1/daily-chores:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
