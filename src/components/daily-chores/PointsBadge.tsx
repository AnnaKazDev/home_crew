import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PointsBadgeProps {
  totalPoints: number;
}

export function PointsBadge({ totalPoints }: PointsBadgeProps) {
  return (
    <Badge variant="secondary" className="text-lg px-4 py-2 text-black">
      ⭐ {totalPoints} points earned today
    </Badge>
  );
}
