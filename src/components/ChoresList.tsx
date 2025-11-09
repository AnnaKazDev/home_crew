import React, { useState, useEffect } from 'react';

interface Chore {
  id: string;
  title: string;
  emoji: string;
  category: string;
  predefined: boolean;
  points: number;
  time_of_day: string;
}

interface ChoresData {
  chores: Chore[];
  groupedChores: Record<string, Chore[]>;
  categories: string[];
  total: number;
}

export default function ChoresList() {
  const [data, setData] = useState<ChoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/v1/catalog?type=all')
      .then((response) => response.json())
      .then((chores: Chore[]) => {
        // Group by category
        const grouped = chores.reduce(
          (acc, chore) => {
            if (!acc[chore.category]) acc[chore.category] = [];
            acc[chore.category].push(chore);
            return acc;
          },
          {} as Record<string, Chore[]>
        );

        const data: ChoresData = {
          chores,
          groupedChores: grouped,
          categories: Object.keys(grouped),
          total: chores.length,
        };

        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load chores');
        setLoading(false);
        console.error('Error loading chores:', err);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="glass rounded-2xl p-8 animate-float">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <div className="text-lg font-medium text-foreground">Loading chores...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="glass rounded-2xl p-8 border-destructive bg-destructive/10">
          <div className="text-center">
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <div className="text-destructive text-lg font-medium">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Filter chores based on search term
  const filteredCategories = data.categories
    .map((category) => ({
      category,
      chores: data.groupedChores[category].filter((chore) =>
        chore.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((cat) => cat.chores.length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center mt-[88px] p-4 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/40">
      <div className="card-elevated max-w-4xl w-full max-h-[85vh] overflow-hidden animate-float">
        {/* Header with search */}
        <div className="p-8 border-b border-gray-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for chores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground border-border"
              />
            </div>
          </div>
          {searchTerm === '' && (
            <div className="text-center">
              <p className="text-foreground text-lg mb-2 gradient-text-light font-medium">
                ✨ Discover household tasks to organize your home
              </p>
              <p className="text-muted-foreground text-sm">
                Search above or browse our curated collection below
              </p>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[60vh] p-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-2xl gradient-text mb-2 font-semibold">No chores found</div>
              <div className="text-muted-foreground">Try adjusting your search term</div>
              <div className="mt-4 text-sm text-muted-foreground">"{searchTerm}"</div>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map(({ category, chores }) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-1 flex-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full"></div>
                    <h3 className="text-2xl font-bold gradient-text whitespace-nowrap px-4 py-2 bg-white/60 rounded-full shadow-sm">
                      {category}
                    </h3>
                    <div className="h-1 flex-1 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {chores.map((chore, index) => (
                      <div
                        key={chore.id}
                        className={`group card-hover p-6 rounded-2xl border border-gray-100/60 bg-gradient-to-br from-white/90 to-white/60 shadow-lg hover:shadow-xl hover:from-blue-50/90 hover:to-indigo-50/60 hover:scale-[1.02] transition-all duration-300 cursor-pointer backdrop-blur-sm m-[30px] ${index % 2 === 0 ? 'animate-float' : ''} p-5`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                            {chore.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-foreground group-hover:gradient-text transition-all duration-200 leading-tight truncate">
                              {chore.title}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm border border-transparent dark:border-white">
                              ⭐ {chore.points} pts
                            </span>
                            {!chore.predefined && (
                              <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
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
