"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { useAuthStore } from "@/stores/auth.store";
import AppHeader from "./AppHeader";
import { Toaster } from "./ui/sonner";

interface AppWithThemeProps {
  children: React.ReactNode;
}

export default function AppWithTheme({ children }: AppWithThemeProps) {
  const initialize = useAuthStore(state => state.initialize);

  // Initialize auth store on mount
  useEffect(() => {
    console.log('AppWithTheme: Initializing auth store...');
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <AppHeader />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
