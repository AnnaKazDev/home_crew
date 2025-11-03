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
      label: "Household",
      href: "/household",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    // Separator
    { separator: true },
    // Mobile-only menu items
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
      <div className="container relative flex h-14 items-center px-4">
        {/* Logo/Brand and Hamburger Menu */}
        <div className="flex items-center space-x-2">
          <HamburgerMenu menuItems={menuItems} />
          <h1 className="text-lg font-semibold text-foreground dark:text-white">Home Crew</h1>
        </div>

        {/* User greeting - visible on both mobile and desktop */}
        {user && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2">
            <span className="text-sm font-medium text-foreground dark:text-white">
              Hi, {profile?.name || user?.email?.split('@')[0] || 'Loading...'}!
            </span>
          </div>
        )}

        {/* Desktop controls - hidden on mobile, visible on desktop */}
        <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center space-x-2">
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });

                  if (response.ok) {
                    // Redirect to auth page after successful logout
                    window.location.href = '/auth';
                  } else {
                    console.error('Logout failed');
                  }
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className="px-3 py-1 h-8 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg"
              title="Sign out"
            >
              Sign out
            </Button>
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
