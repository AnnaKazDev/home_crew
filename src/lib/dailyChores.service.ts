import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { DailyChoreDTO } from "@/types";

/**
 * Zod schema for validating CreateDailyChoreCmd
 * Validates request body when creating a new daily chore
 */
export const CreateDailyChoreCmdSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
    }, "Invalid date format"),
  chore_catalog_id: z.string().uuid("Invalid chore catalog ID format"),
  assignee_id: z.string().uuid("Invalid assignee ID format").nullable().optional(),
  time_of_day: z.enum(["morning", "afternoon", "evening", "night", "any"]).default("any").optional(),
});

/**
 * Zod schema for validating UpdateDailyChoreCmd
 * All fields are optional for partial updates
 */
export const UpdateDailyChoreCmdSchema = z
  .object({
    status: z.enum(["todo", "done"]).optional(),
    assignee_id: z.string().uuid("Invalid assignee ID format").nullable().optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.assignee_id !== undefined,
    "At least one field (status or assignee_id) must be provided"
  );

type CreateDailyChoreCmdType = z.infer<typeof CreateDailyChoreCmdSchema>;
type UpdateDailyChoreCmdType = z.infer<typeof UpdateDailyChoreCmdSchema>;

/**
 * Service function to fetch daily chores for a household with optional filters
 *
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID to fetch chores for
 * @param filters - Optional filters for date, status, and assignee
 * @returns Promise<DailyChoreDTO[]> - Array of daily chores
 * @throws Error if database operation fails
 */
export async function getDailyChores(
  supabase: SupabaseClient<Database>,
  householdId: string,
  filters: {
    date?: string;
    status?: "todo" | "done";
    assignee_id?: string;
  } = {}
): Promise<DailyChoreDTO[]> {
  // Default to today's date if not specified
  const targetDate = filters.date || new Date().toISOString().split('T')[0];

  let query = supabase
    .from("daily_chores")
    .select("*")
    .eq("household_id", householdId)
    .eq("date", targetDate)
    .is("deleted_at", null);

  // Apply optional filters
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.assignee_id) {
    query = query.eq("assignee_id", filters.assignee_id);
  }

  const { data: chores, error } = await query.order("time_of_day", { ascending: true });

  if (error) {
    console.error("Error fetching daily chores:", error);
    throw new Error("Failed to fetch daily chores");
  }

  if (!chores) {
    return [];
  }

  // Map to DTOs
  return chores.map(mapToDTO);
}

/**
 * Service function to create a new daily chore
 *
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID for which to create the chore
 * @param data - Validated CreateDailyChoreCmd data
 * @returns Promise<DailyChoreDTO> - The created daily chore DTO
 * @throws Error if business rules are violated or database operation fails
 */
export async function createDailyChore(
  supabase: SupabaseClient<Database>,
  householdId: string,
  data: CreateDailyChoreCmdType
): Promise<DailyChoreDTO> {
  // Verify chore_catalog_id exists and is accessible
  const { data: catalogItem, error: catalogError } = await supabase
    .from("chores_catalog")
    .select("id, points")
    .or(`and(predefined.eq.true,household_id.is.null),and(household_id.eq.${householdId},predefined.eq.false)`)
    .eq("id", data.chore_catalog_id)
    .is("deleted_at", null)
    .single();

  if (catalogError || !catalogItem) {
    console.error("Chore catalog item not found:", catalogError);
    throw new Error("CATALOG_ITEM_NOT_FOUND");
  }

  // Verify assignee_id belongs to the same household (if provided)
  if (data.assignee_id) {
    const { data: member, error: memberError } = await supabase
      .from("household_members")
      .select("id")
      .eq("household_id", householdId)
      .eq("user_id", data.assignee_id)
      .single();

    if (memberError || !member) {
      console.error("Assignee not found in household:", memberError);
      throw new Error("ASSIGNEE_NOT_IN_HOUSEHOLD");
    }
  }

  // Check daily limit (50 chores per household per day)
  const { count: dailyCount, error: countError } = await supabase
    .from("daily_chores")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("date", data.date)
    .is("deleted_at", null);

  if (countError) {
    console.error("Error checking daily limit:", countError);
    throw new Error("Database error while checking daily limit");
  }

  if (dailyCount && dailyCount >= 50) {
    throw new Error("DAILY_LIMIT_EXCEEDED");
  }

  // Check for duplicate (unique constraint enforcement)
  let query = supabase
    .from("daily_chores")
    .select("id")
    .eq("household_id", householdId)
    .eq("date", data.date)
    .eq("chore_catalog_id", data.chore_catalog_id)
    .eq("time_of_day", data.time_of_day || "any")
    .is("deleted_at", null);

  // Handle assignee_id separately to avoid type issues
  if (data.assignee_id !== undefined && data.assignee_id !== null) {
    query = query.eq("assignee_id", data.assignee_id);
  } else {
    query = query.is("assignee_id", null);
  }

  const { data: existingChore, error: duplicateError } = await query.single();

  if (existingChore) {
    throw new Error("DUPLICATE_CHORE");
  }

  if (duplicateError && duplicateError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error checking for duplicates:", duplicateError);
    throw new Error("Database error while checking for duplicates");
  }

  // Insert new daily chore
  const { data: newChore, error: insertError } = await supabase
    .from("daily_chores")
    .insert({
      household_id: householdId,
      date: data.date,
      chore_catalog_id: data.chore_catalog_id,
      assignee_id: data.assignee_id || null,
      time_of_day: data.time_of_day || "any",
      status: "todo", // Always start as todo
      points: catalogItem.points, // Copy points from catalog
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating daily chore:", insertError);
    throw new Error("Failed to create daily chore");
  }

  if (!newChore) {
    throw new Error("Failed to retrieve created daily chore");
  }

  return mapToDTO(newChore);
}

/**
 * Service function to update a daily chore
 *
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID (for authorization)
 * @param choreId - The daily chore ID to update
 * @param userId - The user ID making the update (for authorization)
 * @param data - Validated partial UpdateDailyChoreCmd data
 * @returns Promise<DailyChoreDTO> - The updated daily chore DTO
 * @throws Error if chore not found or user not authorized
 */
export async function updateDailyChore(
  supabase: SupabaseClient<Database>,
  householdId: string,
  choreId: string,
  userId: string,
  data: UpdateDailyChoreCmdType
): Promise<DailyChoreDTO> {
  // Verify chore exists and belongs to this household
  const { data: existingChore, error: checkError } = await supabase
    .from("daily_chores")
    .select("*")
    .eq("id", choreId)
    .eq("household_id", householdId)
    .is("deleted_at", null)
    .single();

  if (checkError || !existingChore) {
    console.error("Error checking existing chore:", checkError);
    throw new Error("NOT_FOUND");
  }

  // Check authorization: only assignee or admin can update
  const isAssignee = existingChore.assignee_id === userId;
  const isAdmin = await checkUserIsAdmin(supabase, householdId, userId);

  if (!isAssignee && !isAdmin) {
    throw new Error("UNAUTHORIZED");
  }

  // Verify assignee_id belongs to the same household (if being updated)
  if (data.assignee_id !== undefined && data.assignee_id !== null) {
    const { data: member, error: memberError } = await supabase
      .from("household_members")
      .select("id")
      .eq("household_id", householdId)
      .eq("user_id", data.assignee_id)
      .single();

    if (memberError || !member) {
      console.error("New assignee not found in household:", memberError);
      throw new Error("ASSIGNEE_NOT_IN_HOUSEHOLD");
    }
  }

  // Build update payload - only include provided fields
  const updatePayload: Record<string, unknown> = {};
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.assignee_id !== undefined) updatePayload.assignee_id = data.assignee_id;
  updatePayload.updated_at = new Date().toISOString();

  // Update the chore
  const { data: updatedChore, error: updateError } = await supabase
    .from("daily_chores")
    .update(updatePayload)
    .eq("id", choreId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating daily chore:", updateError);
    throw new Error("Failed to update daily chore");
  }

  if (!updatedChore) {
    throw new Error("Failed to retrieve updated daily chore");
  }

  return mapToDTO(updatedChore);
}

/**
 * Service function to soft-delete a daily chore
 *
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID (for authorization)
 * @param choreId - The daily chore ID to delete
 * @param userId - The user ID making the deletion (for authorization)
 * @throws Error if chore not found or user not authorized
 */
export async function deleteDailyChore(
  supabase: SupabaseClient<Database>,
  householdId: string,
  choreId: string,
  userId: string
): Promise<void> {
  // Verify chore exists and belongs to this household
  const { data: existingChore, error: checkError } = await supabase
    .from("daily_chores")
    .select("assignee_id")
    .eq("id", choreId)
    .eq("household_id", householdId)
    .is("deleted_at", null)
    .single();

  if (checkError || !existingChore) {
    console.error("Error checking chore for deletion:", checkError);
    throw new Error("NOT_FOUND");
  }

  // Check authorization: only assignee or admin can delete
  const isAssignee = existingChore.assignee_id === userId;
  const isAdmin = await checkUserIsAdmin(supabase, householdId, userId);

  if (!isAssignee && !isAdmin) {
    throw new Error("UNAUTHORIZED");
  }

  // Soft delete by setting deleted_at
  const { error: deleteError } = await supabase
    .from("daily_chores")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", choreId)
    .eq("household_id", householdId);

  if (deleteError) {
    console.error("Error deleting daily chore:", deleteError);
    throw new Error("Failed to delete daily chore");
  }
}

/**
 * Helper function to check if a user is an admin in their household
 */
async function checkUserIsAdmin(
  supabase: SupabaseClient<Database>,
  householdId: string,
  userId: string
): Promise<boolean> {
  const { data: member, error } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .single();

  if (error || !member) {
    return false;
  }

  return member.role === "admin";
}

/**
 * Helper function to map a daily chore row to DailyChoreDTO
 */
function mapToDTO(chore: Database["public"]["Tables"]["daily_chores"]["Row"]): DailyChoreDTO {
  return {
    id: chore.id,
    date: chore.date,
    time_of_day: chore.time_of_day,
    status: chore.status,
    assignee_id: chore.assignee_id,
    points: chore.points,
    chore_catalog_id: chore.chore_catalog_id,
  };
}
