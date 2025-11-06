"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import DailyView from "./DailyView";

export default function DailyViewWithProvider() {
  console.log('DailyViewWithProvider rendering...');

  // Force client-only rendering to avoid hydration mismatches in test environment
  try {
    return (
      <QueryProvider>
        <DailyView />
      </QueryProvider>
    );
  } catch (error) {
    console.error('Error in DailyViewWithProvider:', error);
    return <div>Error loading component</div>;
  }
}
