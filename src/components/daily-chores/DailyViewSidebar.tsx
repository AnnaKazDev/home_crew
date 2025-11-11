import React from 'react';
import { PointsBadge } from './PointsBadge';

interface DailyViewSidebarProps {
  totalPoints: number;
}

export function DailyViewSidebar({ totalPoints }: DailyViewSidebarProps) {
  return (
    <div className="hidden lg:flex lg:flex-col lg:items-center lg:space-y-6 lg:max-w-xs">
      {/* Welcome image */}
      <div className="flex justify-center">
        <img
          src="/nice_to_see_you.png"
          alt="Nice to see you"
          className="h-60 w-auto object-contain"
        />
      </div>

      {/* Points badge */}
      <div className="flex justify-center">
        <PointsBadge totalPoints={totalPoints} />
      </div>
    </div>
  );
}
