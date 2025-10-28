import React from 'react';
import { PointsBadge } from './PointsBadge';
import { DateNavigator } from './DateNavigator';
import { AddChoreButton } from './AddChoreButton';

export function DailyViewHeader({
  currentDate,
  totalPoints,
  choresCount,
  onDateChange,
  onAddChoreClick,
}: {
  currentDate: string;
  totalPoints: number;
  choresCount: number;
  onDateChange: (date: string) => void;
  onAddChoreClick: () => void;
}) {
  const isLimitReached = choresCount >= 50;

  return (
    <div className="flex items-center justify-between">
      {/* Left side: Points badge */}
      <PointsBadge totalPoints={totalPoints} />

      {/* Center: Date navigator */}
      <DateNavigator
        currentDate={currentDate}
        onDateChange={onDateChange}
      />

      {/* Right side: Add chore button */}
      <div className="flex items-center space-x-2">
        {isLimitReached && (
          <span className="text-sm text-gray-500">
            Daily limit reached ({choresCount}/50)
          </span>
        )}
        <AddChoreButton
          onClick={onAddChoreClick}
          disabled={isLimitReached}
        />
      </div>
    </div>
  );
}
