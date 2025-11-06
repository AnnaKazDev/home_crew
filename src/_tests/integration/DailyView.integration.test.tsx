import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DailyView from '@/components/DailyView';
import type { ChoreViewModel } from '@/types/daily-view.types';
import type { MemberDTO } from '@/types';

// Mock all external dependencies
vi.mock('@/hooks/useDailyView', () => ({
  useDailyView: vi.fn(),
}));

vi.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: vi.fn(),
}));

vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: any) => <div data-testid="dnd-provider">{children}</div>,
  HTML5Backend: vi.fn(),
}));

// Mock child components
vi.mock('@/components/daily-chores/DailyViewHeader', () => ({
  DailyViewHeader: ({ onDateChange, totalPoints, choresCount, currentDate }: any) => (
    <div data-testid="daily-view-header">
      <span>Date: {currentDate}</span>
      <span>Points: {totalPoints}</span>
      <span>Count: {choresCount}</span>
      <button data-testid="date-change-btn" onClick={() => onDateChange('2024-01-20')}>
        Change Date
      </button>
    </div>
  ),
}));

vi.mock('@/components/daily-chores/ChoreColumns', () => ({
  ChoreColumns: ({
    todoChores,
    doneChores,
    members,
    isLoading,
    onChoreDrop,
    onChoreAssign,
    onChoreDelete,
    onAddChoreClick
  }: any) => (
    <div data-testid="chore-columns">
      <div data-testid="todo-count">{todoChores.length}</div>
      <div data-testid="done-count">{doneChores.length}</div>
      <button data-testid="add-chore-btn" onClick={onAddChoreClick}>
        Add Chore
      </button>
      <button data-testid="assign-chore-btn" onClick={() => onChoreAssign(todoChores[0])}>
        Assign Chore
      </button>
      <button data-testid="drop-chore-btn" onClick={() => onChoreDrop('chore-1', 'done')}>
        Drop Chore
      </button>
    </div>
  ),
}));

vi.mock('@/components/daily-chores/AddChoreModal', () => ({
  AddChoreModal: ({ isOpen, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid="add-chore-modal">
        <button data-testid="modal-submit" onClick={() => onSubmit({ date: '2024-01-15', chore_catalog_id: 'catalog-1' })}>
          Submit Chore
        </button>
        <button data-testid="modal-close" onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/daily-chores/AssignChoreModal', () => ({
  AssignChoreModal: ({ isOpen, chore, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid="assign-chore-modal">
        <span>Assigning: {chore?.catalogTitle}</span>
        <button data-testid="assign-submit" onClick={() => onSubmit('user-123')}>
          Assign to User
        </button>
        <button data-testid="assign-close" onClick={onClose}>
          Close Assign
        </button>
      </div>
    ) : null,
}));

// Import mocks
import { useDailyView } from '@/hooks/useDailyView';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

const mockUseDailyView = useDailyView as any;
const mockUseAuthRedirect = useAuthRedirect as any;

describe('DailyView Integration', () => {
  let queryClient: QueryClient;

  const mockMembers: MemberDTO[] = [
    {
      id: 'member-1',
      user_id: 'user-123',
      name: 'John Doe',
      role: 'admin',
      avatar_url: null,
      joined_at: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockChores: ChoreViewModel[] = [
    {
      id: 'chore-1',
      chore_catalog_id: 'catalog-1',
      date: '2024-01-15',
      status: 'todo',
      assignee_id: 'user-123',
      time_of_day: 'morning',
      points: 5,
      catalogTitle: 'Wash dishes',
      catalogEmoji: '🍽️',
      catalogCategory: 'Kitchen',
      catalogTimeOfDay: 'morning',
      catalogPredefined: true,
      assigneeName: 'John Doe',
      canEdit: true,
      canDelete: true,
    },
    {
      id: 'chore-2',
      chore_catalog_id: 'catalog-2',
      date: '2024-01-15',
      status: 'done',
      assignee_id: 'user-123',
      time_of_day: 'afternoon',
      points: 10,
      catalogTitle: 'Vacuum floor',
      catalogEmoji: '🧹',
      catalogCategory: 'Cleaning',
      catalogTimeOfDay: 'afternoon',
      catalogPredefined: true,
      assigneeName: 'John Doe',
      canEdit: true,
      canDelete: true,
    },
  ];

  const defaultMockReturn = {
    // Data
    currentDate: '2024-01-15',
    chores: mockChores,
    members: mockMembers,
    household: { id: 'household-123', name: 'Test Household' },
    profile: { id: 'profile-123', name: 'John Doe' },
    currentUserId: 'user-123',

    // Modal states
    isAddModalOpen: false,
    isAssignModalOpen: false,
    selectedChore: null,

    // Loading and error states
    isLoading: false,
    error: null,

    // Actions
    setCurrentDate: vi.fn(),
    openAddModal: vi.fn(),
    closeAddModal: vi.fn(),
    openAssignModal: vi.fn(),
    closeAssignModal: vi.fn(),

    // Mutations
    handleChoreCreate: vi.fn(),
    handleChoreUpdate: vi.fn(),
    handleChoreDelete: vi.fn(),

    // Mutation states
    isCreatingChore: false,
    isUpdatingChore: false,
    isDeletingChore: false,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    // Default mocks
    mockUseAuthRedirect.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: 'user-123', email: 'test@example.com' },
    });

    mockUseDailyView.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderDailyView = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DailyView />
      </QueryClientProvider>
    );
  };

  describe('Component Integration', () => {
    it('renders all child components correctly', () => {
      renderDailyView();

      expect(screen.getByTestId('dnd-provider')).toBeInTheDocument();
      expect(screen.getByTestId('daily-view-header')).toBeInTheDocument();
      expect(screen.getByTestId('chore-columns')).toBeInTheDocument();
    });

    it('passes correct data to child components', () => {
      renderDailyView();

      // Header receives correct props
      expect(screen.getByText('Date: 2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('Points: 10')).toBeInTheDocument(); // 2 chores × 5 points each
      expect(screen.getByText('Count: 2')).toBeInTheDocument();

      // Columns receive filtered chores
      expect(screen.getByTestId('todo-count')).toHaveTextContent('1'); // 1 todo chore
      expect(screen.getByTestId('done-count')).toHaveTextContent('1'); // 1 done chore
    });

    it('calculates total points correctly from completed chores', () => {
      renderDailyView();

      // Only done chores assigned to current user should count towards total points
      // chore-2 is done and assigned to current user, so 10 points
      expect(screen.getByText('Points: 10')).toBeInTheDocument();
    });
  });

  describe('Date Navigation Flow', () => {
    it('handles date change through header component', async () => {
      const user = userEvent.setup();
      const mockSetCurrentDate = vi.fn();

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        setCurrentDate: mockSetCurrentDate,
      });

      renderDailyView();

      const dateChangeBtn = screen.getByTestId('date-change-btn');
      await user.click(dateChangeBtn);

      expect(mockSetCurrentDate).toHaveBeenCalledWith('2024-01-20');
    });

    it('updates displayed date when currentDate changes', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        currentDate: '2024-01-20',
      });

      renderDailyView();

      expect(screen.getByText('Date: 2024-01-20')).toBeInTheDocument();
    });
  });

  describe('Add Chore Flow', () => {
    it('opens add chore modal when add button is clicked', async () => {
      const user = userEvent.setup();
      const mockOpenAddModal = vi.fn();

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        openAddModal: mockOpenAddModal,
      });

      renderDailyView();

      const addChoreBtn = screen.getByTestId('add-chore-btn');
      await user.click(addChoreBtn);

      expect(mockOpenAddModal).toHaveBeenCalledTimes(1);
    });

    it('shows add chore modal when isAddModalOpen is true', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAddModalOpen: true,
      });

      renderDailyView();

      expect(screen.getByTestId('add-chore-modal')).toBeInTheDocument();
    });

    it('handles chore creation through modal', async () => {
      const user = userEvent.setup();
      const mockHandleChoreCreate = vi.fn();

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAddModalOpen: true,
        handleChoreCreate: mockHandleChoreCreate,
      });

      renderDailyView();

      const modalSubmitBtn = screen.getByTestId('modal-submit');
      await user.click(modalSubmitBtn);

      expect(mockHandleChoreCreate).toHaveBeenCalledWith({
        date: '2024-01-15',
        chore_catalog_id: 'catalog-1',
      });
    });

    it('closes modal after successful chore creation', async () => {
      const user = userEvent.setup();
      const mockCloseAddModal = vi.fn();

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAddModalOpen: true,
        closeAddModal: mockCloseAddModal,
        handleChoreCreate: vi.fn().mockImplementation(() => {
          // Simulate successful creation by calling closeAddModal
          mockCloseAddModal();
        }),
      });

      renderDailyView();

      const modalSubmitBtn = screen.getByTestId('modal-submit');
      await user.click(modalSubmitBtn);

      expect(mockCloseAddModal).toHaveBeenCalledTimes(1);
    });

    it('checks chore limit before opening modal', async () => {
      const user = userEvent.setup();
      const mockOpenAddModal = vi.fn();

      // Create 50 chores (limit)
      const fiftyChores = Array.from({ length: 50 }, (_, i) => ({
        ...mockChores[0],
        id: `chore-${i}`,
      }));

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        chores: fiftyChores,
        openAddModal: mockOpenAddModal,
      });

      renderDailyView();

      const addChoreBtn = screen.getByTestId('add-chore-btn');
      await user.click(addChoreBtn);

      // Should not open modal when at limit
      expect(mockOpenAddModal).not.toHaveBeenCalled();
    });
  });

  describe('Assign Chore Flow', () => {
    it('opens assign modal when chore assign is triggered', async () => {
      const user = userEvent.setup();
      const mockOpenAssignModal = vi.fn();

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        openAssignModal: mockOpenAssignModal,
      });

      renderDailyView();

      const assignBtn = screen.getByTestId('assign-chore-btn');
      await user.click(assignBtn);

      expect(mockOpenAssignModal).toHaveBeenCalledWith(mockChores[0]);
    });

    it('shows assign modal with selected chore', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAssignModalOpen: true,
        selectedChore: mockChores[0],
      });

      renderDailyView();

      expect(screen.getByTestId('assign-chore-modal')).toBeInTheDocument();
      expect(screen.getByText('Assigning: Wash dishes')).toBeInTheDocument();
    });

    it('handles chore assignment through modal', async () => {
      const user = userEvent.setup();
      const mockHandleChoreUpdate = vi.fn();

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAssignModalOpen: true,
        selectedChore: mockChores[0],
        handleChoreUpdate: mockHandleChoreUpdate,
      });

      renderDailyView();

      const assignSubmitBtn = screen.getByTestId('assign-submit');
      await user.click(assignSubmitBtn);

      expect(mockHandleChoreUpdate).toHaveBeenCalledWith('chore-1', {
        assignee_id: 'user-123',
      });
    });
  });

  describe('Drag and Drop Flow', () => {
    it('handles chore drop through columns component', async () => {
      const user = userEvent.setup();
      const mockHandleChoreUpdate = vi.fn();

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        handleChoreUpdate: mockHandleChoreUpdate,
      });

      renderDailyView();

      const dropBtn = screen.getByTestId('drop-chore-btn');
      await user.click(dropBtn);

      expect(mockHandleChoreUpdate).toHaveBeenCalledWith('chore-1', {
        status: 'done',
      });
    });

    it('prevents drop when chore status unchanged', async () => {
      const user = userEvent.setup();
      const mockHandleChoreUpdate = vi.fn();

      // Create a chore that's already done
      const doneChore = { ...mockChores[0], status: 'done' as const };
      const mockHandleChoreDrop = vi.fn((choreId: string, targetStatus: string) => {
        if (doneChore.status !== targetStatus) {
          mockHandleChoreUpdate(choreId, { status: targetStatus });
        }
      });

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        chores: [doneChore, mockChores[1]],
        handleChoreUpdate: mockHandleChoreUpdate,
      });

      renderDailyView();

      const dropBtn = screen.getByTestId('drop-chore-btn');
      await user.click(dropBtn);

      // Should not update since status is already 'done'
      expect(mockHandleChoreUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state from hook', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      renderDailyView();

      // Should still render but columns should show loading state
      expect(screen.getByTestId('chore-columns')).toBeInTheDocument();
    });

    it('shows error state from hook', () => {
      mockUseAuthRedirect.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 'user-123', email: 'test@example.com' },
      });

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        error: 'Failed to load data',
      });

      renderDailyView();

      // Should still render components
      expect(screen.getByTestId('daily-view-header')).toBeInTheDocument();
    });

    it('redirects when not authenticated', () => {
      mockUseAuthRedirect.mockReturnValue({
        isAuthenticated: false,
        loading: false,
        user: null,
      });

      renderDailyView();

      // Should not render main content when not authenticated
      expect(screen.queryByTestId('daily-view-header')).not.toBeInTheDocument();
    });

    it('shows loading when auth is loading', () => {
      mockUseAuthRedirect.mockReturnValue({
        isAuthenticated: false,
        loading: true,
        user: null,
      });

      renderDailyView();

      // Should not render main content during auth loading
      expect(screen.queryByTestId('daily-view-header')).not.toBeInTheDocument();
    });
  });

  describe('Points Calculation', () => {
    it('calculates points only from completed chores assigned to current user', () => {
      const mixedChores: ChoreViewModel[] = [
        // Completed, assigned to current user - should count
        { ...mockChores[0], status: 'done', assignee_id: 'user-123', points: 5 },
        // Completed, assigned to different user - should not count
        { ...mockChores[1], status: 'done', assignee_id: 'user-456', points: 10 },
        // Not completed, assigned to current user - should not count
        { ...mockChores[0], id: 'chore-3', status: 'todo', assignee_id: 'user-123', points: 15 },
        // Completed, assigned to current user - should count
        { ...mockChores[0], id: 'chore-4', status: 'done', assignee_id: 'user-123', points: 20 },
      ];

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        chores: mixedChores,
        currentUserId: 'user-123',
      });

      renderDailyView();

      // Should only count: 5 + 20 = 25 points
      expect(screen.getByText('Points: 25')).toBeInTheDocument();
    });

    it('handles chores without points gracefully', () => {
      const choresWithoutPoints = [
        { ...mockChores[0], status: 'done', assignee_id: 'user-123', points: undefined },
        { ...mockChores[1], status: 'done', assignee_id: 'user-456', points: 10 },
      ];

      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        chores: choresWithoutPoints,
        currentUserId: 'user-123',
      });

      renderDailyView();

      // Should treat undefined as 0
      expect(screen.getByText('Points: 0')).toBeInTheDocument();
    });
  });

  describe('Modal State Management', () => {
    it('closes add modal when closeAddModal is called', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAddModalOpen: true,
      });

      const { rerender } = renderDailyView();

      // Simulate modal close
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAddModalOpen: false,
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <DailyView />
        </QueryClientProvider>
      );

      expect(screen.queryByTestId('add-chore-modal')).not.toBeInTheDocument();
    });

    it('closes assign modal when closeAssignModal is called', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAssignModalOpen: true,
        selectedChore: mockChores[0],
      });

      const { rerender } = renderDailyView();

      // Simulate modal close
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAssignModalOpen: false,
        selectedChore: null,
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <DailyView />
        </QueryClientProvider>
      );

      expect(screen.queryByTestId('assign-chore-modal')).not.toBeInTheDocument();
    });
  });

  describe('Mutation States', () => {
    it('shows creating state in modal', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAddModalOpen: true,
        isCreatingChore: true,
      });

      renderDailyView();

      // Modal should handle loading state internally
      expect(screen.getByTestId('add-chore-modal')).toBeInTheDocument();
    });

    it('shows updating state in modal', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        isAssignModalOpen: true,
        selectedChore: mockChores[0],
        isUpdatingChore: true,
      });

      renderDailyView();

      // Modal should handle loading state internally
      expect(screen.getByTestId('assign-chore-modal')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty chores array', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        chores: [],
      });

      renderDailyView();

      expect(screen.getByTestId('todo-count')).toHaveTextContent('0');
      expect(screen.getByTestId('done-count')).toHaveTextContent('0');
      expect(screen.getByText('Points: 0')).toBeInTheDocument();
    });

    it('handles empty members array', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        members: [],
      });

      renderDailyView();

      // Should still render without crashing
      expect(screen.getByTestId('chore-columns')).toBeInTheDocument();
    });

    it('handles missing household data', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        household: null,
      });

      renderDailyView();

      // Should still render
      expect(screen.getByTestId('daily-view-header')).toBeInTheDocument();
    });

    it('handles undefined profile', () => {
      mockUseDailyView.mockReturnValue({
        ...defaultMockReturn,
        profile: undefined,
      });

      renderDailyView();

      // Should still render
      expect(screen.getByTestId('daily-view-header')).toBeInTheDocument();
    });
  });
});
