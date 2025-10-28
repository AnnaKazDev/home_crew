import React from 'react';
import { ChoreCard } from './ChoreCard';
import type { ChoreColumnProps, ChoreViewModel } from '@/types/daily-view.types';
import type { MemberDTO } from '@/types';

export function ChoreColumn({
  title,
  status,
  chores,
  members,
  onDrop,
  onChoreClick,
}: ChoreColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const choreId = e.dataTransfer.getData('text/plain');
    if (choreId) {
      onDrop(choreId);
    }
  };

  const getColumnStyles = () => {
    if (status === 'done') {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-blue-50 border-blue-200';
  };

  const getHeaderStyles = () => {
    if (status === 'done') {
      return 'text-green-800 bg-green-100';
    }
    return 'text-blue-800 bg-blue-100';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column header */}
      <div className={`p-4 rounded-t-lg border-2 border-dashed ${getColumnStyles()}`}>
        <h2 className={`text-lg font-semibold ${getHeaderStyles()} px-3 py-2 rounded`}>
          {title} ({chores.length})
        </h2>
      </div>

      {/* Drop zone and cards */}
      <div
        className={`flex-1 min-h-[400px] border-2 border-dashed border-gray-300 rounded-b-lg p-4 transition-colors ${
          status === 'done' ? 'hover:border-green-300' : 'hover:border-blue-300'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {chores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">
              {status === 'done'
                ? 'Drag completed chores here'
                : 'No tasks to do yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chores.map((chore: ChoreViewModel) => {
              // Find assignee from members list
              const assignee = chore.assignee_id
                ? members.find(member => member.user_id === chore.assignee_id) || null
                : null;

              return (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  assignee={assignee}
                  onAssign={() => onChoreClick(chore)}
                  onDelete={() => {
                    // TODO: Implement delete confirmation
                    console.log('Delete chore:', chore.id);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
