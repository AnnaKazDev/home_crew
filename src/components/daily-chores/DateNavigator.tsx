import React from 'react';
import type { DateNavigatorProps } from '@/types/daily-view.types';

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const handlePrevDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    const newDate = date.toISOString().split('T')[0];
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    onDateChange(newDate);
  };

  const handleDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    if (newDate) {
      onDateChange(newDate);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return currentDate === today;
  };

  const isPastDate = () => {
    const today = new Date().toISOString().split('T')[0];
    return currentDate < today;
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Previous day button */}
      <button
        onClick={handlePrevDay}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous day"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Date display and picker */}
      <div className="flex flex-col items-center">
        <div className="text-lg font-semibold text-gray-900">
          {formatDisplayDate(currentDate)}
        </div>
        <input
          type="date"
          value={currentDate}
          onChange={handleDateInputChange}
          className="text-sm text-gray-500 bg-transparent border-none outline-none cursor-pointer hover:text-gray-700"
          aria-label="Select date"
        />
      </div>

      {/* Next day button */}
      <button
        onClick={handleNextDay}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Next day"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

