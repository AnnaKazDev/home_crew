import type { APIRoute } from "astro";
import { getUserPointsEvents } from "@/lib/pointsEvents.service";
import { GetPointsEventsQuerySchema } from "@/lib/validation.schemas";
import { getSupabaseServiceClient, type SupabaseClient } from "@/db/supabase.client";

export const prerender = false;

/**
 * GET /v1/points-events
 * Retrieves paginated list of points events for the current authenticated user
 *
 * Query parameters:
 * - cursor: string (optional) - pagination cursor
 * - limit: number (optional, default 20, max 100) - items per page
 * - event_type: 'add' | 'subtract' (optional) - filter by event type
 * - from_date: string (optional) - filter events from this date (YYYY-MM-DD)
 * - to_date: string (optional) - filter events to this date (YYYY-MM-DD)
 *
 * Response: 200 OK with Paginated<PointsEventDTO>
 * Errors:
 * - 400 Bad Request: Invalid pagination/filtering parameters
 * - 422 Unprocessable Entity: Invalid date range
 * - 500 Internal Server Error: Database or server errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const validationResult = GetPointsEventsQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Validation failed",
          code: "INVALID_PAGINATION_PARAMS",
          details,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check for date range validation error
    if (
      validationResult.data.from_date &&
      validationResult.data.to_date &&
      validationResult.data.from_date > validationResult.data.to_date
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid date range: from_date cannot be after to_date",
          code: "INVALID_DATE_RANGE",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = getSupabaseServiceClient() as SupabaseClient;

    // Get points events with filtering and pagination
    try {
      const result = await getUserPointsEvents(supabase, validationResult.data);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      console.error("Error in getUserPointsEvents service:", serviceError);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error in GET /v1/points-events:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
