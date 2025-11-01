import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/db/supabase.client";
import { getUserPointsDateRange } from "@/lib/pointsEvents.service";
import type { ProfileDTO, UpdateProfileCmd } from "@/types";

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [pointsDateRange, setPointsDateRange] = useState<{firstDate: string | null, lastDate: string | null} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useApi = !isSupabaseConfigured;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useApi) {
        // Use API route when Supabase is not configured
        const res = await fetch('/api/v1/profiles/me');
        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        const data = await res.json();
        setProfile(data);
      } else {
        // Use Supabase directly
        const supabase = getSupabaseClient();
        const currentUserId = 'e9d12995-1f3e-491d-9628-3c4137d266d1'; // Default user for development

        // For development user, use mock data approach like profiles.service.ts
        if (currentUserId === 'e9d12995-1f3e-491d-9628-3c4137d266d1') {
          // Try to get profile first
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, total_points")
            .eq("id", currentUserId)
            .single();

          if (profileError || !profile) {
            // Create mock profile if it doesn't exist
            const mockProfile = {
              id: currentUserId,
              name: 'Developer',
              avatar_url: null,
              total_points: 0,
              email: 'dev@example.com',
            };
            setProfile(mockProfile);
            setPointsDateRange({ firstDate: null, lastDate: null });
          } else {
            setProfile({
              id: profile.id,
              name: profile.name,
              avatar_url: profile.avatar_url,
              total_points: profile.total_points,
              email: 'dev@example.com',
            });

            // Get points date range for dev user
            try {
              const dateRange = await getUserPointsDateRange(supabase, currentUserId);
              setPointsDateRange(dateRange);
            } catch (rangeError) {
              console.warn("Could not load points date range:", rangeError);
              setPointsDateRange({ firstDate: null, lastDate: null });
            }
          }
        } else {
          // Production logic - get profile and email separately
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, total_points")
            .eq("id", currentUserId)
            .single();

          if (profileError || !profile) {
            setError("Failed to load profile");
            console.error("Profile error:", profileError);
            return;
          }

          // Get email from auth.users
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(currentUserId);

          if (userError || !userData.user?.email) {
            setError("Failed to load user email");
            console.error("User error:", userError);
            return;
          }

          setProfile({
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            total_points: profile.total_points,
            email: userData.user.email,
          });

          // Get points date range
          try {
            const dateRange = await getUserPointsDateRange(supabase, currentUserId);
            setPointsDateRange(dateRange);
          } catch (rangeError) {
            console.warn("Could not load points date range:", rangeError);
            setPointsDateRange({ firstDate: null, lastDate: null });
          }
        }
      }
    } catch (err) {
      setError("Nieoczekiwany błąd");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { name: string; avatar_url?: string | null }) => {
    if (!profile) return;
    try {
      setError(null);

      if (useApi) {
        // Use API route when Supabase is not configured
        const updateData = {
          name: data.name,
          avatar_url: data.avatar_url && data.avatar_url.trim() !== '' ? data.avatar_url : null,
        };
        const res = await fetch('/api/v1/profiles/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        if (!res.ok) {
          throw new Error('Failed to update profile');
        }
        const updatedData = await res.json();
        setProfile(updatedData);
      } else {
        // Use Supabase directly
        const supabase = getSupabaseClient();
        const currentUserId = 'e9d12995-1f3e-491d-9628-3c4137d266d1'; // Default user for development

        const updateData = {
          name: data.name,
          avatar_url: data.avatar_url && data.avatar_url.trim() !== '' ? data.avatar_url : null,
        };

        // For development user, handle like profiles.service.ts
        if (currentUserId === 'e9d12995-1f3e-491d-9628-3c4137d266d1') {
          const { error: updateError } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", currentUserId);

          if (updateError) {
            console.log("Could not update profile, using mock data");
          }

          setProfile({
            ...profile,
            ...updateData,
          });
        } else {
          // Production logic
          const { error: updateError } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", profile.id);

          if (updateError) {
            setError("Failed to update profile");
            console.error(updateError);
            throw updateError;
          } else {
            setProfile({ ...profile, ...data });
          }
        }
      }
    } catch (err) {
      setError("Nieoczekiwany błąd");
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, pointsDateRange, loading, error, updateProfile };
};
