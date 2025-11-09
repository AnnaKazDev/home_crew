import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ChoreViewModel } from '@/types/daily-view.types';

interface DeleteChoreModalProps {
  isOpen: boolean;
  chore: ChoreViewModel | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteChoreModal({ isOpen, chore, onClose, onConfirm }: DeleteChoreModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this chore?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this chore <strong>"{chore?.catalogTitle}"</strong>?{' '}
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
