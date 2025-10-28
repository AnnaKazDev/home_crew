import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteChoreModal } from './DeleteChoreModal';
import type { ChoreViewModel } from '@/types/daily-view.types';
import type { MemberDTO } from '@/types';

interface ChoreCardProps {
  chore: ChoreViewModel;
  members: MemberDTO[];
  onAssign?: () => void;
  onDelete?: () => void;
}

export function ChoreCard({ chore, members, onAssign, onDelete }: ChoreCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'chore',
    item: { id: chore.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    }
  };

  // Helper function to get time of day text
  const getTimeOfDayText = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return 'morning';
      case 'afternoon': return 'afternoon';
      case 'evening': return 'evening';
      case 'night': return 'night';
      default: return '';
    }
  };

  return (
    <Card
      ref={drag}
      className={`hover:shadow-md transition-shadow cursor-move border border-gray-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{chore.catalogEmoji || '📋'}</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">
                {chore.catalogTitle}
                {chore.catalogTimeOfDay !== 'any' && (
                  <span className="text-xs text-gray-500 ml-1">({getTimeOfDayText(chore.catalogTimeOfDay)})</span>
                )}
                {!chore.catalogPredefined && <span className="ml-1">✨</span>}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {chore.points} pts
                </Badge>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 truncate">
                  {chore.catalogCategory}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
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
                onClick={handleDeleteClick}
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
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">
              {chore.assigneeName.charAt(0).toUpperCase()}
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

      <DeleteChoreModal
        isOpen={isDeleteModalOpen}
        chore={chore}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </Card>
  );
}