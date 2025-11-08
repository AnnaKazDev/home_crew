'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from './ThemeProvider';
import { useAuthStore } from '@/stores/auth.store';
import HamburgerMenu from './HamburgerMenu';

export default function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { profile, user, loading: authLoading, isAuthenticated } = useAuthStore();

  const menuItems = [
    {
      label: 'Daily Chores',
      href: '/daily_chores',
    },
    {
      label: 'Household Management',
      href: '/household',
    },
    {
      label: 'Your Profile',
      href: '/profile',
    },
    { separator: true },
    ...(user
      ? [
          {
            label: 'Sign out',
            onClick: async () => {
              try {
                const response = await fetch('/api/auth/logout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (response.ok) {
                  // Clear all Supabase-related data from localStorage
                  const keysToRemove = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (
                      key &&
                      (key.startsWith('sb-') || key.startsWith('supabase') || key.includes('auth'))
                    ) {
                      keysToRemove.push(key);
                    }
                  }
                  keysToRemove.forEach((key) => localStorage.removeItem(key));

                  // If no specific keys found, clear all localStorage as fallback
                  if (keysToRemove.length === 0) {
                    localStorage.clear();
                  }

                  // Redirect to auth page after successful logout
                  window.location.href = '/auth';
                } else {
                  console.error('Logout failed');
                }
              } catch (error) {
                console.error('Logout error:', error);
              }
            },
          },
        ]
      : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background dark:bg-black border-b border-border">
      <div className="w-full relative flex h-[5.5rem] items-center px-4">
        {/* Logo/Brand and Hamburger Menu */}
        <div className="flex items-center">
          <div style={{ marginRight: '32px' }}>
            <HamburgerMenu menuItems={menuItems} />
          </div>
          <a href="/">
            <img
              src="/logotype.png"
              alt="Home icon"
              className="w-32 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </a>
          {/* <h1 className="text-lg font-semibold text-foreground dark:text-white">Home Crew</h1> */}
        </div>

        {/* Desktop controls - hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          {user && (
            <span className="text-lg font-medium text-foreground dark:text-white">
              Hi,{' '}
              <span className="font-bold text-primary">
                {profile?.name || user?.email?.split('@')[0] || 'Loading...'}
              </span>
            </span>
          )}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 shadow-lg">
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
