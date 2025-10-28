import React from 'react';

interface AddChoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function AddChoreButton({ onClick, disabled = false, className = '' }: AddChoreButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Add Chore</span>
    </button>
  );
}

