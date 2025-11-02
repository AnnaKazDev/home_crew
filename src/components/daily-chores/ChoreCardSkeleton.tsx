import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChoreCardSkeleton() {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <Skeleton className="w-6 h-6 rounded" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-12 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        </div>
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 mt-3">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
