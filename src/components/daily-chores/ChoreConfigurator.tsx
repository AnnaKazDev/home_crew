import React, { useState, useEffect } from 'react';
import type { CatalogItemDTO, MemberDTO } from '@/types';

interface ChoreConfiguratorProps {
  selectedItem: CatalogItemDTO | null;
  customData: Partial<CatalogItemDTO> | null;
  members: MemberDTO[];
  onSubmit: (config: {
    date: string;
    time_of_day?: string;
    assignee_id?: string | null;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ChoreConfigurator({
  selectedItem,
  customData,
  members,
  onSubmit,
  onCancel,
  isLoading,
}: ChoreConfiguratorProps) {
  const [config, setConfig] = useState({
    date: new Date().toISOString().split('T')[0],
    time_of_day: selectedItem?.time_of_day || customData?.time_of_day || 'any',
    assignee_id: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update config when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setConfig(prev => ({
        ...prev,
        time_of_day: selectedItem.time_of_day,
      }));
    } else if (customData) {
      setConfig(prev => ({
        ...prev,
        time_of_day: customData.time_of_day || 'any',
      }));
    }
  }, [selectedItem, customData]);

  const validateConfig = () => {
    const newErrors: Record<string, string> = {};

    if (!config.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(config.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Cannot schedule chores in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateConfig()) {
      onSubmit({
        date: config.date,
        time_of_day: config.time_of_day,
        assignee_id: config.assignee_id,
      });
    }
  };

  const handleChange = (field: string, value: string | null) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const timeOptions = [
    { value: 'morning', label: '🌅 Morning', desc: 'Before noon' },
    { value: 'afternoon', label: '☀️ Afternoon', desc: 'Noon to evening' },
    { value: 'evening', label: '🌙 Evening', desc: 'After 6 PM' },
    { value: 'night', label: '🌃 Night', desc: 'After 9 PM' },
    { value: 'any', label: '⏰ Anytime', desc: 'No specific time' },
  ];

  const currentItem = selectedItem || customData;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Chore Preview</h3>
        <div className="flex items-start space-x-3">
          <span className="text-2xl">
            {currentItem?.emoji || '📋'}
          </span>
          <div>
            <h4 className="font-medium text-gray-900">
              {currentItem?.title || 'Custom Chore'}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {currentItem?.points || 0} points
              </span>
              {currentItem?.category && (
                <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                  {currentItem.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={config.date}
            onChange={(e) => handleChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Time of Day
          </label>
          <div className="space-y-2">
            {timeOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="time_of_day"
                  value={option.value}
                  checked={config.time_of_day === option.value}
                  onChange={(e) => handleChange('time_of_day', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Assign to (optional)
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border-2 border-gray-200">
              <input
                type="radio"
                name="assignee"
                value=""
                checked={config.assignee_id === null}
                onChange={() => handleChange('assignee_id', null)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Unassigned</div>
                  <div className="text-sm text-gray-500">Anyone can complete this chore</div>
                </div>
              </div>
            </label>

            {members.map(member => (
              <label key={member.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border-2 border-gray-200">
                <input
                  type="radio"
                  name="assignee"
                  value={member.user_id}
                  checked={config.assignee_id === member.user_id}
                  onChange={(e) => handleChange('assignee_id', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isLoading ? 'Adding...' : 'Add Chore'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

