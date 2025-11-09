'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './ThemeProvider';
import AuthPage from './AuthPage';

const AuthPageWithTheme: React.FC = () => {
  const [initialTheme, setInitialTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    // Get initial theme from localStorage to prevent flash
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    setInitialTheme(savedTheme || 'dark');
  }, []);

  if (initialTheme === null) {
    // Show loading state or default to prevent flash
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-md mx-auto backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border mt-[88px] bg-gray-900/90 border-gray-700/50">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <AuthPage />
    </ThemeProvider>
  );
};

export default AuthPageWithTheme;
