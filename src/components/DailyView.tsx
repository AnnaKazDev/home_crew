import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDailyView } from '@/hooks/useDailyView';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { DailyViewHeader } from './daily-chores/DailyViewHeader';
import { ChoreColumns } from './daily-chores/ChoreColumns';
import { AddChoreModal } from './daily-chores/AddChoreModal';
import { AssignChoreModal } from './daily-chores/AssignChoreModal';
import type { CreateDailyChoreCmd } from '@/types';
import type { ChoreViewModel } from '@/types/daily-view.types';

// Use ChoreViewModel from types

export default function DailyView() {
  const { isAuthenticated, loading: authLoading } = useAuthRedirect();

  const {
    // Data
    currentDate,
    chores,
    members,
    household,
    profile,
    currentUserId,

    // Modal states
    isAddModalOpen,
    isAssignModalOpen,
    selectedChore,

    // Loading and error states
    isLoading,
    error,

    // Actions
    setCurrentDate,
    openAddModal,
    closeAddModal,
    openAssignModal,
    closeAssignModal,

    // Mutations
    handleChoreCreate,
    handleChoreUpdate,
    handleChoreDelete,

    // Mutation states
    isCreatingChore,
    isUpdatingChore,
    isDeletingChore,
  } = useDailyView();

  // Separate chores by status
  const todoChores = chores.filter((chore: ChoreViewModel) => chore.status === 'todo');
  const doneChores = chores.filter((chore: ChoreViewModel) => chore.status === 'done');

  // Calculate total points from completed chores assigned to current user
  const totalPoints = doneChores
    .filter((chore) => chore.assignee_id === currentUserId)
    .reduce((sum, chore) => sum + (chore.points || 0), 0);

  // Handle chore assignment
  const handleAssignChore = (assigneeId: string | null) => {
    if (!selectedChore) return;

    handleChoreUpdate(selectedChore.id, {
      assignee_id: assigneeId,
    });
  };

  // Handle chore drop (drag and drop)
  const handleChoreDrop = (choreId: string, targetStatus: 'todo' | 'done') => {
    const chore = chores.find((c: ChoreViewModel) => c.id === choreId);
    if (!chore || chore.status === targetStatus) {
      return; // No change needed
    }

    handleChoreUpdate(choreId, {
      status: targetStatus,
    });
  };

  // Handle mark chore as done (button click)
  const handleMarkDone = (choreId: string) => {
    handleChoreDrop(choreId, 'done');
  };

  // Handle add chore click with limit check
  const handleAddChoreClick = () => {
    // Check daily limit (50 chores) before opening modal
    if (chores.length >= 50) {
      console.warn('Daily chore limit reached (50)');
      return;
    }
    openAddModal();
  };

  // All conditional returns moved to the end after all hooks are called

  // Redirect handled by useAuthRedirect hook
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        data-test-id="daily-view"
        className="min-h-screen bg-background pt-[2rem] md:pt-[2.5rem] px-4 md:px-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header with Shadcn components */}
          <DailyViewHeader
            currentDate={currentDate}
            totalPoints={totalPoints}
            choresCount={chores.length}
            onDateChange={setCurrentDate}
          />

          {/* Chore Columns with Drag & Drop */}
          <ChoreColumns
            todoChores={todoChores}
            doneChores={doneChores}
            members={members}
            isLoading={isLoading}
            onChoreDrop={handleChoreDrop}
            onChoreAssign={openAssignModal}
            onChoreDelete={handleChoreDelete}
            onChoreMarkDone={handleMarkDone}
            onAddChoreClick={handleAddChoreClick}
          />

          {/* Footer */}
          <div className="mt-12 text-center text-muted-foreground">
            <p>🎉 Daily Chores View with working drag & drop! Move tasks between columns.</p>
            <p className="text-sm mt-2">Points update automatically when tasks are completed!</p>
          </div>
        </div>

        {/* Add Chore Modal */}
        <AddChoreModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onSubmit={handleChoreCreate}
          members={members}
          currentDate={currentDate}
          currentUserId={currentUserId}
          householdId={household?.id}
        />

        {/* Assign Chore Modal */}
        <AssignChoreModal
          isOpen={isAssignModalOpen}
          chore={selectedChore}
          members={members}
          currentUserId={currentUserId}
          onClose={closeAssignModal}
          onSubmit={handleAssignChore}
        />
      </div>
    </DndProvider>
  );
}
