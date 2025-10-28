import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateNavigatorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const handlePrevDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevDay}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white border-gray-300 dark:border-gray-600"
        >
          ⬅️ Previous
        </Button>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {formatDate(currentDate)}
          </div>
          <Input
            type="date"
            value={currentDate}
            onChange={handleDateChange}
            className="w-auto text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
        </div>

        <Button
          variant="outline"
          onClick={handleNextDay}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white border-gray-300 dark:border-gray-600"
        >
          Next ➡️
        </Button>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevDay}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white border-gray-300 dark:border-gray-600"
        >
          ⬅️
        </Button>

        <Input
          type="date"
          value={currentDate}
          onChange={handleDateChange}
          className="w-auto px-4 py-2 cursor-pointer text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
        />

        <Button
          variant="outline"
          onClick={handleNextDay}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white border-gray-300 dark:border-gray-600"
        >
          ➡️
        </Button>
      </div>
    </div>
  );
}