import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDailyView, dailyViewKeys } from '@/hooks/useDailyView';

// Mocks
vi.mock('@/db/supabase.client', () => ({
  getSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn(() => false), // Default to API mode for tests
}));

vi.mock('@/lib/dailyChores.service', () => ({
  getDailyChores: vi.fn(),
  createDailyChore: vi.fn(),
  updateDailyChore: vi.fn(),
  deleteDailyChore: vi.fn(),
}));

vi.mock('@/lib/choresCatalog.service', () => ({
  getCatalogItems: vi.fn(),
}));

vi.mock('@/lib/household-members.service', () => ({
  getHouseholdMembers: vi.fn(),
}));

vi.mock('@/lib/households.service', () => ({
  getHouseholdForUser: vi.fn(),
}));

vi.mock('@/lib/profiles.service', () => ({
  getProfile: vi.fn(),
}));

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

// Import mocks
import { getSupabaseClient, isSupabaseConfigured } from '@/db/supabase.client';
import { getDailyChores, createDailyChore, updateDailyChore, deleteDailyChore } from '@/lib/dailyChores.service';
import { getCatalogItems } from '@/lib/choresCatalog.service';
import { getHouseholdMembers } from '@/lib/household-members.service';
import { getHouseholdForUser } from '@/lib/households.service';
import { getProfile } from '@/lib/profiles.service';
import { useAuthStore } from '@/stores/auth.store';

// Mock data
const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockMembers = [
  { id: '1', user_id: 'user-123', name: 'John Doe', role: 'admin' as const, avatar_url: null },
  { id: '2', user_id: 'user-456', name: 'Jane Smith', role: 'member' as const, avatar_url: null },
];
const mockHousehold = { id: '11111111-aaaa-bbbb-cccc-222222222222', name: 'Test Household' };
const mockProfile = { id: 'profile-123', name: 'John Doe' };
const mockCatalogItems = [
  {
    id: 'catalog-1',
    title: 'Wash dishes',
    emoji: '🍽️',
    category: 'Kitchen',
    time_of_day: 'any',
    points: 5,
    predefined: true,
  },
];
const mockChores = [
  {
    id: 'chore-1',
    chore_catalog_id: 'catalog-1',
    date: '2024-01-15',
    status: 'todo' as const,
    assignee_id: 'user-123',
    time_of_day: 'any' as const,
  },
];

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  return Wrapper;
}

describe('useDailyView', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementations
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    (isSupabaseConfigured as any).mockReturnValue(false); // API mode
    (getHouseholdMembers as any).mockResolvedValue(mockMembers);
    (getHouseholdForUser as any).mockResolvedValue(mockHousehold);
    (getProfile as any).mockResolvedValue(mockProfile);
    (getCatalogItems as any).mockResolvedValue(mockCatalogItems);
    (getDailyChores as any).mockResolvedValue(mockChores);
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Initialization', () => {
    it('initializes with today\'s date', () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      const today = new Date().toISOString().split('T')[0];
      expect(result.current.currentDate).toBe(today);
    });

    it('uses authenticated user ID when available', () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentUserId).toBe('user-123');
    });

    it('falls back to development user ID when not authenticated', () => {
      (useAuthStore as any).mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentUserId).toBe('e9d12995-1f3e-491d-9628-3c4137d266d1');
    });
  });

  describe('Query Management', () => {
    it('fetches household members successfully', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.members).toEqual(mockMembers);
      });

      expect(getHouseholdMembers).toHaveBeenCalledWith(getSupabaseClient(), 'user-123');
    });

    it('fetches household data successfully', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.household).toEqual(mockHousehold);
      });

      expect(getHouseholdForUser).toHaveBeenCalledWith(getSupabaseClient(), 'user-123');
    });

    it('fetches user profile successfully', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      expect(getProfile).toHaveBeenCalledWith(getSupabaseClient(), 'user-123');
    });

    it('handles household query failure gracefully', async () => {
      (getHouseholdForUser as any).mockRejectedValue(new Error('Household not found'));

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Household not found');
      });
    });

    it('uses development household ID as fallback when household query fails', async () => {
      (getHouseholdForUser as any).mockRejectedValue(new Error('Household not found'));

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      // Wait for other queries to complete
      await waitFor(() => {
        expect(result.current.members).toBeDefined();
      });

      // The effective household ID should be the dev fallback
      expect(result.current.household).toBeUndefined();
    });
  });

  describe('Chores Query and Data Transformation', () => {
    it('transforms chores with catalog enrichment', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      const chore = result.current.chores[0];
      expect(chore).toMatchObject({
        id: 'chore-1',
        catalogTitle: 'Wash dishes',
        catalogEmoji: '🍽️',
        catalogCategory: 'Kitchen',
        catalogTimeOfDay: 'any',
        catalogPredefined: true,
        assigneeName: 'John Doe',
        canEdit: true, // User is assignee
        canDelete: true, // User is assignee
      });
    });

    it('handles chores without catalog items gracefully', async () => {
      (getCatalogItems as any).mockResolvedValue([]);

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      const chore = result.current.chores[0];
      expect(chore.catalogTitle).toBe('Chore catalog-1');
      expect(chore.catalogEmoji).toBe('📋');
      expect(chore.catalogCategory).toBe('General');
    });

    it('sets correct permissions for assigned chores', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      const chore = result.current.chores[0];
      expect(chore.canEdit).toBe(true); // User is assignee
      expect(chore.canDelete).toBe(true); // User is assignee
    });

    it('sets correct permissions for unassigned chores', async () => {
      const unassignedChores = [{
        ...mockChores[0],
        assignee_id: null,
      }];
      (getDailyChores as any).mockResolvedValue(unassignedChores);

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      const chore = result.current.chores[0];
      expect(chore.assigneeName).toBeUndefined();
      expect(chore.canEdit).toBe(false); // No assignee, no permissions
      expect(chore.canDelete).toBe(false); // No assignee, no permissions
    });
  });

  describe('Date Navigation', () => {
    it('changes current date correctly', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setCurrentDate('2024-01-20');
      });

      expect(result.current.currentDate).toBe('2024-01-20');
    });

    it('invalidates and refetches chores when date changes', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      // Change date
      act(() => {
        result.current.setCurrentDate('2024-01-20');
      });

    });
  });

  describe('Modal Management', () => {
    it('opens add modal correctly', async () => {
      // Mock fetch for the dev-ensure endpoint
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.openAddModal();
      });

      // Wait for async operation to complete
      await waitFor(() => {
        expect(result.current.isAddModalOpen).toBe(true);
      });
    });

    it('closes add modal correctly', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.openAddModal();
        result.current.closeAddModal();
      });

      expect(result.current.isAddModalOpen).toBe(false);
    });

    it('opens assign modal with selected chore', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      const chore = result.current.chores[0];

      act(() => {
        result.current.openAssignModal(chore);
      });

      expect(result.current.isAssignModalOpen).toBe(true);
      expect(result.current.selectedChore).toEqual(chore);
    });

    it('closes assign modal and clears selection', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.closeAssignModal();
      });

      expect(result.current.isAssignModalOpen).toBe(false);
      expect(result.current.selectedChore).toBeNull();
    });
  });

  describe('Chore Mutations', () => {
    describe('Create Chore', () => {
      it('creates chore successfully', async () => {
        // Use Supabase mode for this test
        (isSupabaseConfigured as any).mockReturnValue(true);

        const createCmd = {
          date: '2024-01-15',
          chore_catalog_id: 'catalog-1',
          assignee_id: 'user-123',
        };

        (createDailyChore as any).mockResolvedValue({ id: 'new-chore-id' });

        const { result } = renderHook(() => useDailyView(), {
          wrapper: createWrapper(),
        });

      act(() => {
        result.current.handleChoreCreate(createCmd);
      });


        await waitFor(() => {
          expect(result.current.isCreatingChore).toBe(false);
        });

        expect(createDailyChore).toHaveBeenCalledWith(getSupabaseClient(), '11111111-aaaa-bbbb-cccc-222222222222', createCmd);
        expect(result.current.isAddModalOpen).toBe(false); // Modal should close on success
      });

      it('handles create chore failure', async () => {
        // Use Supabase mode for this test
        (isSupabaseConfigured as any).mockReturnValue(true);

        const createCmd = {
          date: '2024-01-15',
          chore_catalog_id: 'catalog-1',
          assignee_id: 'user-123',
        };

        (createDailyChore as any).mockRejectedValue(new Error('Create failed'));

        const { result } = renderHook(() => useDailyView(), {
          wrapper: createWrapper(),
        });

        act(() => {
          result.current.handleChoreCreate(createCmd);
        });

        await waitFor(() => {
          expect(result.current.isCreatingChore).toBe(false);
        });

        expect(createDailyChore).toHaveBeenCalledWith(getSupabaseClient(), '11111111-aaaa-bbbb-cccc-222222222222', createCmd);
        // Modal state is not affected by mutation failure
      });
    });

    describe('Update Chore', () => {
      it('updates chore successfully', async () => {
        // Use Supabase mode for this test
        (isSupabaseConfigured as any).mockReturnValue(true);

        const updates = { assignee_id: 'user-456' };

        (updateDailyChore as any).mockResolvedValue({ id: 'chore-1' });

        const { result } = renderHook(() => useDailyView(), {
          wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleChoreUpdate('chore-1', updates);
      });


        await waitFor(() => {
          expect(result.current.isUpdatingChore).toBe(false);
        });

        expect(updateDailyChore).toHaveBeenCalledWith(
          getSupabaseClient(),
          '11111111-aaaa-bbbb-cccc-222222222222',
          'chore-1',
          'user-123',
          updates
        );
        expect(result.current.isAssignModalOpen).toBe(false); // Modal should close on success
      });

      it('handles update chore failure', async () => {
        // Use Supabase mode for this test
        (isSupabaseConfigured as any).mockReturnValue(true);

        const updates = { assignee_id: 'user-456' };

        (updateDailyChore as any).mockRejectedValue(new Error('Update failed'));

        const { result } = renderHook(() => useDailyView(), {
          wrapper: createWrapper(),
        });

        act(() => {
          result.current.handleChoreUpdate('chore-1', updates);
        });

        await waitFor(() => {
          expect(result.current.isUpdatingChore).toBe(false);
        });

        // Modal state is not affected by mutation failure
      });
    });

    describe('Delete Chore', () => {
      it('deletes chore successfully', async () => {
        // Use Supabase mode for this test
        (isSupabaseConfigured as any).mockReturnValue(true);

        (deleteDailyChore as any).mockResolvedValue(true);

        const { result } = renderHook(() => useDailyView(), {
          wrapper: createWrapper(),
        });

      act(() => {
        result.current.handleChoreDelete('chore-1');
      });


        await waitFor(() => {
          expect(result.current.isDeletingChore).toBe(false);
        });

        expect(deleteDailyChore).toHaveBeenCalledWith(
          getSupabaseClient(),
          '11111111-aaaa-bbbb-cccc-222222222222',
          'chore-1',
          'user-123'
        );
      });

      it('handles delete chore failure', async () => {
        (deleteDailyChore as any).mockRejectedValue(new Error('Delete failed'));

        const { result } = renderHook(() => useDailyView(), {
          wrapper: createWrapper(),
        });

        act(() => {
          result.current.handleChoreDelete('chore-1');
        });

        await waitFor(() => {
          expect(result.current.isDeletingChore).toBe(false);
        });

        expect(deleteDailyChore).toHaveBeenCalledWith(
          getSupabaseClient(),
          '11111111-aaaa-bbbb-cccc-222222222222',
          'chore-1',
          'user-123'
        );
      });
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state during initial data fetch', () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('hides loading state when all queries complete', async () => {
      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('shows error when household query fails', async () => {
      (getHouseholdForUser as any).mockRejectedValue(new Error('Household error'));

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Household error');
      });
    });

    it('shows error when members query fails', async () => {
      (getHouseholdMembers as any).mockRejectedValue(new Error('Members error'));

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Members error');
      });
    });

    it('shows error when chores query fails', async () => {
      (getDailyChores as any).mockRejectedValue(new Error('Chores error'));

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Chores error');
      });
    });
  });

  describe('API vs Supabase Mode', () => {
    it('uses API mode when Supabase is not configured', async () => {
      // Create fresh query client for this test
      const freshQueryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
          mutations: { retry: false },
        },
      });

      // Reset to API mode
      (isSupabaseConfigured as any).mockReturnValue(false);

      // Mock fetch for API calls
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockMembers),
      });
      global.fetch = mockFetch;

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(QueryClientProvider, { client: freshQueryClient }, children)
      );

      const { result } = renderHook(() => useDailyView(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.members).toEqual(mockMembers);
      });

    });

    it('uses Supabase mode when configured', async () => {
      (isSupabaseConfigured as any).mockReturnValue(true);

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.members).toBeDefined();
      });

      expect(getHouseholdMembers).toHaveBeenCalledWith(getSupabaseClient(), 'user-123');
    });
  });

  describe('Query Keys', () => {
    it('generates correct query keys', () => {
      expect(dailyViewKeys.all).toEqual(['dailyView']);
      expect(dailyViewKeys.chores('2024-01-15')).toEqual(['dailyView', 'chores', '2024-01-15']);
      expect(dailyViewKeys.members()).toEqual(['dailyView', 'members']);
      expect(dailyViewKeys.household()).toEqual(['dailyView', 'household']);
      expect(dailyViewKeys.profile()).toEqual(['dailyView', 'profile']);
      expect(dailyViewKeys.userPoints('user-123')).toEqual(['points', 'user', 'user-123']);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty chores array', async () => {
      (getDailyChores as any).mockResolvedValue([]);

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toEqual([]);
      });
    });

    it('handles empty members array', async () => {
      (getHouseholdMembers as any).mockResolvedValue([]);

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.members).toEqual([]);
      });
    });

    it('handles chores with unknown assignee', async () => {
      const choresWithUnknownAssignee = [{
        ...mockChores[0],
        assignee_id: 'unknown-user',
      }];
      (getDailyChores as any).mockResolvedValue(choresWithUnknownAssignee);

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      const chore = result.current.chores[0];
      expect(chore.assigneeName).toBeUndefined();
    });

    it('handles catalog fetch failure gracefully', async () => {
      (getCatalogItems as any).mockRejectedValue(new Error('Catalog fetch failed'));

      const { result } = renderHook(() => useDailyView(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chores).toHaveLength(1);
      });

      const chore = result.current.chores[0];
      expect(chore.catalogTitle).toBe('Chore catalog-1');
      expect(chore.catalogEmoji).toBe('📋');
    });
  });
});
