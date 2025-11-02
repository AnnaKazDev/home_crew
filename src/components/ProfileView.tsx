import { useCallback, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useDailyPoints } from "@/hooks/useDailyPoints";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileForm from "./ProfileForm";
import PointsDisplay from "./PointsDisplay";
import PointsBreakdown from "./PointsBreakdown";

const ProfileView: React.FC = () => {
  const { profile, pointsDateRange, loading, error, updateProfile, refetch: refetchProfile } = useProfile();
  const { dailyPoints, loading: pointsLoading, error: pointsError, refetch: refetchDailyPoints } = useDailyPoints(7);

  const handleUpdate = useCallback(
    async (data: { name: string; avatar_url?: string | null }) => {
      try {
        await updateProfile(data);
        toast.success("Profile updated successfully!");
      } catch (err) {
        toast.error("Failed to update profile");
      }
    },
    [updateProfile]
  );

  // Listen for points data changes from DailyView
  useEffect(() => {
    const handlePointsDataChanged = () => {
      // Refresh profile and daily points data
      refetchProfile();
      refetchDailyPoints();
    };

    window.addEventListener("pointsDataChanged", handlePointsDataChanged);

    return () => {
      window.removeEventListener("pointsDataChanged", handlePointsDataChanged);
    };
  }, [refetchProfile, refetchDailyPoints]);

  if (loading)
    return (
      <div className="min-h-screen bg-background pt-8 px-4 md:px-8" aria-live="polite">
        <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto animate-fade-in">
          {/* Title skeleton */}
          <Skeleton className="h-9 w-48 mb-8" />

          {/* Profile form skeleton */}
          <div className="space-y-6 mb-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Points display skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-12 w-20 mb-4" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Points breakdown skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div role="alert" aria-live="assertive">
        Error: {error}
      </div>
    );
  if (!profile)
    return (
      <div role="status" aria-live="polite">
        Profile not found
      </div>
    );

  return (
    <div className="min-h-screen bg-background pt-8 px-4 md:px-8">
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-8" id="profile-title">
          User Profile
        </h1>
        <ProfileForm profile={profile} onUpdate={handleUpdate} />
        <PointsDisplay points={profile.total_points} pointsDateRange={pointsDateRange} />
        <div className="mt-8">
          <PointsBreakdown dailyPoints={dailyPoints} loading={pointsLoading} error={pointsError} />
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
