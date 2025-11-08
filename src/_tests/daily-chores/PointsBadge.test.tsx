import { render, screen } from '@/test/test-utils';
import { describe, it, expect } from 'vitest';
import { PointsBadge } from '@/components/daily-chores/PointsBadge';

describe('PointsBadge', () => {
  it('renders points correctly', () => {
    render(<PointsBadge totalPoints={25} />);

    expect(screen.getByText('⭐ 25 points earned today')).toBeInTheDocument();
  });

  it('renders zero points', () => {
    render(<PointsBadge totalPoints={0} />);

    expect(screen.getByText('⭐ 0 points earned today')).toBeInTheDocument();
  });

  it('renders typical chore completion points', () => {
    render(<PointsBadge totalPoints={15} />); // 3 chores × 5 points each

    expect(screen.getByText('⭐ 15 points earned today')).toBeInTheDocument();
  });

  it('renders multiple chores points', () => {
    render(<PointsBadge totalPoints={25} />); // 5 chores × 5 points each

    expect(screen.getByText('⭐ 25 points earned today')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<PointsBadge totalPoints={42} />);

    const badge = screen.getByText('⭐ 42 points earned today');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('renders as a span element', () => {
    render(<PointsBadge totalPoints={15} />);

    const badge = screen.getByText('⭐ 15 points earned today');
    expect(badge.tagName).toBe('SPAN');
  });

  it('has correct CSS classes', () => {
    render(<PointsBadge totalPoints={30} />);

    const badge = screen.getByText('⭐ 30 points earned today');
    expect(badge).toHaveClass('text-lg', 'px-4', 'py-2', 'text-white', 'dark:text-black');
  });

  it('contains star emoji', () => {
    render(<PointsBadge totalPoints={7} />);

    const badge = screen.getByText('⭐ 7 points earned today');
    expect(badge.textContent).toContain('⭐');
  });

  it('includes "points earned today" text', () => {
    render(<PointsBadge totalPoints={88} />);

    const badge = screen.getByText('⭐ 88 points earned today');
    expect(badge.textContent).toContain('points earned today');
  });

  it('renders with TypeScript strict typing', () => {
    // Test that component works with proper TypeScript usage
    const points = 10;
    render(<PointsBadge totalPoints={points} />);

    expect(screen.getByText('⭐ 10 points earned today')).toBeInTheDocument();
  });
});
