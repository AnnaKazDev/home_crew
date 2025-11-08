import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChoreConfigurator } from '@/components/daily-chores/ChoreConfigurator';
import type { CatalogItemDTO } from '@/types';
import type { MemberDTO } from '@/types';

// Mock components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid={`badge-${variant || 'default'}`}>{children}</span>
  ),
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ selected, onSelect, mode }: any) => (
    <div data-testid="calendar">
      <div data-testid="calendar-day" onClick={() => onSelect?.(new Date('2024-01-20'))}>
        Select Day
      </div>
    </div>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open }: any) => (
    <div data-testid="popover">
      {children}
      {open && <div data-testid="popover-open" />}
    </div>
  ),
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  CalendarIcon: () => <span data-testid="calendar-icon">📅</span>,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('ChoreConfigurator', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockMembers: MemberDTO[] = [
    {
      id: 'member-1',
      user_id: 'user-123',
      name: 'John Doe',
      role: 'admin',
      avatar_url: 'https://example.com/avatar1.jpg',
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

  const mockSelectedItem: CatalogItemDTO = {
    id: 'catalog-1',
    title: 'Wash dishes',
    emoji: '🍽️',
    category: 'Kitchen',
    time_of_day: 'morning',
    points: 5,
    predefined: true,
    created_by_user_id: 'user-123',
    created_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Preview Section', () => {
    it('renders chore preview correctly', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('🍽️')).toBeInTheDocument();
      expect(screen.getByText('Wash dishes')).toBeInTheDocument();
      expect(screen.getByTestId('badge-secondary')).toHaveTextContent('Kitchen');
      expect(screen.getByTestId('badge-outline')).toHaveTextContent('5 pts');
    });

    it('shows time of day when not "any"', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('(morning)')).toBeInTheDocument();
    });

    it('does not show time of day when "any"', () => {
      const itemWithAnyTime = { ...mockSelectedItem, time_of_day: 'any' as const };

      render(
        <ChoreConfigurator
          selectedItem={itemWithAnyTime}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.queryByText('(any)')).not.toBeInTheDocument();
    });

    it('shows custom indicator for non-predefined items', () => {
      const customItem = { ...mockSelectedItem, predefined: false };

      render(
        <ChoreConfigurator
          selectedItem={customItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('uses customData when provided', () => {
      const customData = {
        title: 'Custom Chore',
        emoji: '🚀',
        category: 'Custom',
        points: 10,
      };

      render(
        <ChoreConfigurator
          selectedItem={null}
          customData={customData}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('🚀')).toBeInTheDocument();
      expect(screen.getByText('Custom Chore')).toBeInTheDocument();
      expect(screen.getByTestId('badge-secondary')).toHaveTextContent('Custom');
      expect(screen.getByTestId('badge-outline')).toHaveTextContent('10 pts');
    });

    it('handles missing emoji gracefully', () => {
      const itemWithoutEmoji = { ...mockSelectedItem, emoji: undefined };

      render(
        <ChoreConfigurator
          selectedItem={itemWithoutEmoji}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('📋')).toBeInTheDocument(); // Default emoji
    });
  });

  describe('Date Selection', () => {
    it('initializes with current date', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
    });

    it('opens calendar popover when date button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const dateButton = screen.getByText('Monday, January 15, 2024');
      await user.click(dateButton);

      expect(screen.getByTestId('popover')).toBeInTheDocument();
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });

    it('updates date when calendar day is selected', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Open calendar
      const dateButton = screen.getByText('Monday, January 15, 2024');
      await user.click(dateButton);

      // Select day
      const calendarDay = screen.getByTestId('calendar-day');
      await user.click(calendarDay);

      // Date should update
      expect(screen.getByText('Saturday, January 20, 2024')).toBeInTheDocument();
    });

    it('validates date selection', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Try to submit without date (simulate clearing date)
      rerender(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate=""
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const submitButton = screen.getByText('Add Chore');
      await user.click(submitButton);

      // Should not submit due to validation error
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Assignee Selection', () => {
    it('renders all members as options', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });

    it('initializes with no assignee selected', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const unassignedRadio = screen.getByDisplayValue('');
      expect(unassignedRadio).toBeChecked();
    });

    it('allows selecting a member', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const johnRadio = screen.getByDisplayValue('user-123');
      await user.click(johnRadio);

      expect(johnRadio).toBeChecked();
    });

    it('shows member avatars when available', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const johnAvatar = screen.getByAltText('John Doe');
      expect(johnAvatar).toBeInTheDocument();
      expect(johnAvatar).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
    });

    it('shows fallback avatar for members without avatar', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('J')).toBeInTheDocument(); // Jane's initial
    });

    it('shows member roles', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits with correct data when all fields are valid', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Select assignee
     const johnRadio = screen.getByRole('radio', { name: /John Doe/ });
      await user.click(johnRadio);

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Chore/ });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        date: '2024-01-15',
        assignee_id: 'user-123',
      });
    });

    it('submits with null assignee when unassigned is selected', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Ensure unassigned is selected (default)
      const unassignedRadio = screen.getByRole('radio', { name: /Unassigned/ });
      expect(unassignedRadio).toBeChecked();

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Chore/ });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        date: '2024-01-15',
        assignee_id: null,
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Submit
      const submitButton = screen.getByText('Add Chore');
      await user.click(submitButton);

      // Simulate parent component setting loading state
      rerender(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      // Should show loading
      expect(screen.getByText('Adding...')).toBeInTheDocument();

      // Submit button should be disabled during loading
      const submitButtonDuringLoading = screen.getByRole('button', { name: /Adding\.\.\./ });
      expect(submitButtonDuringLoading).toBeDisabled();

      // Back button should also be disabled
      const backButton = screen.getByText('Back');
      expect(backButton).toBeDisabled();

      // Simulate completion
      rerender(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Loading state should be cleared
      expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
      expect(screen.getByText('Add Chore')).toBeInTheDocument();
    });

    it('prevents submission when loading', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Adding\.\.\./ });
      expect(submitButton).toBeDisabled();
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();

      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Chore/ });
      await user.click(submitButton);

      // Should handle error without crashing
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('calls onCancel when back button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const backButton = screen.getByText('Back');
      await user.click(backButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('back button is disabled during loading', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      const backButton = screen.getByText('Back');
      expect(backButton).toBeDisabled();
    });
  });

  describe('State Management', () => {
    it('resets assignee selection when component re-mounts', () => {
      const { rerender } = render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Unassigned should be selected by default
      const unassignedRadio = screen.getByDisplayValue('');
      expect(unassignedRadio).toBeChecked();

      // Re-mount should reset state
      rerender(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Should still be unassigned
      expect(screen.getByDisplayValue('')).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Should have proper labels and form structure
      expect(screen.getByText('Date *')).toBeInTheDocument();
      expect(screen.getByText('Assign to')).toBeInTheDocument();

      // Radio buttons should be properly grouped
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(1);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Tab through elements
      await user.tab(); // Date button
      await user.tab(); // First radio button (unassigned is checked by default)

      const unassignedRadio = screen.getByTestId('assignee-option-unassigned');
      expect(unassignedRadio).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty members array', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={[]}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Should still show unassigned option
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('handles null selectedItem and customData', () => {
      render(
        <ChoreConfigurator
          selectedItem={null}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Should show fallback values
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('Custom Chore')).toBeInTheDocument();
      expect(screen.getByText('No category')).toBeInTheDocument();
      expect(screen.getByText('0 pts')).toBeInTheDocument();
    });

    it('handles invalid date strings', () => {
      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="invalid-date"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Should handle gracefully and show "Invalid Date"
      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('maintains form state during interactions', async () => {
      const user = userEvent.setup();

      render(
        <ChoreConfigurator
          selectedItem={mockSelectedItem}
          customData={null}
          members={mockMembers}
          currentDate="2024-01-15"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      // Select assignee
      const johnRadio = screen.getByDisplayValue('user-123');
      await user.click(johnRadio);

      // Change date
      const dateButton = screen.getByText('Monday, January 15, 2024');
      await user.click(dateButton);

      const calendarDay = screen.getByTestId('calendar-day');
      await user.click(calendarDay);

      // State should be maintained
      expect(screen.getByDisplayValue('user-123')).toBeChecked();
      expect(screen.getByText('Saturday, January 20, 2024')).toBeInTheDocument();
    });
  });
});
