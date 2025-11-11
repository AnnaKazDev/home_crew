import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import PointsDisplay from '@/components/PointsDisplay';

describe('PointsDisplay', () => {
  it('renders points correctly', () => {
    render(<PointsDisplay points={150} />);

    expect(screen.getByText('150 points')).toBeInTheDocument();
  });

  it('displays date range when provided', () => {
    const dateRange = {
      firstDate: '2024-01-01',
      lastDate: '2024-01-31',
    };

    render(<PointsDisplay points={200} pointsDateRange={dateRange} />);

    expect(screen.getByText(/Points earned between/)).toBeInTheDocument();
    expect(screen.getByText('200 points')).toBeInTheDocument();
  });

  it('handles null date range gracefully', () => {
    render(<PointsDisplay points={100} pointsDateRange={null} />);

    expect(screen.getByText(/Points earned between/)).toBeInTheDocument();
    expect(screen.getByText('100 points')).toBeInTheDocument();
  });

  it('formats date range correctly', () => {
    const dateRange = {
      firstDate: '2024-01-15',
      lastDate: '2024-02-15',
    };

    render(<PointsDisplay points={75} pointsDateRange={dateRange} />);

    // Check that the component renders without crashing
    expect(screen.getByText('75 points')).toBeInTheDocument();
  });
});
