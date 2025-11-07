import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Hook that redirects to /auth if user is not authenticated
 * Shows loading state while authentication is being checked
 */
export function useAuthRedirect() {
  const { user, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth';
    }
  }, [loading, isAuthenticated]);

  return { isAuthenticated, loading, user };
}
