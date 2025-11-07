import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 bg-card rounded-lg shadow mb-4">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        <div className="flex justify-start">
          <Button onClick={handlePrevDay} className="">
            ← Previous
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <div className="hidden md:block text-lg font-semibold text-foreground mb-2">
            {formatDate(currentDate)}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                data-test-id="date-navigator-pick-date"
                className="flex items-center justify-center space-x-2 bg-accent text-black border-accent hover:bg-accent/80"
              >
                Pick a date
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2 z-[100] bg-background border border-border rounded-md shadow-lg"
              align="center"
              side="bottom"
            >
              <Calendar
                mode="single"
                selected={new Date(currentDate)}
                onSelect={handleDateSelect}
                initialFocus
                className="rounded-md border-0 text-lg"
                components={{
                  DayButton: ({ className, ...props }) => (
                    <button
                      {...props}
                      className={cn(
                        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-black h-12 w-12 text-base font-normal',
                        className
                      )}
                    />
                  ),
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleNextDay} className="">
            Next →
          </Button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col items-center space-y-3">
        <div className="text-center">
          <div className="text-base font-semibold text-foreground">{formatDate(currentDate)}</div>
        </div>
        <div className="flex items-center justify-between w-full">
          <Button onClick={handlePrevDay} className="">
            ←
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                data-test-id="date-navigator-pick-date-mobile"
                className="flex items-center justify-center space-x-2 bg-accent text-black border-accent hover:bg-accent/80"
              >
                <span>Pick a date</span>
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2 z-[100] bg-background border border-border rounded-md shadow-lg"
              align="center"
              side="bottom"
            >
              <Calendar
                mode="single"
                selected={new Date(currentDate)}
                onSelect={handleDateSelect}
                initialFocus
                className="rounded-md border-0 text-lg"
                components={{
                  DayButton: ({ className, ...props }) => (
                    <button
                      {...props}
                      className={cn(
                        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-black h-12 w-12 text-base font-normal',
                        className
                      )}
                    />
                  ),
                }}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleNextDay} className="">
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
