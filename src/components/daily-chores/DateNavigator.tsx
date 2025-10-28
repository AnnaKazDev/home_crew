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
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevDay}
          className="text-gray-600 hover:text-gray-800"
        >
          ⬅️ Previous
        </Button>

        <div className="text-center">
          <div className="text-lg font-semibold mb-2">
            {formatDate(currentDate)}
          </div>
          <Input
            type="date"
            value={currentDate}
            onChange={handleDateChange}
            className="w-auto"
          />
        </div>

        <Button
          variant="outline"
          onClick={handleNextDay}
          className="text-gray-600 hover:text-gray-800"
        >
          Next ➡️
        </Button>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevDay}
          className="text-gray-600 hover:text-gray-800"
        >
          ⬅️
        </Button>

        <Input
          type="date"
          value={currentDate}
          onChange={handleDateChange}
          className="w-auto px-4 py-2 cursor-pointer"
        />

        <Button
          variant="outline"
          onClick={handleNextDay}
          className="text-gray-600 hover:text-gray-800"
        >
          ➡️
        </Button>
      </div>
    </div>
  );
}