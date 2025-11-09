import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy } from 'lucide-react';

interface DailyPoints {
  date: string;
  points: number;
}

interface PointsBreakdownProps {
  dailyPoints: DailyPoints[];
  loading?: boolean;
  error?: string | null;
}

const PointsBreakdown: React.FC<PointsBreakdownProps> = ({
  dailyPoints,
  loading = false,
  error = null,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const baseDateFormat = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (dateStr === today.toISOString().split('T')[0]) {
      return `${date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })} (Today)`;
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const totalPoints = dailyPoints.reduce((sum, day) => sum + day.points, 0);
  const maxPoints = Math.max(...dailyPoints.map((day) => day.points), 0);
  const avgPoints = dailyPoints.length > 0 ? Math.round(totalPoints / dailyPoints.length) : 0;

  // Calculate date range
  const dateRange =
    dailyPoints.length > 0
      ? (() => {
          const sortedDates = dailyPoints
            .filter((day) => day.points > 0)
            .map((day) => day.date)
            .sort();
          if (sortedDates.length === 0) return null;
          const firstDate = new Date(sortedDates[0]);
          const lastDate = new Date(sortedDates[sortedDates.length - 1]);
          return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        })()
      : null;

  if (loading) {
    return (
      <Card className="w-full p-6">
        <CardHeader className="px-0 py-0">
          <CardTitle className="flex items-center gap-2 !text-xl">
            ⭐ Points Summary - Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-pulse"
              >
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-6 w-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full p-6">
        <CardHeader className="px-0 py-0">
          <CardTitle className="flex items-center gap-2 !text-xl">
            ⭐ Points Summary - Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load points data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full p-6">
      <CardHeader className="px-0 py-0">
        <CardTitle className="flex items-center gap-2 !text-xl">
          ⭐ Points Summary - Last 7 Days
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>Total: {totalPoints} pts</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Average: {avgPoints} pts/day</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="space-y-3">
          {dailyPoints.map((day) => {
            const percentage = maxPoints > 0 ? (day.points / maxPoints) * 100 : 0;

            return (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium min-w-[80px]">{formatDate(day.date)}</div>
                  <div className="flex-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Badge
                  variant={day.points > 0 ? 'default' : 'secondary'}
                  className={`min-w-[50px] justify-center ${day.points === 0 ? 'dark:text-black' : ''}`}
                >
                  {day.points > 0 ? `+${day.points}` : day.points}
                </Badge>
              </div>
            );
          })}
        </div>

        {dailyPoints.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mx-auto mb-4 opacity-50">⭐</div>
            <p>No points data for the last 7 days</p>
            <p className="text-sm mt-1">Complete some tasks to see your summary!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsBreakdown;
