"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import DailyView from "./DailyView";

export default function DailyViewWithProvider() {
  console.log('DailyViewWithProvider rendering...');

  // Client-only component with React hooks
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
