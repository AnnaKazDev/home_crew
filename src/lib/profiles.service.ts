import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { ProfileDTO } from "@/types";

/**
 * Zod schema for validating UpdateProfileCmd
 * Validates request body when updating a user's profile
 */
export const UpdateProfileCmdSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be 100 characters or less")
    .transform((val) => val.trim()),
  avatar_url: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable(),
});

type UpdateProfileCmdType = z.infer<typeof UpdateProfileCmdSchema>;

/**
 * Service function to get a user's profile
 *
 * @param supabase - SupabaseClient instance
 * @param userId - The user ID to fetch profile for
 * @returns Promise<ProfileDTO> - The user's profile DTO
 * @throws Error if profile not found or database operation fails
 */
export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProfileDTO> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, total_points")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }

  if (!profile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  return {
    id: profile.id,
    name: profile.name,
    avatar_url: profile.avatar_url,
    total_points: profile.total_points,
  };
}

/**
 * Service function to update a user's profile
 *
 * @param supabase - SupabaseClient instance
 * @param userId - The user ID to update profile for
 * @param data - Validated UpdateProfileCmd data
 * @returns Promise<ProfileDTO> - The updated profile DTO
 * @throws Error if profile not found or database operation fails
 */
export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: UpdateProfileCmdType
): Promise<ProfileDTO> {
  // First, get the current profile to compare
  const { data: currentProfile, error: getError } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, total_points")
    .eq("id", userId)
    .single();

  if (getError || !currentProfile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  console.log("Current profile before update:", currentProfile);

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    name: data.name,
  };

  if (data.avatar_url !== undefined) {
    updatePayload.avatar_url = data.avatar_url;
  }

  // Update the profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", userId);

  if (updateError) {
    console.error("Update failed:", updateError);
    throw new Error("Failed to update profile");
  }

  // Fetch the updated profile with a small delay to ensure consistency
  await new Promise(resolve => setTimeout(resolve, 100));

  const { data: updatedProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, total_points")
    .eq("id", userId)
    .single();

  console.log("Fetched updated profile:", updatedProfile, "fetch error:", fetchError);

  if (fetchError || !updatedProfile) {
    console.error("Fetch error after update:", fetchError);
    throw new Error("Failed to retrieve updated profile");
  }

  return {
    id: updatedProfile.id,
    name: updatedProfile.name,
    avatar_url: updatedProfile.avatar_url,
    total_points: updatedProfile.total_points,
  };
}
