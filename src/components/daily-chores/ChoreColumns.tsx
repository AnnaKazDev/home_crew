import React from 'react';
import { ChoreColumn } from './ChoreColumn';
import type { ChoreColumnsProps, ChoreViewModel } from '@/types/daily-view.types';

export function ChoreColumns({
  chores,
  members,
  currentUserId,
  onChoreUpdate,
  onChoreClick,
}: ChoreColumnsProps) {
  // Filter chores by status - need to access status from DailyChoreDTO
  const todoChores = chores.filter((chore: ChoreViewModel) => {
    // Status is inherited from DailyChoreDTO
    return (chore as any).status !== 'done';
  });

  const doneChores = chores.filter((chore: ChoreViewModel) => {
    // Status is inherited from DailyChoreDTO
    return (chore as any).status === 'done';
  });

  const handleChoreDrop = (choreId: string, targetStatus: 'todo' | 'done') => {
    // Find the chore and update its status
    const chore = chores.find(c => c.id === choreId);
    if (chore) {
      // Only update if status is actually changing
      const currentStatus = (chore as any).status;
      if (currentStatus !== targetStatus) {
        onChoreUpdate(choreId, { status: targetStatus });
      }
    }
  };

  const getAssigneeForChore = (chore: ChoreViewModel) => {
    // Find assignee from members list
    if (chore.assignee_id) {
      return members.find(member => member.user_id === chore.assignee_id) || null;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <ChoreColumn
        title="To Do"
        status="todo"
        chores={todoChores}
        members={members}
        onDrop={(choreId) => handleChoreDrop(choreId, 'todo')}
        onChoreClick={onChoreClick}
      />

      <ChoreColumn
        title="Done"
        status="done"
        chores={doneChores}
        members={members}
        onDrop={(choreId) => handleChoreDrop(choreId, 'done')}
        onChoreClick={onChoreClick}
      />
    </div>
  );
}
