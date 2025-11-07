'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AuthErrorDisplayProps {
  error: string;
}

const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error }) => {
  // Map common Supabase auth errors to user-friendly messages
  const getFriendlyErrorMessage = (error: string): string => {
    const lowerError = error.toLowerCase();

    if (
      lowerError.includes('invalid login credentials') ||
      lowerError.includes('invalid_credentials')
    ) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }

    if (lowerError.includes('email not confirmed') || lowerError.includes('email_not_confirmed')) {
      return 'Email address not confirmed. Please check your inbox.';
    }

    if (
      lowerError.includes('user already registered') ||
      lowerError.includes('user_already_exists')
    ) {
      return 'User with this email already exists. Please try signing in instead.';
    }

    if (lowerError.includes('weak password') || lowerError.includes('password')) {
      return 'Password is too weak. Please use at least 8 characters.';
    }

    if (lowerError.includes('invalid email')) {
      return 'Invalid email format.';
    }

    if (lowerError.includes('too many requests')) {
      return 'Too many attempts. Please try again later.';
    }

    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return 'Connection problem. Please check your internet connection and try again.';
    }

    // Return original error if no mapping found
    return error;
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-sm">{getFriendlyErrorMessage(error)}</AlertDescription>
    </Alert>
  );
};

export default AuthErrorDisplay;
