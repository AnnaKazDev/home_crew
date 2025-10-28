import React from 'react';
import type { ChoreCardProps } from '@/types/daily-view.types';

export function ChoreCard({ chore, assignee, onAssign, onDelete }: ChoreCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', chore.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return '🌅';
      case 'afternoon':
        return '☀️';
      case 'evening':
        return '🌙';
      case 'night':
        return '🌃';
      default:
        return '⏰';
    }
  };

  const getTimeLabel = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return 'Morning';
      case 'afternoon':
        return 'Afternoon';
      case 'evening':
        return 'Evening';
      case 'night':
        return 'Night';
      default:
        return 'Anytime';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
    >
      {/* Header with emoji and title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <span className="text-2xl">{chore.catalogEmoji || '📋'}</span>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {chore.catalogTitle}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {getTimeIcon(chore.catalogTimeOfDay)} {getTimeLabel(chore.catalogTimeOfDay)}
              </span>
              <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                {chore.points} pts
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 ml-2">
          {chore.canEdit && (
            <button
              onClick={onAssign}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              aria-label="Assign chore"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}

          {chore.canDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete chore"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Assignee info */}
      {assignee ? (
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            {assignee.avatar_url ? (
              <img
                src={assignee.avatar_url}
                alt={assignee.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {assignee.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">{assignee.name}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm text-gray-400">Unassigned</span>
        </div>
      )}

      {/* Drag handle indicator */}
      <div className="absolute top-2 right-2 opacity-30">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  );
}

