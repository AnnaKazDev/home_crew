import React, { useState } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

    if (formData.emoji) {
      // Count visible characters (graphemes) instead of string length
      // Some emojis are composed of multiple Unicode codepoints but are one visual character
      const graphemeCount = Array.from(formData.emoji).length;
      if (graphemeCount > 2) {
        newErrors.emoji = 'Emoji must be a single character';
      }
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    handleChange('emoji', emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const commonCategories = [
    'Kitchen',
    'Bathroom',
    'Living Room',
    'Bedroom',
    'Laundry',
    'Yard Work',
    'Pets',
    'Shopping',
    'Cleaning',
    'Maintenance',
    'Other',
  ];

  const timeOptions = [
    { value: 'any', label: '🕐 Anytime' },
    { value: 'morning', label: '🌅 Morning' },
    { value: 'afternoon', label: '☀️ Afternoon' },
    { value: 'evening', label: '🌆 Evening' },
    { value: 'night', label: '🌙 Night' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Create Custom Chore</h3>
        <p className="text-muted-foreground">Define a new chore for your household catalog</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="pt-6">
          <label htmlFor="title" className="block text-ml font-medium text-foreground mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
              errors.title ? 'border-destructive' : 'border-border'
            }`}
            placeholder="e.g., Wash dishes"
            maxLength={50}
          />
          {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Category */}
        <div className="pt-6">
          <label htmlFor="category" className="block text-ml font-medium text-foreground mb-1">
            Category *
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger
              id="category"
              className={`w-full ${errors.category ? 'border-destructive' : ''}`}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {commonCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
        </div>

        {/* Points */}
        <div className="pt-6">
          <label htmlFor="points" className="block text-ml font-medium text-foreground mb-1">
            Points (0-100, divisible by 5) *
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleChange('points', Math.max(0, formData.points - 5))}
              disabled={formData.points <= 0}
              className="h-9 w-9 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className={`flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium text-foreground ${
              errors.points ? 'border-destructive' : 'border-border'
            }`}>
              {formData.points} pts
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleChange('points', Math.min(100, formData.points + 5))}
              disabled={formData.points >= 100}
              className="h-9 w-9 p-0 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.points && <p className="mt-1 text-sm text-destructive">{errors.points}</p>}
        </div>

        {/* Time of Day */}
        <div className="pt-6">
          <label className="block text-ml font-medium text-foreground mb-2">Time of Day</label>
          <div className="grid grid-cols-2 gap-2">
            {timeOptions.map((option) => {
              const isSelected = formData.time_of_day === option.value;
              return (
                <label
                  key={option.value}
                  className={`group flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 hover:bg-accent hover:text-black ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="time_of_day"
                    value={option.value}
                    checked={formData.time_of_day === option.value}
                    onChange={(e) => handleChange('time_of_day', e.target.value)}
                    className="text-primary focus:ring-ring"
                  />
                  <span className="text-sm text-foreground group-hover:text-black">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Emoji */}
        <div className="pt-6">
          <label className="block text-ml font-medium text-foreground mb-1">Emoji (optional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="emoji"
              value={formData.emoji}
              onChange={(e) => handleChange('emoji', e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
                errors.emoji ? 'border-destructive' : 'border-border'
              }`}
              placeholder="e.g., 🧽"
              maxLength={2}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-3 py-2 border border-border rounded-md bg-background hover:bg-accent hover:text-accent-foreground text-foreground"
            >
              😀
            </button>
          </div>
          {showEmojiPicker && (
            <div className="mt-2">
              <div className="rounded-md p-1 border border-border">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width="100%"
                  height={300}
                  theme={Theme.DARK}
                  previewConfig={{
                    showPreview: false,
                  }}
                  skinTonesDisabled
                />
              </div>
            </div>
          )}
          {errors.emoji && <p className="mt-1 text-sm text-destructive">{errors.emoji}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-white dark:text-black bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Custom Chore to Catalog
          </button>
        </div>
      </form>
    </div>
  );
}
