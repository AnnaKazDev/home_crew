"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { useAuthStore } from "@/stores/auth.store";
import HamburgerMenu from "./HamburgerMenu";

export default function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { profile, user, loading: authLoading, isAuthenticated } = useAuthStore();





  const menuItems = [
    {
      label: "Daily Chores",
      href: "/daily_chores",
    },
    {
      label: "Household Management",
      href: "/household",
    },
    {
      label: "Your Profile",
      href: "/profile",
    },
    { separator: true },
    ...(user
      ? [
          {
            label: "Sign out",
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
                    if (key && (key.startsWith('sb-') || key.startsWith('supabase') || key.includes('auth'))) {
                      keysToRemove.push(key);
                    }
                  }
                  keysToRemove.forEach(key => localStorage.removeItem(key));

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
    // Theme toggle in mobile menu
    {
      label: theme === "light" ? "Switch to dark mode" : "Switch to light mode",
      onClick: toggleTheme,
      icon: theme === "light" ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
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
              Hi, <span className="font-bold text-primary">{profile?.name || user?.email?.split('@')[0] || 'Loading...'}</span>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 p-0 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              // Moon icon for dark mode
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              // Sun icon for light mode
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
