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
          <div className="animate-pulse space-y-6">
            {/* Logo placeholder */}
            <div className="text-center space-y-6 mb-8">
              <div
                className="bg-gray-700 rounded w-64 mx-auto"
                style={{ aspectRatio: '731/341' }}
              ></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
            {/* Auth mode toggle placeholder */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg bg-gray-700 p-1 shadow-sm h-9 w-48"></div>
            </div>
            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
              <div className="flex justify-end">
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
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
