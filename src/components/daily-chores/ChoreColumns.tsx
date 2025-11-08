import React from 'react';
import { ChoreColumn } from './ChoreColumn';
import type { ChoreViewModel } from '@/types/daily-view.types';
import type { MemberDTO } from '@/types';

interface ChoreColumnsProps {
  todoChores: ChoreViewModel[];
  doneChores: ChoreViewModel[];
  members: MemberDTO[];
  isLoading?: boolean;
  onChoreDrop: (choreId: string, targetStatus: 'todo' | 'done') => void;
  onChoreAssign?: (chore: ChoreViewModel) => void;
  onChoreDelete?: (choreId: string) => void;
  onChoreMarkDone?: (choreId: string) => void;
  onAddChoreClick?: () => void;
}

export function ChoreColumns({
  todoChores,
  doneChores,
  members,
  isLoading = false,
  onChoreDrop,
  onChoreAssign,
  onChoreDelete,
  onChoreMarkDone,
  onAddChoreClick,
}: ChoreColumnsProps) {
  const handleTodoDrop = (choreId: string) => {
    onChoreDrop(choreId, 'todo');
  };

  const handleDoneDrop = (choreId: string) => {
    onChoreDrop(choreId, 'done');
  };

  return (
    <div data-test-id="chore-columns" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChoreColumn
        title="To Do"
        status="todo"
        chores={todoChores}
        members={members}
        isLoading={isLoading}
        onDrop={handleTodoDrop}
        onChoreAssign={onChoreAssign}
        onChoreDelete={onChoreDelete}
        onChoreMarkDone={onChoreMarkDone}
        onAddChoreClick={onAddChoreClick}
      />

      <ChoreColumn
        title="Done"
        status="done"
        chores={doneChores}
        members={members}
        isLoading={isLoading}
        onDrop={handleDoneDrop}
        onChoreAssign={onChoreAssign}
        onChoreDelete={onChoreDelete}
      />
    </div>
  );
}
