import { useCallback, memo } from 'react';
import { useHouseholdManagement } from '@/hooks/useHouseholdManagement';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HouseholdInfo from './HouseholdInfo';
import MembersList from './MembersList';
import type { UpdateHouseholdCmd } from '@/types';

const HouseholdManagementView: React.FC = memo(() => {
  const { isAuthenticated, loading: authLoading } = useAuthRedirect();

  const {
    household,
    members,
    currentUserRole,
    currentUserId,
    isLoading,
    error,
    isUpdatingHousehold,
    isUpdatingMember,
    updateHousehold,
    updateMemberRole,
    removeMember,
  } = useHouseholdManagement();

  const handleUpdateHousehold = useCallback(
    async (updates: UpdateHouseholdCmd) => {
      try {
        await updateHousehold(updates);
        toast.success('Household updated successfully!');
      } catch (err) {
        toast.error('Failed to update household');
      }
    },
    [updateHousehold]
  );

  const handleUpdateMemberRole = useCallback(
    async (memberId: string, role: 'admin' | 'member') => {
      try {
        await updateMemberRole(memberId, role);
        toast.success(`Member role updated to ${role}!`);
      } catch (err) {
        toast.error('Failed to update member role');
      }
    },
    [updateMemberRole]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      try {
        await removeMember(memberId);
        toast.success('Member removed successfully!');
      } catch (err) {
        toast.error('Failed to remove member');
      }
    },
    [removeMember]
  );

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background mt-[88px] pt-[2rem] md:pt-[2.5rem] px-4 md:px-8"
        aria-live="polite"
      >
        <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          {/* Title skeleton */}
          <div className="mb-8">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>

          {/* Household info skeleton */}
          <div className="mt-8 bg-card rounded-lg border p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>

          {/* Members list skeleton */}
          <div className="mt-8 bg-card rounded-lg border p-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background mt-[88px] pt-[2rem] md:pt-[2.5rem] px-4 md:px-8">
        <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 border border-destructive/50 text-destructive bg-destructive/10 rounded-md"
          >
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="min-h-screen bg-background mt-[88px] pt-[2rem] md:pt-[2.5rem] px-4 md:px-8">
        <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
              <h1 className="text-3xl font-bold text-foreground mb-8">Household Setup</h1>
              <p className="text-muted-foreground dark:text-gray-300 mt-2 text-sm sm:text-base">
                Join an existing household or create your own
              </p>
            </div>

            {/* Options */}
            <div className="mt-8 space-y-6">
              <div className="bg-card rounded-lg border p-6 shadow-sm animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-200">
                <h2 className="text-lg font-semibold text-foreground mb-4">Create Household</h2>
                <p className="text-sm text-muted-foreground dark:text-gray-300 mb-6">
                  Create a new household and become its administrator
                </p>
                {/* TODO: Add create household form */}
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  This feature will be available after implementing authentication
                </p>
              </div>

              <div className="bg-card rounded-lg border p-6 shadow-sm animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-300">
                <h2 className="text-lg font-semibold text-foreground mb-4">Join Household</h2>
                <p className="text-sm text-muted-foreground dark:text-gray-300 mb-6">
                  Join an existing household using a PIN code
                </p>
                {/* TODO: Add join household form */}
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  This feature will be available after implementing authentication
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect handled by useAuthRedirect hook
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background mt-[88px] pt-8 px-4 md:px-8">
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl text-primary font-bold text-foreground mb-8" id="household-title">
            Household Management
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-2 text-sm sm:text-base">
            Manage your household settings and members
          </p>
        </div>

        {/* Household Information */}
        <div className="mt-8 bg-card rounded-lg border p-6 shadow-sm">
          <HouseholdInfo
            household={household}
            currentUserRole={currentUserRole}
            onUpdate={handleUpdateHousehold}
            isUpdating={isUpdatingHousehold}
            className=""
          />
        </div>

        {/* Members List */}
        <div className="mt-8 bg-card rounded-lg border p-6 shadow-sm">
          <MembersList
            members={members}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onRemoveMember={handleRemoveMember}
            isUpdating={isUpdatingMember}
            className=""
          />
        </div>
      </div>
    </div>
  );
});

HouseholdManagementView.displayName = 'HouseholdManagementView';

export default HouseholdManagementView;
