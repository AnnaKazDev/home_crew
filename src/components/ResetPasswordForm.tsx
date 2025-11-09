'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation/auth.schemas';

interface ResetPasswordFormProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
  loading: boolean;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onError, onLoading, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      onLoading(true);
      onError('');

      // TODO: Implement actual password reset logic with Supabase Auth
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success for demo purposes
      // In real implementation, this would send reset email
      alert('Password reset functionality will be implemented with Supabase Auth');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to send reset link');
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Reset Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email address
          </label>
          <input
            type="email"
            id="email"
            placeholder="your@email.com"
            autoComplete="email"
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
              errors.email ? 'border-destructive' : 'border-border'
            }`}
            disabled={loading}
          />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full whitespace-normal"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
