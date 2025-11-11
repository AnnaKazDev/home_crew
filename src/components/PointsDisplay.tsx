import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PointsDisplayProps {
  points: number;
  pointsDateRange?: { firstDate: string | null; lastDate: string | null } | null;
}

const PointsDisplay: React.FC<PointsDisplayProps> = React.memo(({ points, pointsDateRange }) => {
  // Format date range for display
  const dateRangeText =
    pointsDateRange && pointsDateRange.firstDate && pointsDateRange.lastDate
      ? (() => {
          const firstDate = new Date(pointsDateRange.firstDate!);
          const lastDate = new Date(pointsDateRange.lastDate!);
          const firstFormatted = firstDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const lastFormatted = lastDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          return `${firstFormatted} - ${lastFormatted}`;
        })()
      : null;

  return (
    <div className="mt-8 bg-card rounded-lg border p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Points earned between: <span className="text-lg">{dateRangeText}</span>
      </h2>
      <Badge variant="secondary" className="text-lg dark:text-black">
        <span className="text-3xl align-middle">⭐</span> {points} points
      </Badge>
    </div>
  );
});

PointsDisplay.displayName = 'PointsDisplay';

export default PointsDisplay;
