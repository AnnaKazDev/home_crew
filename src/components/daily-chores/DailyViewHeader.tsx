import React from 'react';
import { PointsBadge } from './PointsBadge';
import { DateNavigator } from './DateNavigator';
import { useTheme } from '@/components/ThemeProvider';

interface DailyViewHeaderProps {
  currentDate: string;
  totalPoints: number;
  choresCount: number;
  onDateChange: (date: string) => void;
}

export function DailyViewHeader({
  currentDate,
  totalPoints,
  choresCount,
  onDateChange,
}: DailyViewHeaderProps) {
  const { theme } = useTheme();
  const isLimitReached = choresCount >= 50;

  return (
    <div className="space-y-6">
      {/* Welcome image - hidden on lg+ screens (shown in sidebar) */}
      <div className="flex justify-center lg:hidden">
        <img
          src="/nice_to_see_you.png"
          alt="Nice to see you"
          className="h-40 md:h-60 w-auto object-contain"
        />
      </div>

      {/* Points badge - hidden on lg+ screens (shown in sidebar) */}
      <div className="flex justify-center lg:hidden">
        <PointsBadge totalPoints={totalPoints} />
      </div>

      {/* Date navigator - full width like columns */}
      <div className="w-full">
        <DateNavigator currentDate={currentDate} onDateChange={onDateChange} />
      </div>
    </div>
  );
}
