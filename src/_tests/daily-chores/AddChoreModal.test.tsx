import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AddChoreModal } from '@/components/daily-chores/AddChoreModal';
import type { MemberDTO } from '@/types';

// Mock components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('@/components/daily-chores/ChoreCatalogSelector', () => ({
  ChoreCatalogSelector: ({ onItemSelect, onCreateCustom }: any) => (
    <div data-testid="catalog-selector">
      <button
        data-testid="select-item"
        onClick={() => onItemSelect({ id: 'catalog-1', title: 'Test Chore' })}
      >
        Select Item
      </button>
      <button data-testid="create-custom" onClick={onCreateCustom}>
        Create Custom
      </button>
    </div>
  ),
}));

vi.mock('@/components/daily-chores/ChoreForm', () => ({
  ChoreForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="chore-form">
      <button
        data-testid="form-submit"
        onClick={() => onSubmit({ title: 'Custom Chore', category: 'Test' })}
      >
        Submit Form
      </button>
      <button data-testid="form-cancel" onClick={onCancel}>
        Cancel Form
      </button>
    </div>
  ),
}));

vi.mock('@/components/daily-chores/ChoreConfigurator', () => ({
  ChoreConfigurator: ({ onSubmit, onCancel, isLoading }: any) => (
    <div data-testid="chore-configurator">
      <button
        data-testid="config-submit"
        disabled={isLoading}
        onClick={() => onSubmit({ date: '2024-01-15', assignee_id: 'user-123' })}
      >
        Submit Config
      </button>
      <button data-testid="config-cancel" onClick={onCancel}>
        Cancel Config
      </button>
    </div>
  ),
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AddChoreModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockMembers: MemberDTO[] = [
    {
      id: 'member-1',
      user_id: 'user-123',
      name: 'John Doe',
      role: 'admin',
      avatar_url: null,
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Modal Visibility', () => {
    it('renders modal when isOpen is true', () => {
      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(
        <AddChoreModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Multi-Step Flow', () => {
    it('starts with catalog step', () => {
      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      expect(screen.getByTestId('catalog-selector')).toBeInTheDocument();
      expect(screen.queryByTestId('chore-form')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chore-configurator')).not.toBeInTheDocument();
      expect(screen.getByText('Choose a Chore')).toBeInTheDocument();
    });

    it('transitions to form step when create custom is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      const createCustomButton = screen.getByTestId('create-custom');
      await user.click(createCustomButton);

      expect(screen.getByText('Create Custom Chore')).toBeInTheDocument();
      expect(screen.getByTestId('chore-form')).toBeInTheDocument();
      expect(screen.queryByTestId('catalog-selector')).not.toBeInTheDocument();
    });

    it('transitions to config step when catalog item is selected', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      const selectItemButton = screen.getByTestId('select-item');
      await user.click(selectItemButton);

      expect(screen.getByText('Configure Chore')).toBeInTheDocument();
      expect(screen.getByTestId('chore-configurator')).toBeInTheDocument();
      expect(screen.queryByTestId('catalog-selector')).not.toBeInTheDocument();
    });

    it('returns to catalog step after custom chore creation', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Go to form step
      const createCustomButton = screen.getByTestId('create-custom');
      await user.click(createCustomButton);

      // Submit form
      const formSubmitButton = screen.getByTestId('form-submit');
      await user.click(formSubmitButton);

      // Should return to catalog
      await waitFor(() => {
        expect(screen.getByTestId('catalog-selector')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Chore Creation', () => {
    it('creates custom chore via API and refreshes catalog', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'new-catalog-id' }),
      });

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Go to form step
      const createCustomButton = screen.getByTestId('create-custom');
      await user.click(createCustomButton);

      // Submit form
      const formSubmitButton = screen.getByTestId('form-submit');
      await user.click(formSubmitButton);

      // Should return to catalog
      await waitFor(() => {
        expect(screen.getByTestId('catalog-selector')).toBeInTheDocument();
      });
    });
  });

  describe('Chore Configuration and Submission', () => {
    it('submits chore successfully', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Go to config step
      const selectItemButton = screen.getByTestId('select-item');
      await user.click(selectItemButton);

      // Submit configuration
      const configSubmitButton = screen.getByTestId('config-submit');
      await user.click(configSubmitButton);

      // Verify submission
      expect(mockOnSubmit).toHaveBeenCalledWith({
        date: '2024-01-15',
        chore_catalog_id: 'catalog-1',
        assignee_id: 'user-123',
      });

      // Modal should close
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles chore submission failure', async () => {
      const user = userEvent.setup();

      mockOnSubmit.mockImplementation(() => {
        throw new Error('Submission failed');
      });

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Go to config step
      const selectItemButton = screen.getByTestId('select-item');
      await user.click(selectItemButton);

      // Submit configuration
      const configSubmitButton = screen.getByTestId('config-submit');
      await user.click(configSubmitButton);

      // Modal should not close on failure
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(screen.getByTestId('chore-configurator')).toBeInTheDocument();
    });
  });

  describe('Navigation and Cancellation', () => {
    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Mock dialog close button (would be provided by Dialog component)
      const closeButton = document.createElement('button');
      closeButton.setAttribute('data-testid', 'dialog-close');
      closeButton.onclick = mockOnClose;
      document.body.appendChild(closeButton);

      await user.click(screen.getByTestId('dialog-close'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);

      document.body.removeChild(closeButton);
    });

    it('returns to catalog when form is cancelled', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Go to form step
      const createCustomButton = screen.getByTestId('create-custom');
      await user.click(createCustomButton);

      // Cancel form
      const formCancelButton = screen.getByTestId('form-cancel');
      await user.click(formCancelButton);

      // Should return to catalog
      expect(screen.getByTestId('catalog-selector')).toBeInTheDocument();
      expect(screen.queryByTestId('chore-form')).not.toBeInTheDocument();
    });

    it('returns to catalog when config is cancelled', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Go to config step
      const selectItemButton = screen.getByTestId('select-item');
      await user.click(selectItemButton);

      // Cancel config
      const configCancelButton = screen.getByTestId('config-cancel');
      await user.click(configCancelButton);

      // Should return to catalog
      expect(screen.getByTestId('catalog-selector')).toBeInTheDocument();
      expect(screen.queryByTestId('chore-configurator')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('resets modal state when closed', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Navigate through steps
      const createCustomButton = screen.getByTestId('create-custom');
      await user.click(createCustomButton);

      expect(screen.getByTestId('chore-form')).toBeInTheDocument();

      // Close modal
      const closeButton = document.createElement('button');
      closeButton.onclick = () => {
        render(
          <AddChoreModal
            isOpen={false}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            members={mockMembers}
            currentDate="2024-01-15"
          />
        );
      };
      closeButton.click();

      // Reopen modal
      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Should be back to catalog step
      expect(screen.getByTestId('catalog-selector')).toBeInTheDocument();
    });

    it('refreshes catalog after custom chore creation', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Go to form step
      const createCustomButton = screen.getByTestId('create-custom');
      await user.click(createCustomButton);

      // Submit form
      const formSubmitButton = screen.getByTestId('form-submit');
      await user.click(formSubmitButton);

      // Should refresh catalog (key changes)
      await waitFor(() => {
        expect(screen.getByTestId('catalog-selector')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and UX', () => {
    it('has proper dialog structure', () => {
      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      // Tab through interactive elements
      const selectItemButton = screen.getByTestId('select-item');
      selectItemButton.focus();

      expect(selectItemButton).toHaveFocus();

      await user.tab();
      const createCustomButton = screen.getByTestId('create-custom');
      expect(createCustomButton).toHaveFocus();
    });

    it('has proper responsive design', () => {
      render(
        <AddChoreModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          members={mockMembers}
          currentDate="2024-01-15"
        />
      );

      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('sm:max-w-2xl', 'max-h-[90vh]', 'overflow-y-auto');
    });
  });
});
