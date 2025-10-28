import React, { useState, useEffect, useMemo } from 'react';
import type { CatalogItemDTO } from '@/types';

// Mock catalog data for development
const MOCK_CATALOG_ITEMS: CatalogItemDTO[] = [
  {
    id: 'cat-1',
    title: 'Dust furniture',
    emoji: '🪑',
    time_of_day: 'any',
    category: 'Living Room',
    points: 25,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  },
  {
    id: 'cat-2',
    title: 'Wash dishes',
    emoji: '🍽️',
    time_of_day: 'any',
    category: 'Kitchen',
    points: 40,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  },
  {
    id: 'cat-3',
    title: 'Take out trash',
    emoji: '🗑️',
    time_of_day: 'any',
    category: 'Kitchen',
    points: 20,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  },
  {
    id: 'cat-4',
    title: 'Clean stovetop',
    emoji: '🔥',
    time_of_day: 'any',
    category: 'Kitchen',
    points: 60,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  },
  {
    id: 'cat-5',
    title: 'Change bed sheets',
    emoji: '🛌',
    time_of_day: 'any',
    category: 'Bedroom',
    points: 35,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  },
  {
    id: 'cat-6',
    title: 'Clean toilet',
    emoji: '🚽',
    time_of_day: 'any',
    category: 'Bathroom',
    points: 60,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  },
  {
    id: 'cat-7',
    title: 'Make bed',
    emoji: '🛏️',
    time_of_day: 'morning',
    category: 'Bedroom',
    points: 5,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  },
  {
    id: 'cat-8',
    title: 'Feed dog',
    emoji: '🐕',
    time_of_day: 'morning',
    category: 'Pets',
    points: 5,
    predefined: true,
    created_by_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    deleted_at: null
  }
];

interface ChoreCatalogSelectorProps {
  onItemSelect: (item: CatalogItemDTO) => void;
  onCreateCustom: () => void;
}

export function ChoreCatalogSelector({
  onItemSelect,
  onCreateCustom,
}: ChoreCatalogSelectorProps) {
  const [catalogItems, setCatalogItems] = useState<CatalogItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch catalog items on mount
  useEffect(() => {
    fetchCatalogItems();
  }, []);

  const fetchCatalogItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use mock data
      setCatalogItems(MOCK_CATALOG_ITEMS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    const items = catalogItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    console.log('Filtering:', { selectedCategory, searchQuery, totalItems: catalogItems.length, filteredItems: items.length, sampleItem: catalogItems[0]?.category });
    return items;
  }, [catalogItems, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(catalogItems.map(item => item.category)))];

  console.log('ChoreCatalogSelector rendering, items:', catalogItems.length, 'loading:', isLoading, 'categories:', categories);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading chore catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchCatalogItems}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Chore</h3>
        <p className="text-gray-600">Select from existing chores or create a custom one</p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search chores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2" style={{ zIndex: 10, position: 'relative' }}>
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Category clicked:', category, 'current selected:', selectedCategory);
                setSelectedCategory(category);
                console.log('Category set to:', category);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Chore Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="flex items-start space-x-3">
              <span className="text-lg">{item.emoji || '📋'}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.points} pts
                  </span>
                  <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No chores found matching your criteria</p>
        </div>
      )}

      {/* Add Custom Button */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={onCreateCustom}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-700 font-medium"
        >
          Add custom chore
        </button>
      </div>
    </div>
  );
}
