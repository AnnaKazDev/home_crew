import { z } from "zod";
import bcrypt from "bcrypt";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { HouseholdDTO, CreateHouseholdDTO } from "@/types";

/**
 * Zod schema for validating CreateHouseholdCmd
 * Validates request body when creating a new household
 */
export const CreateHouseholdCmdSchema = z.object({
  name: z
    .string()
    .min(3, "Household name must be at least 3 characters")
    .max(100, "Household name must be 100 characters or less")
    .transform((val) => val.trim()),
});

/**
 * Zod schema for validating JoinHouseholdCmd
 * Validates request body when joining a household by PIN
 */
export const JoinHouseholdCmdSchema = z.object({
  pin: z
    .string()
    .length(6, "PIN must be exactly 6 digits")
    .regex(/^\d{6}$/, "PIN must contain only digits"),
});

/**
 * Zod schema for validating UpdateHouseholdCmd
 * Validates request body when updating household information
 */
export const UpdateHouseholdCmdSchema = z.object({
  name: z
    .string()
    .min(3, "Household name must be at least 3 characters")
    .max(100, "Household name must be 100 characters or less")
    .transform((val) => val.trim())
    .optional(),
  timezone: z.string().optional(),
});

type CreateHouseholdCmdType = z.infer<typeof CreateHouseholdCmdSchema>;
type JoinHouseholdCmdType = z.infer<typeof JoinHouseholdCmdSchema>;
type UpdateHouseholdCmdType = z.infer<typeof UpdateHouseholdCmdSchema>;

/**
 * Generates a unique 6-digit PIN for household invites with bcrypt hash
 * Ensures the PIN is not already used by any existing household
 *
 * @param supabase - SupabaseClient instance
 * @returns Promise<{pin: string, hash: string}> - Unique 6-digit PIN and its bcrypt hash
 * @throws Error if unable to generate unique PIN after multiple attempts
 */
export async function generateUniquePinWithHash(
  supabase: SupabaseClient<Database>
): Promise<{ pin: string; hash: string }> {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if PIN already exists
    const { data: existingHousehold, error } = await supabase
      .from("households")
      .select("id")
      .eq("current_pin", pin)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw new Error("Database error while checking PIN uniqueness");
    }

    // If no existing household found, PIN is unique
    if (!existingHousehold) {
      // Generate bcrypt hash for the PIN
      const saltRounds = 12;
      const hash = await bcrypt.hash(pin, saltRounds);

      return { pin, hash };
    }

    attempts++;
  }

  throw new Error("Unable to generate unique PIN after multiple attempts");
}

/**
 * Creates a new household with a unique PIN
 *
 * @param supabase - SupabaseClient instance
 * @param userId - ID of the user creating the household (becomes admin)
 * @param data - Validated CreateHouseholdCmd data
 * @returns Promise<CreateHouseholdDTO> - Created household with PIN
 * @throws Error if household creation fails or user already belongs to a household
 */
export async function createHousehold(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: CreateHouseholdCmdType
): Promise<CreateHouseholdDTO> {
  // Check if user already belongs to a household
  const { data: existingMembership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .single();

  if (membershipError && membershipError.code !== "PGRST116") {
    throw new Error("Database error while checking user membership");
  }

  if (existingMembership) {
    throw new Error("USER_ALREADY_IN_HOUSEHOLD");
  }

  // Generate unique PIN with hash
  const { pin, hash } = await generateUniquePinWithHash(supabase);

  // Set PIN expiration (24 hours from now)
  const pinExpiresAt = new Date();
  pinExpiresAt.setHours(pinExpiresAt.getHours() + 24);

  // Create household and add user as admin in a transaction
  const { data: result, error: transactionError } = await (supabase.rpc as any)("create_household_with_admin", {
    p_name: data.name,
    p_pin: pin,
    p_user_id: userId,
  });

  if (transactionError) {
    console.error("Error creating household:", transactionError);
    throw new Error("Failed to create household");
  }

  if (!result || (result as any[]).length === 0) {
    throw new Error("Failed to retrieve created household");
  }

  const household = (result as any[])[0];

  // Update household with PIN hash and expiration
  const { error: updateError } = await supabase
    .from("households")
    .update({
      pin_hash: hash,
      pin_expires_at: pinExpiresAt.toISOString(),
    })
    .eq("id", household.id);

  if (updateError) {
    console.error("Error updating household with PIN hash:", updateError);
    // Don't throw here as household was already created successfully
  }

  return {
    id: household.id,
    name: household.name,
    pin: household.current_pin,
  };
}

/**
 * Retrieves household information for a user, including PIN only for administrators
 *
 * @param supabase - SupabaseClient instance
 * @param userId - ID of the user requesting household info
 * @returns Promise<HouseholdDTO | null> - Household data or null if user not in household
 * @throws Error if database query fails
 */
export async function getHouseholdForUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<HouseholdDTO | null> {
  // Get household membership with role
  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select(
      `
      role,
      households (
        id,
        name,
        timezone,
        current_pin
      )
    `
    )
    .eq("user_id", userId)
    .single();

  if (membershipError) {
    if (membershipError.code === "PGRST116") {
      return null; // User not in any household
    }
    throw new Error("Database error while retrieving household");
  }

  if (!membership.households) {
    return null;
  }

  const household = membership.households as any;

  // Return PIN only for administrators
  const householdDTO: HouseholdDTO = {
    id: household.id,
    name: household.name,
    timezone: household.timezone,
  };

  if (membership.role === "admin") {
    householdDTO.pin = household.current_pin;
  }

  return householdDTO;
}

/**
 * Joins a household using a PIN code
 *
 * @param supabase - SupabaseClient instance
 * @param userId - ID of the user joining the household
 * @param data - Validated JoinHouseholdCmd data
 * @returns Promise<HouseholdDTO> - Joined household data
 * @throws Error if PIN is invalid, household not found, or user already in household
 */
export async function joinHousehold(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: JoinHouseholdCmdType
): Promise<HouseholdDTO> {
  // Check if user already belongs to a household
  const { data: existingMembership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .single();

  if (membershipError && membershipError.code !== "PGRST116") {
    throw new Error("Database error while checking user membership");
  }

  if (existingMembership) {
    throw new Error("USER_ALREADY_IN_HOUSEHOLD");
  }

  // Find households that could match (to check PIN hash)
  const { data: households, error: householdError } = await supabase
    .from("households")
    .select("id, name, timezone, pin_expires_at, pin_hash")
    .not("pin_hash", "is", null);

  if (householdError) {
    throw new Error("Database error while finding household");
  }

  // Find household by comparing PIN hash
  let household = null;
  for (const h of households || []) {
    if (h.pin_hash && (await bcrypt.compare(data.pin, h.pin_hash))) {
      household = h;
      break;
    }
  }

  if (!household) {
    throw new Error("INVALID_PIN");
  }

  // Check if PIN is expired
  if (household.pin_expires_at && new Date(household.pin_expires_at) < new Date()) {
    throw new Error("PIN_EXPIRED");
  }

  // Add user to household as member
  const { error: joinError } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: userId,
    role: "member",
  });

  if (joinError) {
    console.error("Error joining household:", joinError);
    throw new Error("Failed to join household");
  }

  return {
    id: household.id,
    name: household.name,
    timezone: household.timezone,
  };
}

/**
 * Updates household information (admin only)
 *
 * @param supabase - SupabaseClient instance
 * @param householdId - ID of the household to update
 * @param userId - ID of the user making the update (must be admin)
 * @param data - Validated UpdateHouseholdCmd data
 * @returns Promise<HouseholdDTO> - Updated household data
 * @throws Error if user is not admin or update fails
 */
export async function updateHousehold(
  supabase: SupabaseClient<Database>,
  householdId: string,
  userId: string,
  data: UpdateHouseholdCmdType
): Promise<HouseholdDTO> {
  // Check if user is admin of this household
  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .single();

  if (membershipError || !membership) {
    throw new Error("NOT_HOUSEHOLD_MEMBER");
  }

  if (membership.role !== "admin") {
    throw new Error("NOT_HOUSEHOLD_ADMIN");
  }

  // Prepare update data
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;

  if (Object.keys(updateData).length === 0) {
    // No changes to make, return current household data
    const currentHousehold = await getHouseholdForUser(supabase, userId);
    if (!currentHousehold) {
      throw new Error("Household not found");
    }
    return currentHousehold;
  }

  // Update household
  const { data: updatedHousehold, error: updateError } = await supabase
    .from("households")
    .update(updateData)
    .eq("id", householdId)
    .select("id, name, timezone, current_pin")
    .single();

  if (updateError) {
    console.error("Error updating household:", updateError);
    throw new Error("Failed to update household");
  }

  if (!updatedHousehold) {
    throw new Error("Household not found after update");
  }

  // Return updated data with PIN for admin
  return {
    id: updatedHousehold.id,
    name: updatedHousehold.name,
    timezone: updatedHousehold.timezone,
    pin: updatedHousehold.current_pin,
  };
}
