"use client";

import React from 'react';
import { QueryProvider } from './QueryProvider';
import DailyView from './DailyView';

export default function DailyViewWithProvider() {
  return (
    <QueryProvider>
      <DailyView />
    </QueryProvider>
  );
}
