import React from 'react';
import { PointsBadge } from './PointsBadge';
import { DateNavigator } from './DateNavigator';
import { AddChoreButton } from './AddChoreButton';

interface DailyViewHeaderProps {
  currentDate: string;
  totalPoints: number;
  choresCount: number;
  onDateChange: (date: string) => void;
  onAddChoreClick: () => void;
  canAddChores?: boolean;
}

export function DailyViewHeader({
  currentDate,
  totalPoints,
  choresCount,
  onDateChange,
  onAddChoreClick,
  canAddChores = true,
}: DailyViewHeaderProps) {
  const isLimitReached = choresCount >= 50;

  return (
    <div className="space-y-6">
      {/* Points badge */}
      <div className="flex justify-center">
        <PointsBadge totalPoints={totalPoints} />
      </div>

      {/* Date navigator and add button */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <DateNavigator
            currentDate={currentDate}
            onDateChange={onDateChange}
          />
        </div>

        <div className="flex items-center space-x-4 ml-6">
          {isLimitReached && (
            <span className="text-sm text-gray-500">
              Daily limit reached ({choresCount}/50)
            </span>
          )}
          <AddChoreButton
            onClick={onAddChoreClick}
            disabled={isLimitReached || !canAddChores}
          />
        </div>
      </div>
    </div>
  );
}