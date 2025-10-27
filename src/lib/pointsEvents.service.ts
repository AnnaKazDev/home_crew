import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { PointsEventDTO, Paginated, GetPointsEventsOptions } from "@/types";

/**
 * Helper function to encode cursor for pagination
 * Uses base64 encoding of JSON containing the last item's id
 */
function encodeCursor(id: number): string {
  const cursorData = { id };
  return Buffer.from(JSON.stringify(cursorData)).toString("base64");
}

/**
 * Helper function to decode cursor from pagination
 * Returns the last item's id or undefined if invalid
 */
function decodeCursor(cursor?: string): number | undefined {
  if (!cursor) return undefined;

  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const cursorData = JSON.parse(decoded);
    return typeof cursorData.id === "number" ? cursorData.id : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Service function to get paginated points events for the current user
 *
 * @param supabase - SupabaseClient instance
 * @param options - Filtering and pagination options
 * @returns Promise<Paginated<PointsEventDTO>> - Paginated list of user's points events
 * @throws Error if database operation fails or validation fails
 */
export async function getUserPointsEvents(
  supabase: SupabaseClient<Database>,
  options: GetPointsEventsOptions = {}
): Promise<Paginated<PointsEventDTO>> {
  const { cursor, limit = 20, event_type, from_date, to_date } = options;

  // Decode cursor to get the starting point
  const cursorId = decodeCursor(cursor);

  // Build the query
  let query = supabase
    .from("points_events")
    .select("id, points, event_type, created_at, daily_chore_id")
    .order("id", { ascending: false }) // Most recent first
    .limit(limit + 1); // +1 to check if there are more results

  // Apply cursor-based pagination
  if (cursorId) {
    query = query.lt("id", cursorId); // Less than cursor ID for descending order
  }

  // Apply event type filter
  if (event_type) {
    query = query.eq("event_type", event_type);
  }

  // Apply date range filters
  if (from_date) {
    query = query.gte("created_at", `${from_date}T00:00:00.000Z`);
  }
  if (to_date) {
    query = query.lte("created_at", `${to_date}T23:59:59.999Z`);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("Error fetching points events:", error);
    throw new Error("Failed to fetch points events");
  }

  if (!events) {
    throw new Error("POINTS_EVENTS_FETCH_FAILED");
  }

  // Check if there are more results
  const hasMore = events.length > limit;
  const data = hasMore ? events.slice(0, limit) : events;

  // Generate next cursor if there are more results
  const nextCursor = hasMore && data.length > 0 ? encodeCursor(data[data.length - 1].id) : undefined;

  return {
    data,
    next_cursor: nextCursor,
  };
}
