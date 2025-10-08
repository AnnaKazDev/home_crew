import React, { useState, useEffect } from 'react';

interface PredefinedChore {
  id: string;
  title: string;
  emoji: string;
  category: string;
}

interface ChoresData {
  chores: PredefinedChore[];
  groupedChores: Record<string, PredefinedChore[]>;
  categories: string[];
  total: number;
}

export default function ChoresList() {
  const [data, setData] = useState<ChoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/chores')
      .then(response => response.json())
      .then((data: ChoresData) => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load chores');
        setLoading(false);
        console.error('Error loading chores:', err);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading chores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  // Filter chores based on search term
  const filteredCategories = data.categories.map(category => ({
    category,
    chores: data.groupedChores[category].filter(chore =>
      chore.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.chores.length > 0);

  return (
    <div className="min-h-screen bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[80vh] overflow-hidden">
        {/* Header with search */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search chores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          {searchTerm === '' && (
            <p className="text-gray-500 text-sm text-center">
              No tasks yet. Pick from our suggestions to see them here!
            </p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-96 p-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No chores found matching "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map(({ category, chores }) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-4">
                    {chores.map((chore) => (
                      <div
                        key={chore.id}
                        className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <span className="text-xl">{chore.emoji}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {chore.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
