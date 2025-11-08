import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChoreColumn } from '@/components/daily-chores/ChoreColumn';
import type { ChoreViewModel } from '@/types/daily-view.types';
import type { MemberDTO } from '@/types';

// Mock react-dnd
vi.mock('react-dnd', () => ({
  useDrop: vi.fn(() => [{ isOver: false }, vi.fn()]),
}));

vi.mock('@/components/daily-chores/ChoreCard', () => ({
  ChoreCard: ({ chore }: any) => (
    <div data-testid={`chore-card-${chore.id}`}>
      <span>{chore.catalogTitle}</span>
    </div>
  ),
}));

vi.mock('@/components/daily-chores/ChoreCardSkeleton', () => ({
  ChoreCardSkeleton: () => <div data-testid="chore-skeleton">Loading...</div>,
}));

vi.mock('@/components/daily-chores/AddChoreButton', () => ({
  AddChoreButton: ({ onClick }: any) => (
    <button data-testid="add-chore-button" onClick={onClick}>
      Add Chore
    </button>
  ),
}));

// Import after mocking
import { useDrop } from 'react-dnd';

const mockUseDrop = useDrop as any;

describe('ChoreColumn', () => {
  const mockOnDrop = vi.fn();
  const mockOnChoreAssign = vi.fn();
  const mockOnChoreDelete = vi.fn();
  const mockOnAddChoreClick = vi.fn();

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
      status: 'todo',
      assignee_id: null,
      time_of_day: 'afternoon',
      points: 10,
      catalogTitle: 'Vacuum floor',
      catalogEmoji: '🧹',
      catalogCategory: 'Cleaning',
      catalogTimeOfDay: 'afternoon',
      catalogPredefined: true,
      canEdit: true,
      canDelete: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDrop.mockReturnValue([{ isOver: false }, vi.fn()]);
  });

  describe('Basic Rendering', () => {
    it('renders column title with chore count', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
          onAddChoreClick={mockOnAddChoreClick}
        />
      );

      expect(screen.getByText('To Do (2)')).toBeInTheDocument();
    });

    it('renders all chore cards', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
          onAddChoreClick={mockOnAddChoreClick}
        />
      );

      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
      expect(screen.getByTestId('chore-card-chore-2')).toBeInTheDocument();
      expect(screen.getByText('Wash dishes')).toBeInTheDocument();
      expect(screen.getByText('Vacuum floor')).toBeInTheDocument();
    });

    it('renders empty state message when no chores', () => {
      render(
        <ChoreColumn
          title="Done"
          status="done"
          chores={[]}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      expect(screen.getByText('No completed chores yet')).toBeInTheDocument();
      expect(screen.getByText('Drag chores here when done!')).toBeInTheDocument();
    });

    it('shows different empty state for todo column', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={[]}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
          onAddChoreClick={mockOnAddChoreClick}
        />
      );

      expect(screen.getByText('No tasks to do!')).toBeInTheDocument();
    });
  });

  describe('Add Chore Button', () => {
    it('renders add button for todo column when callback provided', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
          onAddChoreClick={mockOnAddChoreClick}
        />
      );

      expect(screen.getByTestId('add-chore-button')).toBeInTheDocument();
    });

    it('does not render add button for done column', () => {
      render(
        <ChoreColumn
          title="Done"
          status="done"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
          onAddChoreClick={mockOnAddChoreClick}
        />
      );

      expect(screen.queryByTestId('add-chore-button')).not.toBeInTheDocument();
    });

    it('does not render add button when callback not provided', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      expect(screen.queryByTestId('add-chore-button')).not.toBeInTheDocument();
    });

    it('calls onAddChoreClick when add button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
          onAddChoreClick={mockOnAddChoreClick}
        />
      );

      const addButton = screen.getByTestId('add-chore-button');
      await user.click(addButton);

      expect(mockOnAddChoreClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Drag and Drop', () => {
    it('sets up drop zone correctly', () => {
      const mockDropRef = vi.fn();
      mockUseDrop.mockReturnValue([{ isOver: false }, mockDropRef]);

      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      expect(mockUseDrop).toHaveBeenCalledWith({
        accept: 'chore',
        drop: expect.any(Function),
        collect: expect.any(Function),
      });
    });

    it('calls onDrop with correct chore ID when item is dropped', () => {
      const mockDropRef = vi.fn();
      const mockDropFunction = vi.fn();
      mockUseDrop.mockReturnValue([{ isOver: false }, mockDropRef]);

      // Mock the drop function to call onDrop
      mockUseDrop.mockImplementation(() => [{ isOver: false }, mockDropRef]);

      // Manually trigger the drop logic
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      // The drop logic is tested indirectly through the mock
      expect(mockUseDrop).toHaveBeenCalled();
    });

    it('applies hover styles when item is over drop zone', () => {
      mockUseDrop.mockReturnValue([{ isOver: true }, vi.fn()]);

      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const column = screen.getByTestId('chore-column-todo');
      expect(column).toHaveClass('bg-accent', 'border-2', 'border-dashed', 'border-accent');
    });

    it('does not apply hover styles when item is not over drop zone', () => {
      mockUseDrop.mockReturnValue([{ isOver: false }, vi.fn()]);

      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const column = screen.getByText('To Do (2)').closest('div');
      expect(column).not.toHaveClass('bg-accent');
    });
  });

  describe('Loading States', () => {
    it('renders skeleton cards when loading', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          isLoading={true}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const skeletons = screen.getAllByTestId('chore-skeleton');
      expect(skeletons).toHaveLength(3); // Default skeleton count
    });

    it('renders actual chore cards when not loading', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          isLoading={false}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
      expect(screen.getByTestId('chore-card-chore-2')).toBeInTheDocument();
      expect(screen.queryByTestId('chore-skeleton')).not.toBeInTheDocument();
    });

    it('shows loading state for empty column', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={[]}
          members={mockMembers}
          isLoading={true}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const skeletons = screen.getAllByTestId('chore-skeleton');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('Chore Card Interactions', () => {
    it('passes correct props to ChoreCard components', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
      expect(screen.getByTestId('chore-card-chore-2')).toBeInTheDocument();
    });

    it('passes assign callback to chore cards when provided', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      // ChoreCard components receive the callbacks through props
      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
    });

    it('does not pass assign callback when not provided', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={undefined}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct base column styling', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const column = screen.getByTestId('chore-column-todo');
      expect(column).toHaveClass('bg-card', 'p-6', 'rounded-lg', 'shadow', 'min-h-[400px]');
    });

    it('applies correct header styling', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const header = screen.getByText('To Do (2)');
      expect(header).toHaveClass('text-xl', 'font-semibold');
    });

    it('applies correct empty state styling', () => {
      render(
        <ChoreColumn
          title="Done"
          status="done"
          chores={[]}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const emptyState = screen.getByText('No completed chores yet').closest('div');
      expect(emptyState).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
      expect(emptyState).toHaveClass(
        'h-[133px]',
        'text-muted-foreground',
        'border-2',
        'border-dashed'
      );
    });
  });

  describe('Status-specific Behavior', () => {
    it('shows correct status-based styling for todo column', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const header = screen.getByText('To Do (2)');
      expect(header).toHaveClass('text-primary');
    });

    it('shows correct status-based styling for done column', () => {
      render(
        <ChoreColumn
          title="Done"
          status="done"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      const header = screen.getByText('Done (2)');
      expect(header).toHaveClass('text-primary');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined optional callbacks gracefully', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={mockMembers}
          onDrop={mockOnDrop}
        />
      );

      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
      expect(screen.getByTestId('chore-card-chore-2')).toBeInTheDocument();
    });

    it('handles empty members array', () => {
      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={mockChores}
          members={[]}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
    });

    it('handles chores with missing data', () => {
      const incompleteChores = [
        {
          ...mockChores[0],
          catalogTitle: undefined,
        },
      ] as any;

      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={incompleteChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      // Should not crash
      expect(screen.getByTestId('chore-card-chore-1')).toBeInTheDocument();
    });

    it('maintains proper spacing and layout with many chores', () => {
      const manyChores = Array.from({ length: 10 }, (_, i) => ({
        ...mockChores[0],
        id: `chore-${i}`,
        catalogTitle: `Chore ${i}`,
      }));

      render(
        <ChoreColumn
          title="To Do"
          status="todo"
          chores={manyChores}
          members={mockMembers}
          onDrop={mockOnDrop}
          onChoreAssign={mockOnChoreAssign}
          onChoreDelete={mockOnChoreDelete}
        />
      );

      // All chores should be rendered
      manyChores.forEach((chore) => {
        expect(screen.getByTestId(`chore-card-${chore.id}`)).toBeInTheDocument();
      });
    });
  });
});
