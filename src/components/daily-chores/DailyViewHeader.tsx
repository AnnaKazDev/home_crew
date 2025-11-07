import React from "react";
import { PointsBadge } from "./PointsBadge";
import { DateNavigator } from "./DateNavigator";
import { useTheme } from "@/components/ThemeProvider";

interface DailyViewHeaderProps {
  currentDate: string;
  totalPoints: number;
  choresCount: number;
  onDateChange: (date: string) => void;
}

export function DailyViewHeader({ currentDate, totalPoints, choresCount, onDateChange }: DailyViewHeaderProps) {
  const { theme } = useTheme();
  const isLimitReached = choresCount >= 50;

  return (
    <div className="space-y-6">
      {/* Welcome image */}
      <div className="flex justify-center">
        <img
          src={theme === "dark" ? "/nice_to_see_you_black.png" : "/nice_to_see_you_white.png"}
          alt="Nice to see you"
          className="h-40 md:h-60 w-auto object-contain"
        />
         
      </div>
 {/* Points badge */}
      <div className="flex justify-center">
        <PointsBadge totalPoints={totalPoints} />
      </div>
    

      {/* Date navigator - full width like columns */}
      <div className="w-full">
        <DateNavigator currentDate={currentDate} onDateChange={onDateChange} />
      </div>
    </div>
  );
}
