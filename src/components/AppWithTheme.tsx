"use client";

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import AppHeader from './AppHeader';

interface AppWithThemeProps {
  children: React.ReactNode;
}

export default function AppWithTheme({ children }: AppWithThemeProps) {
  return (
    <ThemeProvider>
      <AppHeader />
      {children}
    </ThemeProvider>
  );
}
