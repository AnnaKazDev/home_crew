'use client';

import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import DailyView from './DailyView';

export default function DailyViewWithProvider() {
  console.log('DailyViewWithProvider rendering...');

  // Client-only component with React hooks
  try {
    return (
      <ThemeProvider>
        <QueryProvider>
          <DailyView />
        </QueryProvider>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('Error in DailyViewWithProvider:', error);
    return <div>Error loading component</div>;
  }
}
