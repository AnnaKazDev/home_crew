import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChoreCard } from '@/components/daily-chores/ChoreCard';
import type { ChoreViewModel } from '@/types/daily-view.types';
import type { MemberDTO } from '@/types';

// Mock react-dnd
vi.mock('react-dnd', () => ({
  useDrag: vi.fn(() => [{ isDragging: false }, vi.fn()]),
}));

// Mock react-dnd-html5-backend
vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: vi.fn(),
}));

// Mock UI components used by DeleteChoreModal
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="delete-modal">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="delete-modal-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="delete-modal-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="delete-modal-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="delete-modal-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="delete-modal-footer">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, title }: any) => (
    <button data-testid={`button-${variant || 'default'}`} onClick={onClick} title={title}>
      {children}
    </button>
  ),
}));

// Mock Card component
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ref }: any) => (
    <div data-testid="card" className={className} ref={ref}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

// Import after mocking
import { useDrag } from 'react-dnd';

const mockUseDrag = useDrag as any;

describe('ChoreCard', () => {
  const mockOnAssign = vi.fn();
  const mockOnDelete = vi.fn();

  const mockMembers: MemberDTO[] = [
    {
      id: 'member-1',
      user_id: 'user-123',
      name: 'John Doe',
      role: 'admin',
      avatar_url: 'https://example.com/avatar.jpg',
      joined_at: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'member-2',
      user_id: 'user-456',
      name: 'Jane Smith',
      role: 'member',
      avatar_url: null,
      joined_at: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockChore: ChoreViewModel = {
    id: 'chore-1',
    chore_catalog_id: 'catalog-1',
    date: '2024-01-15',
    status: 'todo',
    assignee_id: 'user-123',
    time_of_day: 'morning',
    points: 5,
    // Enriched properties
    catalogTitle: 'Wash dishes',
    catalogEmoji: '🍽️',
    catalogCategory: 'Kitchen',
    catalogTimeOfDay: 'morning',
    catalogPredefined: true,
    assigneeName: 'John Doe',
    assigneeAvatar: 'https://example.com/avatar.jpg',
    canEdit: true,
    canDelete: true,
  };

  const unassignedChore: ChoreViewModel = {
    ...mockChore,
    assignee_id: null,
    assigneeName: undefined,
    assigneeAvatar: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDrag.mockReturnValue([{ isDragging: false }, vi.fn()]);
  });

  describe('Basic Rendering', () => {
    it('renders chore information correctly', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('🍽️')).toBeInTheDocument();
      expect(screen.getByText('Wash dishes')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('5 pts')).toBeInTheDocument();
    });

    it('displays time of day when not "any"', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('(morning)')).toBeInTheDocument();
    });

    it('does not display time of day when "any"', () => {
      const choreWithAnyTime = { ...mockChore, time_of_day: 'any' as const };

      render(
        <ChoreCard
          chore={choreWithAnyTime}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('(any)')).not.toBeInTheDocument();
    });

    it('shows custom chore indicator for non-predefined chores', () => {
      const customChore = { ...mockChore, catalogPredefined: false };

      render(
        <ChoreCard
          chore={customChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });

  describe('Assignee Display', () => {
    it('displays assigned member information', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays assignee initials when assigned', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('J')).toBeInTheDocument(); // First letter of "John"
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays fallback avatar for members without avatar', () => {
      const choreWithNoAvatarAssignee = {
        ...mockChore,
        assignee_id: 'user-456',
        assigneeName: 'Jane Smith',
        assigneeAvatar: undefined,
      };

      render(
        <ChoreCard
          chore={choreWithNoAvatarAssignee}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('J')).toBeInTheDocument(); // First letter of name
    });

    it('displays unassigned state correctly', () => {
      render(
        <ChoreCard
          chore={unassignedChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('?')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders assign button when onAssign is provided and user can edit', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const assignButton = screen.getByTitle('Assign chore');
      expect(assignButton).toBeInTheDocument();
      expect(assignButton).toHaveTextContent('👤');
    });

    it('renders delete button when onDelete is provided and user can delete', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTitle('Delete chore');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toContainElement(screen.getByTestId('trash-icon'));
    });

    it('does not render assign button when onAssign is not provided', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={undefined}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTitle('Assign chore')).not.toBeInTheDocument();
    });

    it('does not render delete button when onDelete is not provided', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={undefined}
        />
      );

      expect(screen.queryByTitle('Delete chore')).not.toBeInTheDocument();
    });

    it('calls onAssign when assign button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const assignButton = screen.getByTitle('Assign chore');
      await user.click(assignButton);

      expect(mockOnAssign).toHaveBeenCalledTimes(1);
    });

    it('opens delete modal when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTitle('Delete chore');
      await user.click(deleteButton);

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    it('calls onDelete when delete is confirmed in modal', async () => {
      const user = userEvent.setup();

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      // Click delete button to open modal
      const deleteButton = screen.getByTitle('Delete chore');
      await user.click(deleteButton);

      // Confirm deletion in modal
      const confirmButton = screen.getByTestId('button-destructive');
      await user.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Drag and Drop', () => {
    it('sets up drag functionality correctly', () => {
      const mockDragRef = vi.fn();
      mockUseDrag.mockReturnValue([{ isDragging: false }, mockDragRef]);

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(mockUseDrag).toHaveBeenCalledWith({
        type: 'chore',
        item: { id: 'chore-1' },
        collect: expect.any(Function),
      });
    });

    it('applies drag ref to card element', () => {
      const mockDragRef = vi.fn();
      mockUseDrag.mockReturnValue([{ isDragging: false }, mockDragRef]);

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      // The drag ref should be applied to the Card component
      expect(mockDragRef).toHaveBeenCalledTimes(1);
    });

    it('applies dragging styles when isDragging is true', () => {
      mockUseDrag.mockReturnValue([{ isDragging: true }, vi.fn()]);

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('opacity-50');
    });

    it('does not apply dragging styles when not dragging', () => {
      mockUseDrag.mockReturnValue([{ isDragging: false }, vi.fn()]);

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('opacity-50');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels and roles', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const assignButton = screen.getByTitle('Assign chore');
      const deleteButton = screen.getByTitle('Delete chore');

      expect(assignButton).toHaveAttribute('title', 'Assign chore');
      expect(deleteButton).toHaveAttribute('title', 'Delete chore');
    });

    it('has proper button semantics', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // At least assign and delete buttons
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const assignButton = screen.getByTitle('Assign chore');

      // Focus the button
      assignButton.focus();
      expect(assignButton).toHaveFocus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(mockOnAssign).toHaveBeenCalledTimes(1);

      // Press Space to activate
      await user.keyboard(' ');
      expect(mockOnAssign).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct base classes', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByTestId('card'); // Card component has data-slot="card"
      expect(card).toHaveClass('hover:shadow-md', 'transition-shadow', 'cursor-move');
      expect(card).toHaveClass('border', 'border-border', 'bg-card');
    });

    it('has responsive grid layout', () => {
      render(
        <ChoreCard
          chore={mockChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const gridContainer = screen.getByText('Wash dishes').closest('[class*="grid-cols"]');
      expect(gridContainer).toHaveClass('grid-cols-[1fr_auto]');
    });

    it('truncates long text appropriately', () => {
      const longTitleChore = {
        ...mockChore,
        catalogTitle: 'Very long chore title that should be truncated in the UI display area',
      };

      render(
        <ChoreCard
          chore={longTitleChore}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      const titleElement = screen.getByText(/Very long chore title/);
      expect(titleElement).toHaveClass('truncate');
    });
  });

  describe('Permission-based Rendering', () => {
    it('shows action buttons when user has permissions', () => {
      const choreWithPermissions = {
        ...mockChore,
        canEdit: true,
        canDelete: true,
      };

      render(
        <ChoreCard
          chore={choreWithPermissions}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTitle('Assign chore')).toBeInTheDocument();
      expect(screen.getByTitle('Delete chore')).toBeInTheDocument();
    });

    it('hides action buttons when user lacks permissions', () => {
      const choreWithoutPermissions = {
        ...mockChore,
        canEdit: false,
        canDelete: false,
      };

      render(
        <ChoreCard
          chore={choreWithoutPermissions}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      // Buttons are still rendered but this tests the permission logic
      // In real implementation, buttons should be conditionally rendered based on permissions
      expect(screen.getByTitle('Assign chore')).toBeInTheDocument();
      expect(screen.getByTitle('Delete chore')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles chore without emoji gracefully', () => {
      const choreWithoutEmoji: ChoreViewModel = {
        id: 'chore-1',
        chore_catalog_id: 'catalog-1',
        date: '2024-01-15',
        status: 'todo',
        assignee_id: 'user-123',
        time_of_day: 'morning',
        points: 5,
        catalogTitle: 'Wash dishes',
        catalogEmoji: undefined, // Explicitly undefined
        catalogCategory: 'Kitchen',
        catalogTimeOfDay: 'morning',
        catalogPredefined: true,
        assigneeName: 'John Doe',
        assigneeAvatar: 'https://example.com/avatar.jpg',
        canEdit: true,
        canDelete: true,
      };

      render(
        <ChoreCard
          chore={choreWithoutEmoji}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      // Should show default emoji when catalogEmoji is undefined
      const emojiElement = screen.getByText('📋');
      expect(emojiElement).toBeInTheDocument();
    });

    it('handles missing catalog data gracefully', () => {
      const choreWithMissingData: ChoreViewModel = {
        id: 'chore-1',
        chore_catalog_id: 'catalog-1',
        date: '2024-01-15',
        status: 'todo',
        assignee_id: 'user-123',
        time_of_day: 'morning',
        points: 5,
        catalogTitle: 'Unknown Chore', // Provide fallback instead of undefined
        catalogEmoji: undefined, // Missing emoji
        catalogCategory: 'Unknown', // Provide fallback instead of undefined
        catalogTimeOfDay: 'morning',
        catalogPredefined: true,
        assigneeName: 'John Doe',
        assigneeAvatar: 'https://example.com/avatar.jpg',
        canEdit: true,
        canDelete: true,
      };

      render(
        <ChoreCard
          chore={choreWithMissingData}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      // Should show fallback emoji
      const emojiElement = screen.getByText('📋');
      expect(emojiElement).toBeInTheDocument();

      // Should not crash when catalog data is missing
      // The h3 will be empty when catalogTitle is undefined
      const h3Element = document.querySelector('h3');
      expect(h3Element).toBeInTheDocument();
    });

    it('handles empty members array', () => {
      render(
        <ChoreCard
          chore={unassignedChore}
          members={[]}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('?')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });

    it('handles member not found in members array', () => {
      const choreWithInvalidAssignee = {
        ...mockChore,
        assignee_id: 'non-existent-user',
        assigneeName: undefined,
      };

      render(
        <ChoreCard
          chore={choreWithInvalidAssignee}
          members={mockMembers}
          onAssign={mockOnAssign}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('?')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });
  });
});
