import React from 'react';
import { PointsBadge } from './PointsBadge';
import { DateNavigator } from './DateNavigator';

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
  const isLimitReached = choresCount >= 50;

  return (
    <div className="space-y-6">
      {/* Points badge */}
      <div className="flex justify-center">
        <PointsBadge totalPoints={totalPoints} />
      </div>

      {/* Date navigator - full width like columns */}
      <div className="w-full">
        <DateNavigator
          currentDate={currentDate}
          onDateChange={onDateChange}
        />
      </div>
    </div>
  );
}