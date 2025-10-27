export interface PredefinedChore {
  id: string;
  title: string;
  emoji: string;
  category: string;
  timeOfDay?: "morning" | "afternoon" | "evening";
  /**
   * Difficulty / effort score (0–100).
   * Placeholder values; will be tuned later.
   */
  points?: number;
}

// List removed – chores are now stored in Supabase (chores_catalog table).
