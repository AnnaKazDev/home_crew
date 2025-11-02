import React from 'react';
import { Button } from "@/components/ui/button";

interface AddChoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function AddChoreButton({ onClick, disabled = false, className = '' }: AddChoreButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center space-x-2 ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Add Chore</span>
    </Button>
  );
}

