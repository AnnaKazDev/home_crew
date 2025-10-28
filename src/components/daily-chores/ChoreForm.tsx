import React, { useState } from 'react';
import type { CatalogItemDTO } from '@/types';

interface ChoreFormProps {
  onSubmit: (data: Partial<CatalogItemDTO>) => void;
  onCancel: () => void;
}

export function ChoreForm({ onSubmit, onCancel }: ChoreFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    points: 5,
    time_of_day: 'any' as const,
    emoji: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 50) {
      newErrors.title = 'Title must be 50 characters or less';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.points < 0 || formData.points > 100) {
      newErrors.points = 'Points must be between 0 and 100';
    }

    if (formData.points % 5 !== 0) {
      newErrors.points = 'Points must be divisible by 5';
    }

    if (formData.emoji && formData.emoji.length > 1) {
      newErrors.emoji = 'Emoji must be a single character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        title: formData.title.trim(),
        category: formData.category.trim(),
        points: formData.points,
        time_of_day: formData.time_of_day,
        emoji: formData.emoji || undefined,
      });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const commonCategories = [
    'Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Laundry', 'Yard Work',
    'Pets', 'Shopping', 'Cleaning', 'Maintenance', 'Other'
  ];

  const timeOptions = [
    { value: 'morning', label: '🌅 Morning' },
    { value: 'afternoon', label: '☀️ Afternoon' },
    { value: 'evening', label: '🌙 Evening' },
    { value: 'night', label: '🌃 Night' },
    { value: 'any', label: '⏰ Anytime' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Custom Chore</h3>
        <p className="text-gray-600 dark:text-gray-300">Define a new chore for your household catalog</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="e.g., Wash dishes"
            maxLength={50}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.category ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select a category</option>
            {commonCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>

        {/* Points */}
        <div>
          <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Points (0-100, divisible by 5) *
          </label>
          <input
            type="number"
            id="points"
            value={formData.points}
            onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
            min={0}
            max={100}
            step={5}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.points ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.points && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.points}</p>
          )}
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time of Day
          </label>
          <div className="grid grid-cols-2 gap-2">
            {timeOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="time_of_day"
                  value={option.value}
                  checked={formData.time_of_day === option.value}
                  onChange={(e) => handleChange('time_of_day', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Emoji */}
        <div>
          <label htmlFor="emoji" className="block text-sm font-medium text-gray-700 mb-1">
            Emoji (optional)
          </label>
          <input
            type="text"
            id="emoji"
            value={formData.emoji}
            onChange={(e) => handleChange('emoji', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.emoji ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., 🧽"
            maxLength={1}
          />
          {errors.emoji && (
            <p className="mt-1 text-sm text-red-600">{errors.emoji}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Custom Chore to Catalog
          </button>
        </div>
      </form>
    </div>
  );
}

