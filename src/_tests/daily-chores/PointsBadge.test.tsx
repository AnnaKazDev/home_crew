import { render, screen } from '@/test/test-utils';
import { describe, it, expect } from 'vitest';
import { PointsBadge } from '@/components/daily-chores/PointsBadge';

describe('PointsBadge', () => {
  it('renders points correctly', () => {
    render(<PointsBadge totalPoints={25} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('⭐ 25 points earned today');
  });

  it('renders zero points', () => {
    render(<PointsBadge totalPoints={0} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('⭐ 0 points earned today');
  });

  it('renders typical chore completion points', () => {
    render(<PointsBadge totalPoints={15} />); // 3 chores × 5 points each

    const badge = screen.getByTestId('points-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('⭐ 15 points earned today');
  });

  it('renders multiple chores points', () => {
    render(<PointsBadge totalPoints={25} />); // 5 chores × 5 points each

    const badge = screen.getByTestId('points-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('⭐ 25 points earned today');
  });

  it('has correct accessibility attributes', () => {
    render(<PointsBadge totalPoints={42} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('renders as a span element', () => {
    render(<PointsBadge totalPoints={15} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge.tagName).toBe('SPAN');
  });

  it('has correct CSS classes', () => {
    render(<PointsBadge totalPoints={30} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge).toHaveClass('text-lg', 'p-4', 'text-white', 'dark:text-black');
  });

  it('contains star emoji', () => {
    render(<PointsBadge totalPoints={7} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge.textContent).toContain('⭐');
  });

  it('includes "points earned today" text', () => {
    render(<PointsBadge totalPoints={88} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge.textContent).toContain('points earned today');
  });

  it('renders with TypeScript strict typing', () => {
    // Test that component works with proper TypeScript usage
    const points = 10;
    render(<PointsBadge totalPoints={points} />);

    const badge = screen.getByTestId('points-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('⭐ 10 points earned today');
  });
});
