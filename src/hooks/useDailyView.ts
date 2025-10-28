import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient, isSupabaseConfigured } from '@/db/supabase.client';
import { getDailyChores, createDailyChore, updateDailyChore, deleteDailyChore } from '@/lib/dailyChores.service';
import { getCatalogItems } from '@/lib/choresCatalog.service';
import { getHouseholdMembers } from '@/lib/household-members.service';
import { getHouseholdForUser } from '@/lib/households.service';
import { getProfile } from '@/lib/profiles.service';
import type { ChoreViewModel, DailyViewState } from '@/types/daily-view.types';
import type { MemberDTO, DailyChoreDTO, CreateDailyChoreCmd, UpdateDailyChoreCmd } from '@/types';

// Query keys for React Query
export const dailyViewKeys = {
  all: ['dailyView'] as const,
  chores: (date: string) => [...dailyViewKeys.all, 'chores', date] as const,
  members: () => [...dailyViewKeys.all, 'members'] as const,
  household: () => [...dailyViewKeys.all, 'household'] as const,
  profile: () => [...dailyViewKeys.all, 'profile'] as const,
};

/**
 * Custom hook for managing daily chores view state and API interactions using React Query
 */
export function useDailyView() {
  const queryClient = useQueryClient();
  const devHouseholdId = (import.meta.env.PUBLIC_DEV_HOUSEHOLD_ID as string | undefined)?.trim() || undefined;
  const useApi = !isSupabaseConfigured;

  // Initialize with today's date
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedChore, setSelectedChore] = useState<ChoreViewModel | null>(null);

  // Hardcoded user ID for development (should come from auth context)
  const currentUserId = 'e9d12995-1f3e-491d-9628-3c4137d266d1'; // DEFAULT_USER_ID from supabase.client.ts

  // Query for household members
  const membersQuery = useQuery({
    queryKey: dailyViewKeys.members(),
    queryFn: async () => {
      if (useApi) {
        const res = await fetch('/api/v1/members');
        if (!res.ok) throw new Error('Failed to load members');
        return (await res.json()) as MemberDTO[];
      }
      return getHouseholdMembers(getSupabaseClient(), currentUserId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: useApi || isSupabaseConfigured,
  });

  // Query for household info
  const householdQuery = useQuery({
    queryKey: dailyViewKeys.household(),
    queryFn: async () => {
      if (useApi) {
        const res = await fetch('/api/v1/households/current');
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to load household');
        return (await res.json()) as any;
      }
      return getHouseholdForUser(getSupabaseClient(), currentUserId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: useApi || isSupabaseConfigured,
  });

  // Effective household id (prefer fetched, else dev fallback)
  const effectiveHouseholdId = householdQuery.data?.id || devHouseholdId;

  // Query for user profile
  const profileQuery = useQuery({
    queryKey: dailyViewKeys.profile(),
    queryFn: async () => {
      if (useApi) {
        const res = await fetch('/api/v1/profiles/me');
        if (!res.ok) throw new Error('Failed to load profile');
        return await res.json();
      }
      return getProfile(getSupabaseClient(), currentUserId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: useApi || isSupabaseConfigured,
  });

  // Catalog items: predefined + custom for this household
  const catalogQuery = useQuery({
    queryKey: [...dailyViewKeys.all, 'catalog', effectiveHouseholdId] as const,
    queryFn: async () => {
      if (useApi) {
        const res = await fetch('/api/v1/catalog?type=all');
        if (!res.ok) throw new Error('Failed to load catalog');
        return await res.json();
      }
      if (!effectiveHouseholdId) return [];
      return getCatalogItems(getSupabaseClient(), effectiveHouseholdId, 'all');
    },
    enabled: useApi || (isSupabaseConfigured && !!effectiveHouseholdId),
    staleTime: 5 * 60 * 1000,
  });

  // Query for chores on current date
  const choresQuery = useQuery({
    queryKey: dailyViewKeys.chores(currentDate),
    queryFn: async () => {
      let chores: DailyChoreDTO[];
      if (useApi) {
        const res = await fetch(`/api/v1/daily-chores?date=${encodeURIComponent(currentDate)}`);
        if (!res.ok) throw new Error('Failed to load chores');
        chores = await res.json();
      } else {
        if (!effectiveHouseholdId) throw new Error('Household not configured');
        chores = await getDailyChores(getSupabaseClient(), effectiveHouseholdId, { date: currentDate });
      }

      // Transform to ChoreViewModel with catalog enrichment
      let catalog = (catalogQuery.data || []) as Array<{ id: string; title: string; emoji: string | null; category: string }>;
      // If some catalog items are missing, try to fetch them individually (API mode only)
      if (useApi) {
        const missingIds = chores
          .map((c) => c.chore_catalog_id)
          .filter((id) => !catalog.some((ci) => ci.id === id));
        if (missingIds.length > 0) {
          const fetched = await Promise.all(
            missingIds.map(async (id) => {
              try {
                const res = await fetch(`/api/v1/catalog/${id}`);
                if (!res.ok) return null;
                return await res.json();
              } catch {
                return null;
              }
            })
          );
          catalog = catalog.concat(fetched.filter(Boolean) as any[]);
        }
      }
      const viewModels: ChoreViewModel[] = chores.map(chore => {
        const catalogItem = catalog.find((ci) => ci.id === chore.chore_catalog_id);
        const catalogTitle = catalogItem?.title ?? `Chore ${chore.chore_catalog_id}`;
        const catalogEmoji = catalogItem?.emoji ?? '📋';
        const catalogCategory = catalogItem?.category ?? 'General';

        // Find assignee from members
        const assignee = chore.assignee_id
          ? membersQuery.data?.find(member => member.user_id === chore.assignee_id)
          : null;

        return {
          ...chore,
          catalogTitle,
          catalogEmoji,
          catalogCategory,
          catalogTimeOfDay: chore.time_of_day as any,
          assigneeName: assignee?.name,
          assigneeAvatar: assignee?.avatar_url || undefined,
          canEdit: chore.assignee_id === currentUserId || profileQuery.data?.name === 'Admin', // TODO: proper permission check
          canDelete: chore.assignee_id === currentUserId || profileQuery.data?.name === 'Admin', // TODO: proper permission check
        };
      });

      return viewModels;
    },
    enabled: useApi || (isSupabaseConfigured && !!effectiveHouseholdId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Handle date change
  const handleDateChange = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  // Modal handlers
  const openAddModal = useCallback(async () => {
    try {
      if (!householdQuery.data) {
        // Dev helper: ensure a household exists, then refetch
        const res = await fetch('/api/v1/households/dev-ensure', { method: 'POST' });
        if (!res.ok) {
          throw new Error('Failed to ensure household');
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: dailyViewKeys.household() }),
          queryClient.invalidateQueries({ queryKey: dailyViewKeys.members() }),
        ]);
      }
    } catch (e) {
      console.error('Unable to ensure household:', e);
      return;
    }
    setIsAddModalOpen(true);
  }, [householdQuery.data, queryClient]);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const openAssignModal = useCallback((chore: ChoreViewModel) => {
    setIsAssignModalOpen(true);
    setSelectedChore(chore);
  }, []);

  const closeAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
    setSelectedChore(null);
  }, []);

  // Create chore mutation
  const createChoreMutation = useMutation({
    mutationFn: async (cmd: CreateDailyChoreCmd) => {
      if (useApi) {
        const res = await fetch('/api/v1/daily-chores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cmd),
        });
        if (!res.ok) throw new Error('Failed to create chore');
        return await res.json();
      }
      if (!effectiveHouseholdId) throw new Error('Household not configured');
      return createDailyChore(getSupabaseClient(), effectiveHouseholdId, cmd);
    },
    onSuccess: () => {
      // Invalidate and refetch chores for current date
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.chores(currentDate) });
      closeAddModal();
    },
    onError: (error) => {
      console.error('Failed to create chore:', error);
      // TODO: Show error toast
    },
  });

  // Update chore mutation
  const updateChoreMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateDailyChoreCmd }) => {
      if (useApi) {
        const res = await fetch(`/api/v1/daily-chores/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update chore');
        return await res.json();
      }
      if (!effectiveHouseholdId) throw new Error('Household not configured');
      return updateDailyChore(getSupabaseClient(), effectiveHouseholdId, id, currentUserId, updates);
    },
    onSuccess: () => {
      // Invalidate and refetch chores for current date
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.chores(currentDate) });
      closeAssignModal();
    },
    onError: (error) => {
      console.error('Failed to update chore:', error);
      // TODO: Show error toast
    },
  });

  // Delete chore mutation
  const deleteChoreMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useApi) {
        const res = await fetch(`/api/v1/daily-chores/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete chore');
        return true;
      }
      if (!effectiveHouseholdId) throw new Error('Household not configured');
      return deleteDailyChore(getSupabaseClient(), effectiveHouseholdId, id, currentUserId);
    },
    onSuccess: () => {
      // Invalidate and refetch chores for current date
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.chores(currentDate) });
    },
    onError: (error) => {
      console.error('Failed to delete chore:', error);
      // TODO: Show error toast
    },
  });

  // Loading and error states
  const isLoading = householdQuery.isLoading || membersQuery.isLoading || choresQuery.isLoading;
  const error = householdQuery.error || membersQuery.error || choresQuery.error;

  return {
    // Data
    currentDate,
    chores: choresQuery.data || [],
    members: membersQuery.data || [],
    household: householdQuery.data,
    profile: profileQuery.data,
    currentUserId,

    // Modal states
    isAddModalOpen,
    isAssignModalOpen,
    selectedChore,

    // Loading and error states
    isLoading,
    error: error?.message || null,

    // Actions
    setCurrentDate: handleDateChange,
    openAddModal,
    closeAddModal,
    openAssignModal,
    closeAssignModal,

    // Mutations
    handleChoreCreate: createChoreMutation.mutate,
    handleChoreUpdate: (id: string, updates: UpdateDailyChoreCmd) =>
      updateChoreMutation.mutate({ id, updates }),
    handleChoreDelete: deleteChoreMutation.mutate,

    // Mutation states
    isCreatingChore: createChoreMutation.isPending,
    isUpdatingChore: updateChoreMutation.isPending,
    isDeletingChore: deleteChoreMutation.isPending,
  };
}
