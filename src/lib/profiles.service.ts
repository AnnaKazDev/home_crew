import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { ProfileDTO } from "@/types";

/**
 * Calculate fresh total points from current done tasks assigned to the user
 * This excludes points from deleted tasks
 */
async function calculateFreshTotalPoints(supabase: SupabaseClient<Database>, userId: string): Promise<number> {
  try {
    // Sum points from daily_chores where:
    // - assignee_id = userId
    // - status = 'done'
    // - deleted_at is null
    const { data: result, error } = await supabase
      .from("daily_chores")
      .select("points")
      .eq("assignee_id", userId)
      .eq("status", "done")
      .is("deleted_at", null);

    if (error) {
      console.error("Error calculating fresh total points:", error);
      return 0;
    }

    if (!result) return 0;

    return result.reduce((sum: number, chore: { points: number }) => sum + (chore.points || 0), 0);
  } catch (error) {
    console.error("Exception calculating fresh total points:", error);
    return 0;
  }
}

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
  avatar_url: z.string().url("Invalid URL format").optional().nullable(),
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
export async function getProfile(supabase: SupabaseClient<Database>, userId: string): Promise<ProfileDTO> {
  console.log("Fetching profile for userId:", userId);

  // Try to get profile from database first
  console.log("Attempting to fetch profile from database...");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  console.log("Database query result:", { profile, error: profileError });

  if (profile && !profileError) {
    console.log("Found profile in database:", profile);
    return {
      ...profile,
      email: profile.email || "unknown@example.com",
      total_points: profile.total_points || 0
    } as ProfileDTO;
  }

  console.log("Profile not found in database, checking if it's the development user...");

  // For development: if user doesn't exist, create mock data
  if (userId === "e9d12995-1f3e-491d-9628-3c4137d266d1") {
    console.log("Using mock data for development user");

    // Try to get profile first
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      // Create mock profile if it doesn't exist
      console.log("Creating mock profile for development");
      const mockProfile = {
        id: userId,
        name: "Developer",
        avatar_url: null,
        total_points: 0,
        email: "dev@example.com",
      };

      // Try to insert the profile (this might fail if tables don't exist, but that's ok for now)
      try {
        await supabase
          .from("profiles")
          .insert({
            id: userId,
            name: "Developer",
          })
          .single();
      } catch (insertError) {
        console.log("Could not insert profile (tables might not exist yet):", insertError);
      }

      return mockProfile;
    }

    // Calculate fresh total points from current done tasks
    const freshTotalPoints = await calculateFreshTotalPoints(supabase, userId);

    return {
      id: profile.id,
      name: profile.name,
      avatar_url: profile.avatar_url,
      total_points: freshTotalPoints,
      email: "dev@example.com", // Mock email for development
    };
  }

  // Production logic for real users
  // First get the profile data
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .eq("id", userId)
    .single();

  if (existingProfileError) {
    console.error("Error fetching profile:", existingProfileError);
    throw new Error("Failed to fetch profile");
  }

  if (!existingProfile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  // Calculate fresh total points from current done tasks
  const freshTotalPoints = await calculateFreshTotalPoints(supabase, userId);

  // Then get the email from auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError) {
    console.error("Error fetching user email:", userError);
    throw new Error("Failed to fetch user email");
  }

  if (!userData.user?.email) {
    console.error("User email not found for userId:", userId);
    throw new Error("User email not found");
  }

  console.log("Profile data:", existingProfile);
  console.log("User email:", "unknown@example.com");
  console.log("Fresh total points:", freshTotalPoints);

  return {
    id: existingProfile.id,
    name: existingProfile.name,
    avatar_url: existingProfile.avatar_url,
    total_points: freshTotalPoints,
    email: "unknown@example.com",
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
  // For development user, handle mock data
  if (userId === "e9d12995-1f3e-491d-9628-3c4137d266d1") {
    console.log("Updating mock profile for development user");

    // Try to update the profile
    try {
      const updatePayload: Record<string, unknown> = {
        name: data.name,
      };

      if (data.avatar_url !== undefined) {
        updatePayload.avatar_url = data.avatar_url;
      }

      const { error: updateError } = await supabase.from("profiles").update(updatePayload).eq("id", userId);

      if (updateError) {
        console.log("Could not update profile (might not exist yet), returning mock data");
      }

      return {
        id: userId,
        name: data.name,
        avatar_url: data.avatar_url || null,
        total_points: 0,
        email: "dev@example.com",
      };
    } catch (error) {
      console.log("Database update failed, returning mock updated data");
      return {
        id: userId,
        name: data.name,
        avatar_url: data.avatar_url || null,
        total_points: 0,
        email: "dev@example.com",
      };
    }
  }

  // Production logic for real users
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
  const { error: updateError } = await supabase.from("profiles").update(updatePayload).eq("id", userId);

  if (updateError) {
    console.error("Update failed:", updateError);
    throw new Error("Failed to update profile");
  }

  // Fetch the updated profile with a small delay to ensure consistency
  await new Promise((resolve) => setTimeout(resolve, 100));

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

  // Get the email from auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError) {
    console.error("Error fetching user email:", userError);
    throw new Error("Failed to fetch user email");
  }

  if (!userData.user?.email) {
    console.error("User email not found for userId:", userId);
    throw new Error("User email not found");
  }

  return {
    id: updatedProfile.id,
    name: updatedProfile.name,
    avatar_url: updatedProfile.avatar_url,
    total_points: updatedProfile.total_points,
    email: userData.user.email,
  };
}
