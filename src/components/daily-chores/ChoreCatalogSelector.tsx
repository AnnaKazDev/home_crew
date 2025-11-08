import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { getCatalogItems } from '@/lib/choresCatalog.service';
import { getSupabaseClient, isSupabaseConfigured } from '@/db/supabase.client';
import type { CatalogItemDTO } from '@/types';

interface ChoreCatalogSelectorProps {
  onItemSelect: (item: CatalogItemDTO) => void;
  onCreateCustom: () => void;
  householdId?: string;
}

export function ChoreCatalogSelector({
  onItemSelect,
  onCreateCustom,
  householdId,
}: ChoreCatalogSelectorProps) {
  const [catalogItems, setCatalogItems] = useState<CatalogItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get time of day text
  const getTimeOfDayText = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return 'morning';
      case 'afternoon':
        return 'afternoon';
      case 'evening':
        return 'evening';
      case 'night':
        return 'night';
      default:
        return '';
    }
  };

  // Fetch catalog items on mount and when householdId changes
  useEffect(() => {
    fetchCatalogItems();
  }, [householdId]);

  const fetchCatalogItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let items: CatalogItemDTO[];

      if (isSupabaseConfigured) {
        // Use Supabase client directly (same as useDailyView)
        items = await getCatalogItems(getSupabaseClient(), householdId || null, 'all');
      } else {
        // Fallback to API mode
        const controller = new AbortController();
        const res = await fetch('/api/v1/catalog?type=all', { signal: controller.signal });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load catalog');
        }
        items = (await res.json()) as CatalogItemDTO[];
      }

      setCatalogItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    const items = catalogItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    console.log('Filtering:', {
      selectedCategory,
      searchQuery,
      totalItems: catalogItems.length,
      filteredItems: items.length,
      sampleItem: catalogItems[0]?.category,
    });
    return items;
  }, [catalogItems, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(catalogItems.map((item) => item.category)))];

  console.log(
    'ChoreCatalogSelector rendering, items:',
    catalogItems.length,
    'loading:',
    isLoading,
    'categories:',
    categories
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading chore catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchCatalogItems}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div data-test-id="chore-catalog-selector" className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Add Chore to Daily View</h3>
        <p className="text-muted-foreground">
          Select from existing chores or define a new one for your household catalog
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search chores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground border-border"
        />

        <div className="flex flex-wrap gap-2" style={{ zIndex: 10, position: 'relative' }}>
          {categories.map((category) => (
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
                  ? 'bg-primary/10 text-primary border-[4px] border-primary/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Chore Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            data-test-id={`chore-catalog-item-${item.id}`}
            onClick={() => onItemSelect(item)}
            className="group p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/50 transition-colors text-left"
          >
            <div className="flex items-start space-x-3">
              <span className="text-4xl flex-shrink-0 mr-4">{item.emoji || '📋'}</span>
              <div className="flex-1">
                <h4 className="font-medium text-foreground text-sm group-hover:text-black">
                  {item.title}
                  {item.time_of_day !== 'any' && (
                    <span className="text-xs text-gray-500 ml-1 group-hover:text-black">
                      ({getTimeOfDayText(item.time_of_day)})
                    </span>
                  )}
                  {!item.predefined && <span className="ml-1">✨</span>}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground border border-primary">
                    {item.category}
                  </span>
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded group-hover:text-black">
                    {item.points} pts
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No chores found matching your criteria</p>
        </div>
      )}

      {/* Add Custom Button */}
      <div className="border-t border-border pt-6">
        <span className="text-primary text-2xl font-bold text-center my-4 block">
          or maybe You would like to..
        </span>
        <button
          onClick={onCreateCustom}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium"
        >
          Add Custom Chore
        </button>
      </div>
    </div>
  );
}
