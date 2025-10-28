import React from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChoreViewModel } from '@/types/daily-view.types';

interface ChoreCardProps {
  chore: ChoreViewModel;
  onAssign?: () => void;
  onDelete?: () => void;
}

export function ChoreCard({ chore, onAssign, onDelete }: ChoreCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'chore',
    item: { id: chore.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card
      ref={drag}
      className={`hover:shadow-md transition-shadow cursor-move border border-gray-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{chore.catalogEmoji || '📋'}</span>
            <div>
              <h3 className="font-medium text-gray-900">{chore.catalogTitle}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {chore.points} pts
                </Badge>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {chore.catalogCategory}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            {onAssign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAssign}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                title="Assign chore"
              >
                👤
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Delete chore"
              >
                🗑️
              </Button>
            )}
          </div>
        </div>
        {chore.assigneeName && (
          <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 mt-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              chore.assigneeColor === 'blue' ? 'bg-blue-200 text-blue-800' :
              chore.assigneeColor === 'green' ? 'bg-green-200 text-green-800' :
              'bg-gray-200 text-gray-600'
            }`}>
              {chore.assigneeInitial || '?'}
            </div>
            <span className="text-sm text-gray-600">{chore.assigneeName}</span>
          </div>
        )}
        {!chore.assigneeName && (
          <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 mt-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">?</span>
            </div>
            <span className="text-sm text-gray-400">Unassigned</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}