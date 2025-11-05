import type { APIRoute } from "astro";
import { CreateDailyChoreCmdSchema, getDailyChores, createDailyChore } from "@/lib/dailyChores.service";
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

    // Get household for the current user
    const household = await getHouseholdForUser(supabase, DEFAULT_USER_ID);
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
      const details = validationResult.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return new Response(JSON.stringify({ error: "Validation error", details }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // Get household for the current user
    const household = await getHouseholdForUser(supabase, DEFAULT_USER_ID);
    if (!household) {
      return new Response(
        JSON.stringify({
          error: "Household not found",
          userId: DEFAULT_USER_ID,
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
