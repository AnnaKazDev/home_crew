import { useState, useEffect, useCallback } from 'react';
import type { ChoreViewModel, DailyViewState } from '@/types/daily-view.types';
import type { MemberDTO, HouseholdDTO, DailyChoreDTO, CreateDailyChoreCmd, UpdateDailyChoreCmd } from '@/types';

// Mock data for development
const MOCK_HOUSEHOLD: HouseholdDTO = {
  id: '11111111-aaaa-bbbb-cccc-222222222222',
  name: 'Smith Family',
  timezone: 'America/New_York'
};

const MOCK_MEMBERS: MemberDTO[] = [
  {
    id: '1f5ca8b2-3d5a-4a28-b167-4dca37a3ee27',
    user_id: 'user-1',
    name: 'John Smith',
    avatar_url: null,
    role: 'admin',
    joined_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2f5ca8b2-3d5a-4a28-b167-4dca37a3ee28',
    user_id: 'user-2',
    name: 'Jane Smith',
    avatar_url: null,
    role: 'member',
    joined_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '3f5ca8b2-3d5a-4a28-b167-4dca37a3ee29',
    user_id: 'user-3',
    name: 'Mike Smith',
    avatar_url: null,
    role: 'member',
    joined_at: '2025-01-15T10:00:00Z'
  }
];

const MOCK_CHORES: DailyChoreDTO[] = [
  {
    id: 'chore-1',
    date: '2025-10-27',
    time_of_day: 'morning',
    status: 'todo',
    assignee_id: 'user-1',
    points: 25,
    chore_catalog_id: 'catalog-1'
  },
  {
    id: 'chore-2',
    date: '2025-10-27',
    time_of_day: 'afternoon',
    status: 'todo',
    assignee_id: 'user-2',
    points: 40,
    chore_catalog_id: 'catalog-2'
  },
  {
    id: 'chore-3',
    date: '2025-10-27',
    time_of_day: 'evening',
    status: 'todo',
    assignee_id: null,
    points: 20,
    chore_catalog_id: 'catalog-3'
  },
  {
    id: 'chore-4',
    date: '2025-10-27',
    time_of_day: 'morning',
    status: 'done',
    assignee_id: 'user-1',
    points: 60,
    chore_catalog_id: 'catalog-4'
  },
  {
    id: 'chore-5',
    date: '2025-10-27',
    time_of_day: 'afternoon',
    status: 'done',
    assignee_id: 'user-3',
    points: 35,
    chore_catalog_id: 'catalog-5'
  }
];

// Mock catalog data for enrichment
const MOCK_CATALOG = {
  'catalog-1': { title: 'Dust furniture', emoji: '🪑', category: 'Living Room' },
  'catalog-2': { title: 'Wash dishes', emoji: '🍽️', category: 'Kitchen' },
  'catalog-3': { title: 'Take out trash', emoji: '🗑️', category: 'Kitchen' },
  'catalog-4': { title: 'Clean stovetop', emoji: '🔥', category: 'Kitchen' },
  'catalog-5': { title: 'Change bed sheets', emoji: '🛌', category: 'Bedroom' }
};

/**
 * Custom hook for managing daily chores view state and API interactions
 */
export function useDailyView() {
  // Initialize with today's date
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [state, setState] = useState<DailyViewState>({
    currentDate,
    chores: [],
    members: [],
    household: {} as HouseholdDTO,
    currentUserId: '',
    isAddModalOpen: false,
    isAssignModalOpen: false,
    selectedChore: null,
    isLoading: true,
    error: null,
  });

  // API base URL (kept for future real API integration)
  const API_BASE = '/api/v1';

  // Mock API functions for development
  const mockApiCall = <T>(data: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  };

  // Fetch chores for current date (mock data)
  const fetchChores = useCallback(async (date: string) => {
    try {
      // Filter mock chores for the requested date
      const choresForDate = MOCK_CHORES.filter(chore => chore.date === date);

      // Mock API delay
      await mockApiCall(null, 300);

      // Transform to ChoreViewModel with catalog enrichment
      const viewModels: ChoreViewModel[] = choresForDate.map(chore => {
        const catalogData = MOCK_CATALOG[chore.chore_catalog_id as keyof typeof MOCK_CATALOG] || {
          title: 'Unknown Chore',
          emoji: '❓',
          category: 'General'
        };

        // Find assignee from members
        const assignee = chore.assignee_id
          ? MOCK_MEMBERS.find(member => member.user_id === chore.assignee_id)
          : null;

        return {
          ...chore,
          catalogTitle: catalogData.title,
          catalogEmoji: catalogData.emoji,
          catalogCategory: catalogData.category,
          catalogTimeOfDay: chore.time_of_day as any,
          assigneeName: assignee?.name,
          assigneeAvatar: assignee?.avatar_url || undefined,
          canEdit: true, // Mock: always can edit
          canDelete: true, // Mock: always can delete
        };
      });

      setState(prev => ({
        ...prev,
        chores: viewModels,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  }, []);

  // Fetch household members (mock data)
  const fetchMembers = useCallback(async () => {
    try {
      await mockApiCall(null, 200);
      setState(prev => ({
        ...prev,
        members: MOCK_MEMBERS,
      }));
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  }, []);

  // Fetch current household (mock data)
  const fetchHousehold = useCallback(async () => {
    try {
      await mockApiCall(null, 200);
      setState(prev => ({
        ...prev,
        household: MOCK_HOUSEHOLD,
      }));
    } catch (error) {
      console.error('Failed to fetch household:', error);
    }
  }, []);

  // Fetch current user profile (mock data)
  const fetchCurrentUser = useCallback(async () => {
    try {
      await mockApiCall(null, 200);
      setState(prev => ({
        ...prev,
        currentUserId: 'user-1', // Mock current user is John Smith (admin)
      }));
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    console.log('useDailyView: useEffect running');

    // Set mock data directly without async calls
    setState(prev => ({
      ...prev,
      chores: MOCK_CHORES.map(chore => {
        const catalogData = MOCK_CATALOG[chore.chore_catalog_id as keyof typeof MOCK_CATALOG] || {
          title: 'Unknown Chore',
          emoji: '❓',
          category: 'General'
        };

        const assignee = chore.assignee_id
          ? MOCK_MEMBERS.find(member => member.user_id === chore.assignee_id)
          : null;

        return {
          ...chore,
          catalogTitle: catalogData.title,
          catalogEmoji: catalogData.emoji,
          catalogCategory: catalogData.category,
          catalogTimeOfDay: chore.time_of_day as any,
          assigneeName: assignee?.name,
          assigneeAvatar: assignee?.avatar_url || undefined,
          canEdit: true,
          canDelete: true,
        };
      }),
      members: MOCK_MEMBERS,
      household: MOCK_HOUSEHOLD,
      currentUserId: 'user-1',
      isLoading: false,
      error: null,
    }));

    console.log('useDailyView: Mock data set');
  }, []);

  // Handle date change
  const handleDateChange = useCallback((date: string) => {
    setCurrentDate(date);
    setState(prev => ({ ...prev, currentDate: date, isLoading: true }));
  }, []);

  // Modal handlers
  const openAddModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddModalOpen: true }));
  }, []);

  const closeAddModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddModalOpen: false }));
  }, []);

  const openAssignModal = useCallback((chore: ChoreViewModel) => {
    setState(prev => ({
      ...prev,
      isAssignModalOpen: true,
      selectedChore: chore,
    }));
  }, []);

  const closeAssignModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAssignModalOpen: false,
      selectedChore: null,
    }));
  }, []);

  // Create chore handler (mock implementation)
  const handleChoreCreate = useCallback(async (cmd: CreateDailyChoreCmd) => {
    try {
      // Mock API delay
      await mockApiCall(null, 800);

      // Generate mock new chore
      const newChore: DailyChoreDTO = {
        id: `chore-${Date.now()}`,
        date: cmd.date,
        time_of_day: cmd.time_of_day || 'any',
        status: 'todo',
        assignee_id: cmd.assignee_id || null,
        points: 25, // Mock points from catalog
        chore_catalog_id: cmd.chore_catalog_id,
      };

      // Add to mock data (in real app this would be persisted)
      // For demo purposes, just refresh the list
      await fetchChores(currentDate);
      closeAddModal();
    } catch (error) {
      console.error('Failed to create chore:', error);
      // TODO: Show error toast
    }
  }, [currentDate, fetchChores, closeAddModal]);

  // Update chore handler (mock implementation)
  const handleChoreUpdate = useCallback(async (id: string, updates: UpdateDailyChoreCmd) => {
    try {
      // Mock API delay
      await mockApiCall(null, 500);

      // In a real app, this would update the database
      // For mock purposes, we just refresh the data
      await fetchChores(currentDate);
      closeAssignModal();
    } catch (error) {
      console.error('Failed to update chore:', error);
      // TODO: Show error toast
    }
  }, [currentDate, fetchChores, closeAssignModal]);

  // Delete chore handler (mock implementation)
  const handleChoreDelete = useCallback(async (id: string) => {
    try {
      // Mock API delay
      await mockApiCall(null, 500);

      // In a real app, this would delete from database
      // For mock purposes, we just refresh the data
      await fetchChores(currentDate);
    } catch (error) {
      console.error('Failed to delete chore:', error);
      // TODO: Show error toast
    }
  }, [currentDate, fetchChores]);

  return {
    ...state,
    currentDate,
    setCurrentDate: handleDateChange,
    openAddModal,
    closeAddModal,
    openAssignModal,
    closeAssignModal,
    handleChoreCreate,
    handleChoreUpdate,
    handleChoreDelete,
  };
}
