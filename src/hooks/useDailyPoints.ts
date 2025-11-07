import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/db/supabase.client';
import { getUserDailyPointsSummary } from '@/lib/pointsEvents.service';
import { useAuthStore } from '@/stores/auth.store';

interface DailyPoints {
  date: string;
  points: number;
}

export const useDailyPoints = (days = 7) => {
  const [dailyPoints, setDailyPoints] = useState<DailyPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const useApi = !isSupabaseConfigured;

  const fetchDailyPoints = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useApi) {
        // For now, return mock data when using API
        // In a real implementation, you'd create an API endpoint for this
        const mockData: DailyPoints[] = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toISOString().split('T')[0],
            points: Math.floor(Math.random() * 50), // Mock data
          });
        }
        setDailyPoints(mockData);
      } else {
        // Use Supabase directly
        const supabase = getSupabaseClient();
        const currentUserId = user?.id;

        if (!currentUserId) {
          setError('User not authenticated');
          return;
        }

        const pointsData = await getUserDailyPointsSummary(supabase, currentUserId, days);
        setDailyPoints(pointsData);
      }
    } catch (err) {
      setError('Nieoczekiwany błąd podczas ładowania punktów');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDailyPoints();
    }
  }, [days, user?.id]);

  return { dailyPoints, loading, error, refetch: fetchDailyPoints };
};
