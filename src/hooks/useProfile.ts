import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/db/supabase.client';
import { getUserPointsDateRange } from '@/lib/pointsEvents.service';
import type { ProfileDTO } from '@/types';

/**
 * Calculate fresh total points from current done tasks assigned to the user
 * This excludes points from deleted tasks
 */
async function calculateFreshTotalPoints(supabase: any, userId: string): Promise<number> {
  try {
    // Sum points from daily_chores where:
    // - assignee_id = userId
    // - status = 'done'
    // - deleted_at is null
    const { data: result, error } = await supabase
      .from('daily_chores')
      .select('points')
      .eq('assignee_id', userId)
      .eq('status', 'done')
      .is('deleted_at', null);

    if (error) {
      console.error('Error calculating fresh total points:', error);
      return 0;
    }

    if (!result) return 0;

    return result.reduce((sum: number, chore: { points: number }) => sum + (chore.points || 0), 0);
  } catch (error) {
    console.error('Exception calculating fresh total points:', error);
    return 0;
  }
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [pointsDateRange, setPointsDateRange] = useState<{
    firstDate: string | null;
    lastDate: string | null;
  } | null>(null);
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
        const profileData = await res.json();

        // Calculate fresh total points from current done tasks
        // For API mode, we need to use the service client to calculate fresh points
        const supabase = getSupabaseClient();
        const currentUserId = 'e9d12995-1f3e-491d-9628-3c4137d266d1'; // Default user for development
        const freshTotalPoints = await calculateFreshTotalPoints(supabase, currentUserId);

        // Override the total_points with fresh calculation
        setProfile({
          ...profileData,
          total_points: freshTotalPoints,
        });
      } else {
        // Use Supabase directly
        const supabase = getSupabaseClient();
        const currentUserId = 'e9d12995-1f3e-491d-9628-3c4137d266d1'; // Default user for development

        // For development user, use mock data approach like profiles.service.ts
        if (currentUserId === 'e9d12995-1f3e-491d-9628-3c4137d266d1') {
          // Try to get profile first
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', currentUserId)
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
            // Calculate fresh total points from current done tasks
            const freshTotalPoints = await calculateFreshTotalPoints(supabase, currentUserId);

            setProfile({
              id: profile.id,
              name: profile.name,
              avatar_url: profile.avatar_url,
              total_points: freshTotalPoints,
              email: 'dev@example.com',
            });

            // Get points date range for dev user
            try {
              const dateRange = await getUserPointsDateRange(supabase, currentUserId);
              setPointsDateRange(dateRange);
            } catch (rangeError) {
              console.warn('Could not load points date range:', rangeError);
              setPointsDateRange({ firstDate: null, lastDate: null });
            }
          }
        } else {
          // Production logic - get profile and email separately
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', currentUserId)
            .single();

          if (profileError || !profile) {
            setError('Failed to load profile');
            console.error('Profile error:', profileError);
            return;
          }

          // Calculate fresh total points from current done tasks
          const freshTotalPoints = await calculateFreshTotalPoints(supabase, currentUserId);

          // Get email from auth.users
          const { data: userData, error: userError } =
            await supabase.auth.admin.getUserById(currentUserId);

          if (userError || !userData.user?.email) {
            setError('Failed to load user email');
            console.error('User error:', userError);
            return;
          }

          setProfile({
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            total_points: freshTotalPoints,
            email: userData.user.email,
          });

          // Get points date range
          try {
            const dateRange = await getUserPointsDateRange(supabase, currentUserId);
            setPointsDateRange(dateRange);
          } catch (rangeError) {
            console.warn('Could not load points date range:', rangeError);
            setPointsDateRange({ firstDate: null, lastDate: null });
          }
        }
      }
    } catch (err) {
      setError('Nieoczekiwany błąd');
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
            .from('profiles')
            .update(updateData)
            .eq('id', currentUserId);

          if (updateError) {
            // Could not update profile, using mock data
          }

          setProfile({
            ...profile,
            ...updateData,
          });
        } else {
          // Production logic
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', profile.id);

          if (updateError) {
            setError('Failed to update profile');
            console.error(updateError);
            throw updateError;
          } else {
            setProfile({ ...profile, ...data });
          }
        }
      }
    } catch (err) {
      setError('Nieoczekiwany błąd');
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, pointsDateRange, loading, error, updateProfile, refetch: fetchProfile };
};
