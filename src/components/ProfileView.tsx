"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import ProfileForm from "./ProfileForm";
import PointsDisplay from "./PointsDisplay";
import PointsBreakdown from "./PointsBreakdown";

const ProfileView: React.FC = () => {
  const { user, isAuthenticated, loading, profile, updateProfile } = useAuthStore();

  console.log('ProfileView render:', { loading, profile, isAuthenticated, user: user?.id });

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-8 px-4 md:px-8">
        <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto animate-fade-in">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show redirect message
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background pt-8 px-4 md:px-8">
        <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto animate-fade-in">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  // No profile yet - show loading
  if (!profile) {
    return (
      <div className="min-h-screen bg-background pt-8 px-4 md:px-8">
        <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto animate-fade-in">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 px-4 md:px-8">
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-8" id="profile-title">
          User Profile
        </h1>

        <ProfileForm profile={profile} onUpdate={() => {}} />
        <PointsDisplay points={profile.total_points} pointsDateRange={{ firstDate: null, lastDate: null }} />
        <div className="mt-8">
          <PointsBreakdown dailyPoints={[]} loading={false} error={null} />
        </div>
      </div>
    </div>
  );
};


export default ProfileView;
