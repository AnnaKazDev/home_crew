import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient, isSupabaseConfigured } from "@/db/supabase.client";
import { getDailyChores, createDailyChore, updateDailyChore, deleteDailyChore } from "@/lib/dailyChores.service";
import { getCatalogItems } from "@/lib/choresCatalog.service";
import { getHouseholdMembers } from "@/lib/household-members.service";
import { getHouseholdForUser } from "@/lib/households.service";
import { getProfile } from "@/lib/profiles.service";
import { useAuthStore } from "@/stores/auth.store";
import type { ChoreViewModel, DailyViewState } from "@/types/daily-view.types";
import type { MemberDTO, DailyChoreDTO, CreateDailyChoreCmd, UpdateDailyChoreCmd } from "@/types";

// Query keys for React Query
export const dailyViewKeys = {
  all: ["dailyView"] as const,
  chores: (date: string) => [...dailyViewKeys.all, "chores", date] as const,
  members: () => [...dailyViewKeys.all, "members"] as const,
  household: () => [...dailyViewKeys.all, "household"] as const,
  profile: () => [...dailyViewKeys.all, "profile"] as const,
  points: () => ["points"] as const,
  userPoints: (userId: string) => [...dailyViewKeys.points(), "user", userId] as const,
};

/**
 * Custom hook for managing daily chores view state and API interactions using React Query
 */
export function useDailyView() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const devHouseholdId = "11111111-aaaa-bbbb-cccc-222222222222";
  const useApi = !isSupabaseConfigured;

  // Initialize with today's date
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedChore, setSelectedChore] = useState<ChoreViewModel | null>(null);

  // Use authenticated user ID or fallback to development user for API mode
  const currentUserId = user?.id || "e9d12995-1f3e-491d-9628-3c4137d266d1";

  // Query for household members
  const membersQuery = useQuery({
    queryKey: dailyViewKeys.members(),
    queryFn: async () => {
      if (useApi) {
        const res = await fetch("/api/v1/members");
        if (!res.ok) throw new Error("Failed to load members");
        return (await res.json()) as MemberDTO[];
      }
      return getHouseholdMembers(getSupabaseClient(), currentUserId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: useApi || (isSupabaseConfigured && isAuthenticated && !!currentUserId),
  });

  // Query for household info
  const householdQuery = useQuery({
    queryKey: dailyViewKeys.household(),
    queryFn: async () => {
      if (useApi) {
        const res = await fetch("/api/v1/households/current");
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to load household");
        return (await res.json()) as any;
      }
      return getHouseholdForUser(getSupabaseClient(), currentUserId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: useApi || (isSupabaseConfigured && isAuthenticated && !!currentUserId),
  });

  // Effective household id (prefer fetched, else dev fallback)
  const effectiveHouseholdId = householdQuery.data?.id || devHouseholdId;

  // Query for user profile
  const profileQuery = useQuery({
    queryKey: dailyViewKeys.profile(),
    queryFn: async () => {
      if (useApi) {
        const res = await fetch("/api/v1/profiles/me");
        if (!res.ok) throw new Error("Failed to load profile");
        return await res.json();
      }
      return getProfile(getSupabaseClient(), currentUserId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: useApi || (isSupabaseConfigured && isAuthenticated && !!currentUserId),
  });

  // Catalog items: predefined + custom for this household
  const catalogQuery = useQuery({
    queryKey: [...dailyViewKeys.all, "catalog", "all"] as const,
    queryFn: async () => {
      console.log(
        "Fetching catalog data... useApi:",
        useApi,
        "isSupabaseConfigured:",
        isSupabaseConfigured,
        "effectiveHouseholdId:",
        effectiveHouseholdId
      );
      try {
        if (useApi) {
          const res = await fetch("/api/v1/catalog?type=all");
          if (!res.ok) {
            console.error("Catalog API failed with status:", res.status);
            throw new Error("Failed to load catalog");
          }
          const data = await res.json();
          console.log("Catalog data fetched:", data.length, "items");
          return data;
        }
        const result = await getCatalogItems(getSupabaseClient(), effectiveHouseholdId || null, "all");
        return result;
      } catch (error) {
        console.error("Catalog query error:", error);
        throw error;
      }
    },
    enabled: useApi || (isSupabaseConfigured && isAuthenticated && !!currentUserId), // Enable when API mode or authenticated Supabase user
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Query for chores on current date - depends on catalog being loaded
  const choresQuery = useQuery({
    queryKey: dailyViewKeys.chores(currentDate),
    queryFn: async () => {
      let chores: DailyChoreDTO[];
      if (useApi) {
        const res = await fetch(`/api/v1/daily-chores?date=${encodeURIComponent(currentDate)}`);
        if (!res.ok) throw new Error("Failed to load chores");
        chores = await res.json();
      } else {
        if (!effectiveHouseholdId) throw new Error("Household not configured");
        chores = await getDailyChores(getSupabaseClient(), effectiveHouseholdId, { date: currentDate });
      }

      // Transform to ChoreViewModel with catalog enrichment
      // Always fetch catalog data fresh for reliable enrichment
      let catalog: {
        id: string;
        title: string;
        emoji: string | null;
        category: string;
        time_of_day: string;
        points: number;
        predefined: boolean;
      }[] = [];

      console.log("Fetching catalog data for chores enrichment...");
      try {
        if (useApi) {
          const res = await fetch("/api/v1/catalog?type=all");
          if (res.ok) {
            catalog = await res.json();
            console.log("Fetched catalog for enrichment (API):", catalog.length, "items");
          } else {
            console.error("Failed to fetch catalog for enrichment, status:", res.status);
          }
        } else {
          // Fetch catalog fresh for Supabase mode too for reliability
          catalog = await getCatalogItems(getSupabaseClient(), effectiveHouseholdId || null, "all");
          console.log("Fetched catalog for enrichment (Supabase):", catalog.length, "items");
        }
      } catch (error) {
        console.error("Error fetching catalog for enrichment:", error);
      }

      const viewModels: ChoreViewModel[] = chores.map((chore) => {
        const catalogItem = catalog.find((ci) => ci.id === chore.chore_catalog_id);
        const catalogTitle = catalogItem?.title ?? `Chore ${chore.chore_catalog_id}`;

        if (!catalogItem) {
          console.warn(
            "No catalog item found for chore:",
            chore.chore_catalog_id,
            "Available IDs:",
            catalog.map((c) => c.id).slice(0, 5)
          );
        }

        const catalogEmoji = catalogItem?.emoji ?? "📋";
        const catalogCategory = catalogItem?.category ?? "General";

        // Find assignee from members
        const assignee = chore.assignee_id
          ? membersQuery.data?.find((member) => member.user_id === chore.assignee_id)
          : null;

        return {
          ...chore,
          catalogTitle,
          catalogEmoji,
          catalogCategory,
          catalogTimeOfDay: chore.time_of_day as any,
          catalogPredefined: catalogItem?.predefined ?? true,
          assigneeName: assignee?.name,
          assigneeAvatar: assignee?.avatar_url || undefined,
          canEdit: chore.assignee_id === currentUserId || profileQuery.data?.name === "Admin", // TODO: proper permission check
          canDelete: chore.assignee_id === currentUserId || profileQuery.data?.name === "Admin", // TODO: proper permission check
        };
      });

      return viewModels;
    },
    enabled: (useApi || (isSupabaseConfigured && isAuthenticated && !!currentUserId && !!effectiveHouseholdId)) && !!membersQuery.data,
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
        const res = await fetch("/api/v1/households/dev-ensure", { method: "POST" });
        if (!res.ok) {
          throw new Error("Failed to ensure household");
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: dailyViewKeys.household() }),
          queryClient.invalidateQueries({ queryKey: dailyViewKeys.members() }),
        ]);
      }
    } catch (e) {
      console.error("Unable to ensure household:", e);
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
        const res = await fetch("/api/v1/daily-chores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cmd),
        });
        if (!res.ok) throw new Error("Failed to create chore");
        return await res.json();
      }
      if (!effectiveHouseholdId) throw new Error("Household not configured");
      return createDailyChore(getSupabaseClient(), effectiveHouseholdId, cmd);
    },
    onSuccess: () => {
      // Invalidate and refetch chores for current date
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.chores(currentDate) });
      // Invalidate points data to refresh profile view
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.userPoints(currentUserId) });
      // Notify other components to refresh points data
      window.dispatchEvent(new CustomEvent("pointsDataChanged"));
      closeAddModal();
    },
    onError: (error) => {
      console.error("Failed to create chore:", error);
      // TODO: Show error toast
    },
  });

  // Update chore mutation
  const updateChoreMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateDailyChoreCmd }) => {
      if (useApi) {
        const res = await fetch(`/api/v1/daily-chores/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Failed to update chore");
        return await res.json();
      }
      if (!effectiveHouseholdId) throw new Error("Household not configured");
      return updateDailyChore(getSupabaseClient(), effectiveHouseholdId, id, currentUserId, updates);
    },
    onSuccess: () => {
      // Invalidate and refetch chores for current date
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.chores(currentDate) });
      // Invalidate points data to refresh profile view
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.userPoints(currentUserId) });
      // Notify other components to refresh points data
      window.dispatchEvent(new CustomEvent("pointsDataChanged"));
      closeAssignModal();
    },
    onError: (error) => {
      console.error("Failed to update chore:", error);
      // TODO: Show error toast
    },
  });

  // Delete chore mutation
  const deleteChoreMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useApi) {
        const res = await fetch(`/api/v1/daily-chores/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete chore");
        return true;
      }
      if (!effectiveHouseholdId) throw new Error("Household not configured");
      return deleteDailyChore(getSupabaseClient(), effectiveHouseholdId, id, currentUserId);
    },
    onSuccess: () => {
      // Invalidate and refetch chores for current date
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.chores(currentDate) });
      // Invalidate points data to refresh profile view
      queryClient.invalidateQueries({ queryKey: dailyViewKeys.userPoints(currentUserId) });
      // Notify other components to refresh points data
      window.dispatchEvent(new CustomEvent("pointsDataChanged"));
    },
    onError: (error) => {
      console.error("Failed to delete chore:", error);
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
    handleChoreUpdate: (id: string, updates: UpdateDailyChoreCmd) => updateChoreMutation.mutate({ id, updates }),
    handleChoreDelete: deleteChoreMutation.mutate,

    // Mutation states
    isCreatingChore: createChoreMutation.isPending,
    isUpdatingChore: updateChoreMutation.isPending,
    isDeletingChore: deleteChoreMutation.isPending,
  };
}
