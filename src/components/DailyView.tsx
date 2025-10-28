import React, { useState } from 'react';
import { AddChoreModal } from './daily-chores/AddChoreModal';
import type { MemberDTO, CreateDailyChoreCmd } from '@/types';

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

export default function DailyView() {
  // Calculate points based on completed chores only
  const calculatePoints = (doneChores: Chore[]) => {
    return doneChores.reduce((sum, chore) => sum + chore.points, 95); // Start with base 95
  };

  const [currentDate, setCurrentDate] = useState('2025-10-27');

  // State for chores in each column
  const [todoChores, setTodoChores] = useState<Chore[]>([
    {
      id: 'chore-1',
      title: 'Dust furniture',
      emoji: '🪑',
      points: 25,
      category: 'Living Room',
      assigneeName: 'John Smith',
      assigneeInitial: 'J',
      assigneeColor: 'blue'
    },
    {
      id: 'chore-2',
      title: 'Wash dishes',
      emoji: '🍽️',
      points: 40,
      category: 'Kitchen',
      assigneeName: 'Jane Smith',
      assigneeInitial: 'J',
      assigneeColor: 'green'
    },
    {
      id: 'chore-3',
      title: 'Take out trash',
      emoji: '🗑️',
      points: 20,
      category: 'Kitchen',
      assigneeName: undefined,
      assigneeInitial: '?',
      assigneeColor: 'gray'
    }
  ]);

  const [doneChores, setDoneChores] = useState<Chore[]>([]);

  // Calculate current points based on completed chores
  const points = calculatePoints(doneChores);

  // Mock members data
  const mockMembers: MemberDTO[] = [
    { id: 'user-1', user_id: 'user-1', name: 'John Smith', avatar_url: null, role: 'admin', joined_at: '2024-01-01' },
    { id: 'user-2', user_id: 'user-2', name: 'Jane Smith', avatar_url: null, role: 'member', joined_at: '2024-01-01' },
    { id: 'user-3', user_id: 'user-3', name: 'Mike Smith', avatar_url: null, role: 'member', joined_at: '2024-01-01' },
  ];

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedChoreForAssign, setSelectedChoreForAssign] = useState<Chore | null>(null);

  // Modal handlers
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openAssignModal = (chore: Chore) => {
    console.log('Opening assign modal for chore:', chore.id);
    setSelectedChoreForAssign(chore);
    setIsAssignModalOpen(true);
  };
  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedChoreForAssign(null);
  };

  const handleAssignChore = (assigneeId: string | null) => {
    if (!selectedChoreForAssign) return;

    console.log('Assigning chore', selectedChoreForAssign.id, 'to assignee', assigneeId);

    // Update the chore's assignee in both columns
    setTodoChores(prev => prev.map(chore =>
      chore.id === selectedChoreForAssign.id
        ? { ...chore, assigneeName: assigneeId ? getAssigneeName(assigneeId) : undefined }
        : chore
    ));

    setDoneChores(prev => prev.map(chore =>
      chore.id === selectedChoreForAssign.id
        ? { ...chore, assigneeName: assigneeId ? getAssigneeName(assigneeId) : undefined }
        : chore
    ));

    closeAssignModal();
  };

  const getAssigneeName = (assigneeId: string) => {
    const mockMembers = [
      { id: 'user-1', name: 'John Smith' },
      { id: 'user-2', name: 'Jane Smith' },
      { id: 'user-3', name: 'Mike Smith' },
    ];
    return mockMembers.find(m => m.id === assigneeId)?.name;
  };

  const handleAddChoreSubmit = (cmd: CreateDailyChoreCmd) => {
    console.log('Adding new chore:', cmd);

    // For now, just add a mock chore to the todo list
    const newChore: Chore = {
      id: `chore-${Date.now()}`,
      title: `New chore from catalog ${cmd.chore_catalog_id}`,
      emoji: '✨',
      points: 25, // Mock points
      category: 'New',
      assigneeName: cmd.assignee_id ? getAssigneeName(cmd.assignee_id) : undefined,
    };

    setTodoChores(prev => [...prev, newChore]);
    setIsAddModalOpen(false);
  };

  // Date navigation handlers
  const handlePreviousDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    setCurrentDate(date.toISOString().split('T')[0]);
    // In real app, this would refetch chores for the new date
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    setCurrentDate(date.toISOString().split('T')[0]);
    // In real app, this would refetch chores for the new date
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
    // In real app, this would refetch chores for the new date
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, chore: Chore) => {
    e.dataTransfer.setData('text/plain', chore.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumn: 'todo' | 'done') => {
    e.preventDefault();
    const choreId = e.dataTransfer.getData('text/plain');

    // Find the chore in both columns
    let choreToMove: Chore | undefined;
    let sourceColumn: 'todo' | 'done';

    choreToMove = todoChores.find(c => c.id === choreId);
    if (choreToMove) {
      sourceColumn = 'todo';
    } else {
      choreToMove = doneChores.find(c => c.id === choreId);
      sourceColumn = 'done';
    }

    if (!choreToMove || sourceColumn === targetColumn) {
      return; // No change needed
    }

    // Move the chore between columns
    if (sourceColumn === 'todo' && targetColumn === 'done') {
      // Move from todo to done
      setTodoChores(prev => prev.filter(c => c.id !== choreId));
      setDoneChores(prev => [...prev, choreToMove!]);
      // Points will be recalculated automatically
    } else if (sourceColumn === 'done' && targetColumn === 'todo') {
      // Move from done to todo
      setDoneChores(prev => prev.filter(c => c.id !== choreId));
      setTodoChores(prev => [...prev, choreToMove!]);
      // Points will be recalculated automatically
    }
  };

  const handleAddChoreClick = () => {
    // Check daily limit (50 chores) before opening modal
    if (todoChores.length + doneChores.length >= 50) {
      console.warn('Daily chore limit reached (50)');
      return;
    }
    openAddModal();
  };

  const ChoreCard = ({ chore }: { chore: Chore }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, chore)}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-move bg-white"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{chore.emoji}</span>
          <div>
            <h3 className="font-medium text-gray-900">{chore.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{chore.points} pts</span>
              <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{chore.category}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openAssignModal(chore);
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Assign chore"
          >
            👤
          </button>
          <button
            onClick={() => {
              // TODO: Add delete confirmation
              console.log('Delete chore:', chore.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete chore"
          >
            🗑️
          </button>
        </div>
      </div>
      {chore.assigneeName ? (
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 mt-3">
          <div className={`w-6 h-6 bg-${chore.assigneeColor}-200 rounded-full flex items-center justify-center`}>
            <span className={`text-xs font-medium text-${chore.assigneeColor}-800`}>{chore.assigneeInitial}</span>
          </div>
          <span className="text-sm text-gray-600">{chore.assigneeName}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 mt-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">{chore.assigneeInitial}</span>
          </div>
          <span className="text-sm text-gray-400">Unassigned</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Daily Chores - Working! 🎉</h1>

        {/* Points Badge */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 inline-flex items-center space-x-2 mb-6">
          <span className="text-yellow-600">⭐</span>
          <span className="font-semibold text-yellow-800">{points} points</span>
          <span className="text-yellow-700">earned today</span>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow">
          <button
            onClick={handlePreviousDay}
            className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            ⬅️ Previous
          </button>
          <div className="text-center">
            <div className="text-lg font-semibold">{formatDisplayDate(currentDate)}</div>
            <input
              type="date"
              value={currentDate}
              onChange={handleDateChange}
              className="mt-2 border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleNextDay}
            className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Next ➡️
          </button>
        </div>

        {/* Chore Columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* To Do Column */}
          <div
            className="bg-white p-6 rounded-lg shadow min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'todo')}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-800 bg-blue-100 px-3 py-2 rounded">
                To Do ({todoChores.length})
              </h2>
              <button
                onClick={handleAddChoreClick}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add Chore
              </button>
            </div>

            <div className="space-y-4">
              {todoChores.map(chore => (
                <ChoreCard key={chore.id} chore={chore} />
              ))}
              {todoChores.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <p className="text-gray-500">No tasks to do!</p>
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div
            className="bg-white p-6 rounded-lg shadow min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'done')}
          >
            <h2 className="text-lg font-semibold text-green-800 bg-green-100 px-3 py-2 rounded mb-4">
              Done ({doneChores.length})
            </h2>

            <div className="space-y-4">
              {doneChores.map(chore => (
                <ChoreCard key={chore.id} chore={chore} />
              ))}
              {doneChores.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <p className="text-gray-500">No completed chores yet</p>
                  <p className="text-sm text-gray-400 mt-1">Drag chores here when done!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>🎉 Daily Chores View with working drag & drop! Move tasks between columns.</p>
          <p className="text-sm mt-2">Points update automatically when tasks are completed!</p>
        </div>
      </div>

      {/* Add Chore Modal */}
      <AddChoreModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={handleAddChoreSubmit}
        members={mockMembers}
      />

      {/* Assign Chore Modal */}
      {isAssignModalOpen && selectedChoreForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Assign Chore</h2>
              <button
                onClick={closeAssignModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedChoreForAssign.emoji}</span>
                  <div>
                    <h3 className="font-medium">{selectedChoreForAssign.title}</h3>
                    <p className="text-sm text-gray-600">{selectedChoreForAssign.points} points</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Assign to:</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="assignee"
                      value=""
                      defaultChecked={!selectedChoreForAssign?.assigneeName}
                    />
                    <span>Unassigned</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="assignee"
                      value="user-1"
                      defaultChecked={selectedChoreForAssign?.assigneeName === 'John Smith'}
                    />
                    <span>John Smith</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="assignee"
                      value="user-2"
                      defaultChecked={selectedChoreForAssign?.assigneeName === 'Jane Smith'}
                    />
                    <span>Jane Smith</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="assignee"
                      value="user-3"
                      defaultChecked={selectedChoreForAssign?.assigneeName === 'Mike Smith'}
                    />
                    <span>Mike Smith</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeAssignModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const selectedRadio = document.querySelector('input[name="assignee"]:checked') as HTMLInputElement;
                  const assigneeId = selectedRadio?.value || null;
                  handleAssignChore(assigneeId === '' ? null : assigneeId);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}