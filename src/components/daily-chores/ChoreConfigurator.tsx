import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogItemDTO, MemberDTO } from '@/types';

interface ChoreConfiguratorProps {
  selectedItem: CatalogItemDTO | null;
  customData: Partial<CatalogItemDTO> | null;
  members: MemberDTO[];
  currentDate: string;
  currentUserId?: string;
  onSubmit: (config: { date: string; assignee_id?: string | null }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ChoreConfigurator({
  selectedItem,
  customData,
  members,
  currentDate,
  currentUserId,
  onSubmit,
  onCancel,
  isLoading,
}: ChoreConfiguratorProps) {
  const [config, setConfig] = useState({
    date: currentDate,
    assignee_id: currentUserId || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Update config when currentDate changes
  useEffect(() => {
    setConfig((prev) => ({ ...prev, date: currentDate }));
  }, [currentDate]);

  // Update config when selectedItem changes
  useEffect(() => {
    // No time_of_day to update anymore
  }, [selectedItem, customData]);

  const validateConfig = () => {
    const newErrors: Record<string, string> = {};

    if (!config.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateConfig()) {
      onSubmit({
        date: config.date,
        assignee_id: config.assignee_id,
      });
    }
  };

  const handleChange = (field: string, value: string | null) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      handleChange('date', dateString);
      setIsCalendarOpen(false);
    }
  };

  const currentItem = selectedItem || customData;

  // Sort members so current user appears first
  const sortedMembers = React.useMemo(() => {
    if (!currentUserId) return members;
    return [...members].sort((a, b) => {
      if (a.user_id === currentUserId) return -1;
      if (b.user_id === currentUserId) return 1;
      return 0;
    });
  }, [members, currentUserId]);

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

  return (
    <div data-test-id="chore-configurator" className="space-y-6">
      {/* Preview */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Chore Preview</h3>
        <Card className="border border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <span className="text-4xl flex-shrink-0 mr-4">{currentItem?.emoji || '📋'}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground truncate">
                  {currentItem?.title || 'Custom Chore'}
                  {currentItem?.time_of_day && currentItem.time_of_day !== 'any' && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({getTimeOfDayText(currentItem.time_of_day)})
                    </span>
                  )}
                  {currentItem && !currentItem.predefined && <span className="ml-1">✨</span>}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs truncate text-black">
                    {currentItem?.category || 'No category'}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {currentItem?.points || 0} pts
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-test-id="date-picker-button"
                className={cn(
                  'group flex items-center justify-center w-full px-4 py-3 text-left font-normal border rounded-md bg-background hover:bg-accent hover:text-black focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  errors.date ? 'border-destructive' : 'border-border'
                )}
              >
                <span className="flex-1 text-muted-foreground group-hover:text-black">
                  {config.date
                    ? new Date(config.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Pick a date'}
                </span>
                <CalendarIcon className="h-4 w-4 text-muted-foreground ml-2 group-hover:text-black" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start">
              <Calendar
                mode="single"
                selected={new Date(config.date)}
                onSelect={handleDateSelect}
                initialFocus
                className="rounded-md border-0"
                components={{
                  DayButton: ({ className, ...props }) => (
                    <button
                      {...props}
                      className={cn(
                        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-black h-12 w-12 text-base font-normal',
                        className
                      )}
                    />
                  ),
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="mt-1 text-sm text-destructive">{errors.date}</p>}
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Assign to</label>
          <div className="space-y-2">
            {sortedMembers.map((member) => (
              <label
                key={member.id}
                className="group flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-accent hover:text-black border-2 border-border"
              >
                <input
                  type="radio"
                  name="assignee"
                  value={member.user_id}
                  data-test-id={`assignee-option-${member.user_id}`}
                  checked={config.assignee_id === member.user_id}
                  onChange={(e) => handleChange('assignee_id', e.target.value)}
                  className="text-primary focus:ring-ring"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground group-hover:text-black flex items-center gap-2">
                      {member.name}
                      {member.user_id === currentUserId && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                          you
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground group-hover:text-black">
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </div>
                  </div>
                </div>
              </label>
            ))}

            <label className="group flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-accent hover:text-black border-2 border-border">
              <input
                type="radio"
                name="assignee"
                value=""
                data-test-id="assignee-option-unassigned"
                checked={config.assignee_id === null}
                onChange={() => handleChange('assignee_id', null)}
                className="text-primary focus:ring-ring"
              />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-foreground group-hover:text-black">
                    Unassigned
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-black">
                    Anyone can complete this chore
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-black bg-secondary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            data-test-id="add-chore-submit-button"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
