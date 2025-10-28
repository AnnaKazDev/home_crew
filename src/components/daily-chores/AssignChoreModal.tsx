import React, { useState } from 'react';
import type { AssignChoreModalProps, ChoreViewModel } from '@/types/daily-view.types';
import type { MemberDTO } from '@/types';

export function AssignChoreModal({
  isOpen,
  chore,
  members,
  onClose,
  onSubmit,
}: AssignChoreModalProps) {
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(
    chore?.assignee_id || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen && chore) {
      setSelectedAssigneeId(chore.assignee_id || null);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen, chore]);

  const handleSubmit = async () => {
    if (!chore) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate that selected member is still in the household
      if (selectedAssigneeId) {
        const selectedMember = members.find(m => m.user_id === selectedAssigneeId);
        if (!selectedMember) {
          throw new Error('Selected member is no longer in the household');
        }
      }

      await onSubmit(selectedAssigneeId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign chore');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !chore) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Assign Chore</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Chore Preview */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{chore.catalogEmoji || '📋'}</span>
              <div>
                <h3 className="font-medium text-gray-900">{chore.catalogTitle}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {chore.points} pts
                  </span>
                  <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                    {chore.catalogCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Member Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Assign to:</h3>

            {/* Unassigned option */}
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border-2 border-gray-200">
              <input
                type="radio"
                name="assignee"
                value=""
                checked={selectedAssigneeId === null}
                onChange={() => setSelectedAssigneeId(null)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Unassigned</div>
                  <div className="text-sm text-gray-500">Anyone can complete this chore</div>
                </div>
              </div>
            </label>

            {/* Member options */}
            {members.map(member => (
              <label key={member.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border-2 border-gray-200">
                <input
                  type="radio"
                  name="assignee"
                  value={member.user_id}
                  checked={selectedAssigneeId === member.user_id}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                      {chore.assignee_id === member.user_id && (
                        <span className="ml-2 text-blue-600 font-medium">(Currently assigned)</span>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isLoading ? 'Assigning...' : 'Assign Chore'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
