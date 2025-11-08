import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { PointsEventDTO, Paginated, GetPointsEventsOptions } from '@/types';

/**
 * Helper function to encode cursor for pagination
 * Uses base64 encoding of JSON containing the last item's id
 */
function encodeCursor(id: number): string {
  const cursorData = { id };
  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
}

/**
 * Helper function to decode cursor from pagination
 * Returns the last item's id or undefined if invalid
 */
function decodeCursor(cursor?: string): number | undefined {
  if (!cursor) return undefined;

  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const cursorData = JSON.parse(decoded);
    return typeof cursorData.id === 'number' ? cursorData.id : undefined;
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
  supabase: SupabaseClient,
  options: GetPointsEventsOptions = {}
): Promise<Paginated<PointsEventDTO>> {
  const { cursor, limit = 20, event_type, from_date, to_date } = options;

  // Decode cursor to get the starting point
  const cursorId = decodeCursor(cursor);

  // Build the query
  let query = supabase
    .from('points_events')
    .select('id, points, event_type, created_at, daily_chore_id')
    .order('id', { ascending: false }) // Most recent first
    .limit(limit + 1); // +1 to check if there are more results

  // Apply cursor-based pagination
  if (cursorId) {
    query = query.lt('id', cursorId); // Less than cursor ID for descending order
  }

  // Apply event type filter
  if (event_type) {
    query = query.eq('event_type', event_type);
  }

  // Apply date range filters
  if (from_date) {
    query = query.gte('created_at', `${from_date}T00:00:00.000Z`);
  }
  if (to_date) {
    query = query.lte('created_at', `${to_date}T23:59:59.999Z`);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error('Error fetching points events:', error);
    throw new Error('Failed to fetch points events');
  }

  if (!events) {
    throw new Error('POINTS_EVENTS_FETCH_FAILED');
  }

  // Check if there are more results
  const hasMore = events.length > limit;
  const data = hasMore ? events.slice(0, limit) : events;

  // Generate next cursor if there are more results
  const nextCursor =
    hasMore && data.length > 0 ? encodeCursor(data[data.length - 1].id) : undefined;

  return {
    data,
    next_cursor: nextCursor,
  };
}

/**
 * Service function to get points date range for a user
 *
 * @param supabase - SupabaseClient instance
 * @param userId - User ID to get date range for
 * @returns Promise<{firstDate: string | null, lastDate: string | null}> - First and last date with points
 * @throws Error if database operation fails
 */
export async function getUserPointsDateRange(
  supabase: SupabaseClient,
  userId: string
): Promise<{ firstDate: string | null; lastDate: string | null }> {
  // Get the earliest and latest date for user's completed chores (exclude deleted)
  const { data: dateRange, error } = await supabase
    .from('daily_chores')
    .select('date')
    .eq('assignee_id', userId)
    .eq('status', 'done')
    .is('deleted_at', null)
    .order('date', { ascending: true })
    .limit(1);

  const { data: dateRangeDesc, error: errorDesc } = await supabase
    .from('daily_chores')
    .select('date')
    .eq('assignee_id', userId)
    .eq('status', 'done')
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(1);

  if (error || errorDesc) {
    console.error('Error fetching points date range:', error || errorDesc);
    throw new Error('Failed to fetch points date range');
  }

  const firstDate = dateRange && dateRange.length > 0 ? dateRange[0].date : null;
  const lastDate = dateRangeDesc && dateRangeDesc.length > 0 ? dateRangeDesc[0].date : null;

  return { firstDate, lastDate };
}

/**
 * Service function to get daily points summary for a user over a date range
 *
 * @param supabase - SupabaseClient instance
 * @param userId - User ID to get points for
 * @param days - Number of days to look back (default: 7)
 * @returns Promise<{date: string, points: number}[]> - Array of daily points summaries
 * @throws Error if database operation fails
 */
export async function getUserDailyPointsSummary(
  supabase: SupabaseClient,
  userId: string,
  days = 7
): Promise<{ date: string; points: number }[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days + 1); // Include today

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Generate all dates in the range
  const allDates: { date: string; points: number }[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    allDates.push({
      date: d.toISOString().split('T')[0],
      points: 0,
    });
  }

  // Calculate fresh points directly from daily_chores (exclude deleted tasks)
  const { data: chores, error } = await supabase
    .from('daily_chores')
    .select('points, date')
    .eq('assignee_id', userId)
    .eq('status', 'done')
    .is('deleted_at', null)
    .gte('date', startDateStr)
    .lte('date', endDateStr)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching daily points summary:', error);
    throw new Error('Failed to fetch daily points summary');
  }

  // Aggregate points by date
  const pointsByDate = new Map<string, number>();

  if (chores) {
    chores.forEach((chore) => {
      const date = chore.date;
      pointsByDate.set(date, (pointsByDate.get(date) || 0) + (chore.points || 0));
    });
  }

  // Merge with all dates (ensuring we have entries for days with 0 points)
  return allDates.map((dateEntry) => ({
    date: dateEntry.date,
    points: pointsByDate.get(dateEntry.date) || 0,
  }));
}
