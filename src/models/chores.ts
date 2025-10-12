export interface PredefinedChore {
  id: string;
  title: string;
  emoji: string;
  category: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  /**
   * Difficulty / effort score (0–100).
   * Placeholder values; will be tuned later.
   */
  points?: number;
}

export const PREDEFINED_CHORES: PredefinedChore[] = [
  { id: 'c1', title: 'Wash dishes', emoji: '🍽️', category: 'Kitchen', points: 40 },
  { id: 'c2', title: 'Wipe down countertops', emoji: '🧽', category: 'Kitchen', points: 20 },
  { id: 'c3', title: 'Clean stovetop', emoji: '🔥', category: 'Kitchen', points: 40 },
  { id: 'c4', title: 'Empty dishwasher', emoji: '✨', category: 'Kitchen', points: 20 },
  { id: 'c5', title: 'Take out trash', emoji: '🗑️', category: 'Kitchen', points: 20 },
  { id: 'c6', title: 'Sweep kitchen floor', emoji: '🧹', category: 'Kitchen', points: 20 },
  { id: 'c7', title: 'Mop kitchen floor', emoji: '🪣', category: 'Kitchen', points: 40 },
  { id: 'c8', title: 'Clean refrigerator', emoji: '🧊', category: 'Kitchen', points: 60 },
  { id: 'c9', title: 'Organize pantry', emoji: '🥫', category: 'Kitchen', points: 40 },
  { id: 'c10', title: 'Clean microwave', emoji: '📱', category: 'Kitchen', points: 20 },

  { id: 'c11', title: 'Do laundry', emoji: '👕', category: 'Laundry', points: 60 },
  { id: 'c12', title: 'Fold clothes', emoji: '🧺', category: 'Laundry', points: 25 },
  { id: 'c13', title: 'Put away laundry', emoji: '👔', category: 'Laundry', points: 20 },
  { id: 'c14', title: 'Iron clothes', emoji: '🔧', category: 'Laundry', points: 45 },
  { id: 'c15', title: 'Clean lint trap', emoji: '🌀', category: 'Laundry', points: 15 },

  { id: 'c16', title: 'Make bed', emoji: '🛏️', category: 'Bedroom', points: 5 },
  { id: 'c17', title: 'Change bed sheets', emoji: '🛌', category: 'Bedroom', points: 35 },
  { id: 'c18', title: 'Dust bedroom', emoji: '💨', category: 'Bedroom', points: 20 },
  { id: 'c19', title: 'Organize closet', emoji: '👗', category: 'Bedroom', points: 50 },
  { id: 'c20', title: 'Vacuum bedroom', emoji: '🔌', category: 'Bedroom', points: 40 },

  { id: 'c21', title: 'Clean toilet', emoji: '🚽', category: 'Bathroom', points: 60 },
  { id: 'c22', title: 'Clean shower', emoji: '🚿', category: 'Bathroom', points: 60 },
  { id: 'c23', title: 'Clean sink', emoji: '🚰', category: 'Bathroom', points: 30 },
  { id: 'c24', title: 'Wipe mirror', emoji: '🪞', category: 'Bathroom', points: 20 },
  { id: 'c25', title: 'Mop bathroom floor', emoji: '💧', category: 'Bathroom', points: 45 },
  { id: 'c26', title: 'Restock toilet paper', emoji: '🧻', category: 'Bathroom', points: 10 },
  { id: 'c27', title: 'Clean bathroom cabinet', emoji: '💊', category: 'Bathroom', points: 35 },
  { id: 'c28', title: 'Wash bath mats', emoji: '🧼', category: 'Bathroom', points: 25 },

  { id: 'c29', title: 'Vacuum living room', emoji: '🛋️', category: 'Living Room', points: 40 },
  { id: 'c30', title: 'Dust furniture', emoji: '🪑', category: 'Living Room', points: 25 },
  { id: 'c31', title: 'Organize books', emoji: '📚', category: 'Living Room', points: 35 },
  { id: 'c32', title: 'Fluff pillows', emoji: '🛋️', category: 'Living Room', points: 10 },
  { id: 'c33', title: 'Clean windows', emoji: '🪟', category: 'Living Room', points: 45 },
  { id: 'c34', title: 'Tidy coffee table', emoji: '☕', category: 'Living Room', points: 15 },

  { id: 'c35', title: 'Water plants', emoji: '🌱', category: 'General', points: 15 },
  { id: 'c36', title: 'Dust ceiling fans', emoji: '🌀', category: 'General', points: 30 },
  { id: 'c37', title: 'Wipe light switches', emoji: '💡', category: 'General', points: 20 },
  { id: 'c38', title: 'Clean doorknobs', emoji: '🚪', category: 'General', points: 15 },
  { id: 'c39', title: 'Organize mail', emoji: '📬', category: 'General', points: 25 },
  { id: 'c40', title: 'Clean baseboards', emoji: '📏', category: 'General', points: 40 },
  { id: 'c41', title: 'Vacuum stairs', emoji: '🪜', category: 'General', points: 45 },
  { id: 'c42', title: 'Replace air filters', emoji: '🌬️', category: 'General', points: 35 },
  { id: 'c43', title: 'Check smoke detectors', emoji: '🔔', category: 'General', points: 20 },

  { id: 'c44', title: 'Sweep porch', emoji: '🏡', category: 'Outdoor', points: 30 },
  { id: 'c45', title: 'Water lawn', emoji: '🌾', category: 'Outdoor', points: 25 },
  { id: 'c46', title: 'Rake leaves', emoji: '🍂', category: 'Outdoor', points: 40 },
  { id: 'c47', title: 'Clean garage', emoji: '🚗', category: 'Outdoor', points: 60 },

  { id: 'c48', title: 'Feed cat', emoji: '🐈', category: 'Pets', points: 5, timeOfDay: 'morning' },
  { id: 'c49', title: 'Feed cat', emoji: '🐈', category: 'Pets', points: 5, timeOfDay: 'afternoon' },
  { id: 'c50', title: 'Feed cat', emoji: '🐈', category: 'Pets', points: 5, timeOfDay: 'evening' },

  { id: 'c51', title: 'Feed dog', emoji: '🐕', category: 'Pets', points: 5, timeOfDay: 'morning' },
  { id: 'c52', title: 'Feed dog', emoji: '🐕', category: 'Pets', points: 5, timeOfDay: 'afternoon' },
  { id: 'c53', title: 'Feed dog', emoji: '🐕', category: 'Pets', points: 5, timeOfDay: 'evening' },

  { id: 'c54', title: 'Walk dog', emoji: '🦮', category: 'Pets', points: 10, timeOfDay: 'morning' },
  { id: 'c55', title: 'Walk dog', emoji: '🦮', category: 'Pets', points: 10, timeOfDay: 'afternoon' },
  { id: 'c56', title: 'Walk dog', emoji: '🦮', category: 'Pets', points: 10, timeOfDay: 'evening' },

  { id: 'c57', title: 'Clean litter box', emoji: '🐈', category: 'Pets', points: 30 },
];
