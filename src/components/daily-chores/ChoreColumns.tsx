import React from 'react';
import { ChoreColumn } from './ChoreColumn';

interface Chore {
  id: string;
  title: string;
  emoji: string;
  points: number;
  category: string;
  assigneeName?: string;
  assigneeInitial?: string;
  assigneeColor?: string;
}

interface ChoreColumnsProps {
  todoChores: Chore[];
  doneChores: Chore[];
  onChoreDrop: (choreId: string, targetStatus: 'todo' | 'done') => void;
  onChoreAssign?: (chore: Chore) => void;
  onChoreDelete?: (choreId: string) => void;
}

export function ChoreColumns({
  todoChores,
  doneChores,
  onChoreDrop,
  onChoreAssign,
  onChoreDelete
}: ChoreColumnsProps) {
  const handleTodoDrop = (choreId: string) => {
    onChoreDrop(choreId, 'todo');
  };

  const handleDoneDrop = (choreId: string) => {
    onChoreDrop(choreId, 'done');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChoreColumn
        title="To Do"
        status="todo"
        chores={todoChores}
        onDrop={handleTodoDrop}
        onChoreAssign={onChoreAssign}
        onChoreDelete={onChoreDelete}
      />

      <ChoreColumn
        title="Done"
        status="done"
        chores={doneChores}
        onDrop={handleDoneDrop}
        onChoreAssign={onChoreAssign}
        onChoreDelete={onChoreDelete}
      />
    </div>
  );
}