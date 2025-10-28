import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Chore</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chore Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{chore?.catalogEmoji ?? '📋'}</span>
              <div>
                <h3 className="font-medium text-gray-900">{chore?.catalogTitle ?? 'Chore'}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {chore?.points ?? 0} pts
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    {chore?.catalogCategory ?? 'General'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
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
                      {chore?.assignee_id === member.user_id && (
                        <span className="ml-2 text-blue-600 font-medium">(Currently assigned)</span>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Assigning...' : 'Assign Chore'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
