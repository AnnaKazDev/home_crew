import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChoreCardSkeleton() {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <Skeleton className="text-4xl flex-shrink-0 w-12 h-12 rounded" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex items-center space-x-2 mt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="w-6 h-6 rounded ml-2" />
          </div>
          <Skeleton className="h-7 w-24 rounded px-3 py-1" />
        </div>
      </CardContent>
    </Card>
  );
}
