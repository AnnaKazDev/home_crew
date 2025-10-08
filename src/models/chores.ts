export interface PredefinedChore {
  id: string;
  title: string;
  emoji: string;
  category: string;
}

export const PREDEFINED_CHORES: PredefinedChore[] = [
  { id: 'c1', title: 'Wash dishes', emoji: '🍽️', category: 'Kitchen' },
  { id: 'c2', title: 'Wipe down countertops', emoji: '🧽', category: 'Kitchen' },
  { id: 'c3', title: 'Clean stovetop', emoji: '🔥', category: 'Kitchen' },
  { id: 'c4', title: 'Empty dishwasher', emoji: '✨', category: 'Kitchen' },
  { id: 'c5', title: 'Take out trash', emoji: '🗑️', category: 'Kitchen' },
  { id: 'c6', title: 'Sweep kitchen floor', emoji: '🧹', category: 'Kitchen' },
  { id: 'c7', title: 'Mop kitchen floor', emoji: '🪣', category: 'Kitchen' },
  { id: 'c8', title: 'Clean refrigerator', emoji: '🧊', category: 'Kitchen' },
  { id: 'c9', title: 'Organize pantry', emoji: '🥫', category: 'Kitchen' },
  { id: 'c10', title: 'Clean microwave', emoji: '📱', category: 'Kitchen' },

  { id: 'c11', title: 'Do laundry', emoji: '👕', category: 'Laundry' },
  { id: 'c12', title: 'Fold clothes', emoji: '🧺', category: 'Laundry' },
  { id: 'c13', title: 'Put away laundry', emoji: '👔', category: 'Laundry' },
  { id: 'c14', title: 'Iron clothes', emoji: '🔧', category: 'Laundry' },
  { id: 'c15', title: 'Clean lint trap', emoji: '🌀', category: 'Laundry' },

  { id: 'c16', title: 'Make bed', emoji: '🛏️', category: 'Bedroom' },
  { id: 'c17', title: 'Change bed sheets', emoji: '🛌', category: 'Bedroom' },
  { id: 'c18', title: 'Dust bedroom', emoji: '💨', category: 'Bedroom' },
  { id: 'c19', title: 'Organize closet', emoji: '👗', category: 'Bedroom' },
  { id: 'c20', title: 'Vacuum bedroom', emoji: '🔌', category: 'Bedroom' },

  { id: 'c21', title: 'Clean toilet', emoji: '🚽', category: 'Bathroom' },
  { id: 'c22', title: 'Clean shower', emoji: '🚿', category: 'Bathroom' },
  { id: 'c23', title: 'Clean sink', emoji: '🚰', category: 'Bathroom' },
  { id: 'c24', title: 'Wipe mirror', emoji: '🪞', category: 'Bathroom' },
  { id: 'c25', title: 'Mop bathroom floor', emoji: '💧', category: 'Bathroom' },
  { id: 'c26', title: 'Restock toilet paper', emoji: '🧻', category: 'Bathroom' },
  { id: 'c27', title: 'Clean bathroom cabinet', emoji: '💊', category: 'Bathroom' },
  { id: 'c28', title: 'Wash bath mats', emoji: '🧼', category: 'Bathroom' },

  { id: 'c29', title: 'Vacuum living room', emoji: '🛋️', category: 'Living Room' },
  { id: 'c30', title: 'Dust furniture', emoji: '🪑', category: 'Living Room' },
  { id: 'c31', title: 'Organize books', emoji: '📚', category: 'Living Room' },
  { id: 'c32', title: 'Fluff pillows', emoji: '🛋️', category: 'Living Room' },
  { id: 'c33', title: 'Clean windows', emoji: '🪟', category: 'Living Room' },
  { id: 'c34', title: 'Tidy coffee table', emoji: '☕', category: 'Living Room' },

  { id: 'c35', title: 'Water plants', emoji: '🌱', category: 'General' },
  { id: 'c36', title: 'Dust ceiling fans', emoji: '🌀', category: 'General' },
  { id: 'c37', title: 'Wipe light switches', emoji: '💡', category: 'General' },
  { id: 'c38', title: 'Clean doorknobs', emoji: '🚪', category: 'General' },
  { id: 'c39', title: 'Organize mail', emoji: '📬', category: 'General' },
  { id: 'c40', title: 'Clean baseboards', emoji: '📏', category: 'General' },
  { id: 'c41', title: 'Vacuum stairs', emoji: '🪜', category: 'General' },
  { id: 'c42', title: 'Replace air filters', emoji: '🌬️', category: 'General' },
  { id: 'c43', title: 'Check smoke detectors', emoji: '🔔', category: 'General' },

  { id: 'c44', title: 'Sweep porch', emoji: '🏡', category: 'Outdoor' },
  { id: 'c45', title: 'Water lawn', emoji: '🌾', category: 'Outdoor' },
  { id: 'c46', title: 'Rake leaves', emoji: '🍂', category: 'Outdoor' },
  { id: 'c47', title: 'Clean garage', emoji: '🚗', category: 'Outdoor' },

  { id: 'c48', title: 'Feed pets', emoji: '🐕', category: 'Pets' },
  { id: 'c49', title: 'Clean litter box', emoji: '🐈', category: 'Pets' },
  { id: 'c50', title: 'Walk dog', emoji: '🦮', category: 'Pets' },
];
