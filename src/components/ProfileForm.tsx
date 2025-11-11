import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { ProfileDTO } from '@/types';

interface ProfileFormData {
  name: string;
  avatar_url?: string;
  email?: string; // Not used in form, just for type compatibility
}

interface ProfileFormProps {
  profile: ProfileDTO;
  onUpdate: (data: ProfileFormData) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = React.memo(({ profile, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: profile.name,
      avatar_url: profile.avatar_url || '',
      email: profile.email,
    },
  });

  const handleCancel = () => {
    if (form.formState.isDirty) {
      setIsDialogOpen(true);
    } else {
      form.reset();
    }
  };

  const confirmReset = () => {
    form.reset();
    setIsDialogOpen(false);
  };

  const onSubmit = async (data: ProfileFormData) => {
    // Manual validation for name
    if (!data.name || data.name.trim() === '') {
      form.setError('name', { message: 'Name is required' });
      return;
    }
    if (data.name.length > 100) {
      form.setError('name', { message: 'Name can have a maximum of 100 characters' });
      return;
    }

    // Manual validation for avatar_url
    if (data.avatar_url && data.avatar_url.trim() !== '') {
      if (data.avatar_url.length > 500) {
        form.setError('avatar_url', { message: 'URL can have a maximum of 500 characters' });
        return;
      }
      try {
        const url = new URL(data.avatar_url);
        if (url.protocol !== 'https:') {
          form.setError('avatar_url', { message: 'URL must start with https://' });
          return;
        }
      } catch {
        form.setError('avatar_url', { message: 'Invalid URL format' });
        return;
      }
    }

    // Transform empty string to undefined
    const processedData = {
      ...data,
      name: data.name.trim(),
      avatar_url: data.avatar_url && data.avatar_url.trim() !== '' ? data.avatar_url : undefined,
    };

    await onUpdate(processedData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-lg font-medium text-foreground mb-1">
            Your email: <span className="font-bold">{profile.email}</span>
          </label>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-lg font-large text-foreground mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={form.watch('name') || ''}
            onChange={(e) => form.setValue('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
              form.formState.errors.name ? 'border-destructive' : 'border-border'
            }`}
            placeholder="Enter your name"
            maxLength={100}
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Avatar URL
        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium text-foreground mb-1">
            Avatar URL (optional)
          </label>
          <input
            type="url"
            id="avatar_url"
            value={form.watch('avatar_url') || ''}
            onChange={(e) => form.setValue('avatar_url', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
              form.formState.errors.avatar_url ? 'border-destructive' : 'border-border'
            }`}
            placeholder="https://example.com/avatar.jpg"
            maxLength={500}
          />
          {form.formState.errors.avatar_url && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.avatar_url.message}
            </p>
          )}
        </div> */}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={form.formState.isSubmitting}
            className="px-4 py-2 text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              form.formState.isSubmitting ? 'animate-shimmer' : ''
            }`}
          >
            {form.formState.isSubmitting ? 'Updating...' : 'Save Profile'}
          </button>
        </div>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to cancel and reset the form?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReset}>Yes, cancel</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </div>
  );
});

ProfileForm.displayName = 'ProfileForm';

export default ProfileForm;
