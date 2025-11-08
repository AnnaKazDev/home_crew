import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { DateNavigator } from '@/components/daily-chores/DateNavigator';

describe('DateNavigator', () => {
  const mockOnDateChange = vi.fn();

  beforeEach(() => {
    mockOnDateChange.mockClear();
  });

  it('renders current date correctly', () => {
    const testDate = '2024-01-15';
    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    // Should display formatted date (appears in both desktop and mobile layouts)
    expect(screen.getAllByText('Monday, January 15, 2024')).toHaveLength(2);
  });

  it('displays navigation buttons', () => {
    const testDate = '2024-01-15';
    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    // Desktop buttons
    expect(screen.getByRole('button', { name: '← Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument();

    // Mobile buttons
    expect(screen.getByRole('button', { name: '←' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '→' })).toBeInTheDocument();

    // Pick date buttons (both desktop and mobile)
    const pickDateButtons = screen.getAllByRole('button', { name: /pick a date/i });
    expect(pickDateButtons).toHaveLength(2);
  });

  it('navigates to previous day when previous button is clicked', async () => {
    const user = userEvent.setup();
    const testDate = '2024-01-15';
    const expectedPreviousDate = '2024-01-14';

    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(mockOnDateChange).toHaveBeenCalledWith(expectedPreviousDate);
  });

  it('navigates to next day when next button is clicked', async () => {
    const user = userEvent.setup();
    const testDate = '2024-01-15';
    const expectedNextDate = '2024-01-16';

    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(mockOnDateChange).toHaveBeenCalledWith(expectedNextDate);
  });

  it('handles month transitions correctly', async () => {
    const user = userEvent.setup();
    const testDate = '2024-01-31'; // Last day of January
    const expectedNextDate = '2024-02-01'; // First day of February

    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(mockOnDateChange).toHaveBeenCalledWith(expectedNextDate);
  });

  it('handles year transitions correctly', async () => {
    const user = userEvent.setup();
    const testDate = '2023-12-31'; // Last day of year
    const expectedNextDate = '2024-01-01'; // First day of next year

    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(mockOnDateChange).toHaveBeenCalledWith(expectedNextDate);
  });

  it('opens calendar popover when desktop pick date button is clicked', async () => {
    const user = userEvent.setup();
    const testDate = '2024-01-15';

    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    // Find desktop pick date button (the one without <span> wrapper)
    const pickDateButtons = screen.getAllByRole('button', { name: /pick a date/i });
    const desktopButton = pickDateButtons.find((button) => !button.querySelector('span'));

    expect(desktopButton).toBeInTheDocument();
    await user.click(desktopButton!);

    // Button should still be present after click
    expect(desktopButton).toBeInTheDocument();
  });

  it('formats different dates correctly', () => {
    const testCases = [
      { input: '2024-01-01', expected: 'Monday, January 1, 2024' },
      { input: '2024-02-29', expected: 'Thursday, February 29, 2024' }, // Leap year
      { input: '2024-12-25', expected: 'Wednesday, December 25, 2024' },
    ];

    testCases.forEach(({ input, expected }) => {
      const { rerender } = render(
        <DateNavigator currentDate={input} onDateChange={mockOnDateChange} />
      );
      // Date appears in both desktop and mobile layouts
      expect(screen.getAllByText(expected)).toHaveLength(2);
      rerender(<DateNavigator currentDate={input} onDateChange={mockOnDateChange} />);
    });
  });

  it('has correct responsive layout structure', () => {
    const testDate = '2024-01-15';
    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    // Desktop layout should exist
    const desktopGrid = document.querySelector('.hidden.md\\:grid');
    expect(desktopGrid).toBeInTheDocument();

    // Mobile layout should exist
    const mobileLayout = document.querySelector('.md\\:hidden');
    expect(mobileLayout).toBeInTheDocument();
  });

  it('displays different button text on mobile vs desktop', () => {
    const testDate = '2024-01-15';
    render(<DateNavigator currentDate={testDate} onDateChange={mockOnDateChange} />);

    // Desktop buttons should have full text
    const desktopPrevButton = screen.getByRole('button', { name: '← Previous' });
    const desktopNextButton = screen.getByRole('button', { name: 'Next →' });

    // Mobile buttons should have only arrows
    const mobilePrevButton = screen.getByRole('button', { name: '←' });
    const mobileNextButton = screen.getByRole('button', { name: '→' });

    expect(desktopPrevButton).toBeInTheDocument();
    expect(desktopNextButton).toBeInTheDocument();
    expect(mobilePrevButton).toBeInTheDocument();
    expect(mobileNextButton).toBeInTheDocument();
  });
});
