import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PointsBadgeProps {
  totalPoints: number;
}

export function PointsBadge({ totalPoints }: PointsBadgeProps) {
  return (
    <Badge variant="secondary" className="text-lg p-4 text-white dark:text-black">
      ⭐ {totalPoints} points earned today
    </Badge>
  );
}
