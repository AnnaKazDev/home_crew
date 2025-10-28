import React from 'react';
import { Badge } from "@/components/ui/badge";

interface PointsBadgeProps {
  totalPoints: number;
}

export function PointsBadge({ totalPoints }: PointsBadgeProps) {
  return (
    <Badge variant="secondary" className="text-lg px-4 py-2 bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700">
      ⭐ {totalPoints} points earned today
    </Badge>
  );
}