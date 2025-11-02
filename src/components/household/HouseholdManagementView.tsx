import { useCallback, memo } from "react";
import { useHouseholdManagement } from "@/hooks/useHouseholdManagement";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HouseholdInfo from "./HouseholdInfo";
import MembersList from "./MembersList";
import HouseholdSettings from "./HouseholdSettings";
import type { UpdateHouseholdCmd } from "@/types";

const HouseholdManagementView: React.FC = memo(() => {
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
        toast.success("Household updated successfully!");
      } catch (err) {
        toast.error("Failed to update household");
      }
    },
    [updateHousehold]
  );

  const handleUpdateMemberRole = useCallback(
    async (memberId: string, role: "admin" | "member") => {
      try {
        await updateMemberRole(memberId, role);
        toast.success(`Member role updated to ${role}!`);
      } catch (err) {
        toast.error("Failed to update member role");
      }
    },
    [updateMemberRole]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      try {
        await removeMember(memberId);
        toast.success("Member removed successfully!");
      } catch (err) {
        toast.error("Failed to remove member");
      }
    },
    [removeMember]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-8 px-4 md:px-8" aria-live="polite">
        <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500">
          {/* Title skeleton */}
          <div className="mb-8">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>

          {/* Household info skeleton */}
          <Card className="mb-8 animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          {/* Members list skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
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
      <div className="min-h-screen bg-background pt-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div role="alert" className="p-4 border border-blue-500/50 text-blue-700 bg-blue-50 rounded-md">
            You are not a member of any household. Please join or create one first.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Household Management</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your household settings and members
          </p>
        </div>

        {/* Household Information */}
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-200">
          <HouseholdInfo
            household={household}
            currentUserRole={currentUserRole}
            className="mb-6 sm:mb-8"
          />
        </div>

        {/* Members List */}
        <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-300">
          <MembersList
            members={members}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onUpdateRole={handleUpdateMemberRole}
            onRemoveMember={handleRemoveMember}
            isUpdating={isUpdatingMember}
            className="mb-6 sm:mb-8"
          />
        </div>

        {/* Household Settings (Admin only) */}
        {currentUserRole === "admin" && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500">
            <HouseholdSettings
              household={household}
              currentUserRole={currentUserRole}
              onUpdate={handleUpdateHousehold}
              isUpdating={isUpdatingHousehold}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default HouseholdManagementView;
