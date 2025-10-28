import React from 'react';
import { useDrop } from 'react-dnd';
import { ChoreCard } from './ChoreCard';
import type { ChoreViewModel } from '@/types/daily-view.types';

interface ChoreColumnProps {
  title: string;
  status: 'todo' | 'done';
  chores: ChoreViewModel[];
  onDrop: (choreId: string) => void;
  onChoreAssign?: (chore: ChoreViewModel) => void;
  onChoreDelete?: (choreId: string) => void;
}

export function ChoreColumn({
  title,
  status,
  chores,
  onDrop,
  onChoreAssign,
  onChoreDelete
}: ChoreColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'chore',
    drop: (item: { id: string }) => {
      onDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`bg-white p-6 rounded-lg shadow min-h-[400px] transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold px-3 py-2 rounded ${
          status === 'todo'
            ? 'text-blue-800 bg-blue-100'
            : 'text-green-800 bg-green-100'
        }`}>
          {title} ({chores.length})
        </h2>
      </div>

      <div className="space-y-4">
        {chores.map(chore => (
          <ChoreCard
            key={chore.id}
            chore={chore}
            onAssign={onChoreAssign ? () => onChoreAssign(chore) : undefined}
            onDelete={onChoreDelete ? () => onChoreDelete(chore.id) : undefined}
          />
        ))}

        {chores.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed rounded-lg ${
            isOver ? 'border-blue-300 bg-blue-25' : 'border-gray-200'
          }`}>
            <p className="text-gray-500">
              {status === 'todo' ? 'No tasks to do!' : 'No completed chores yet'}
            </p>
            {status === 'done' && (
              <p className="text-sm text-gray-400 mt-1">Drag chores here when done!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}