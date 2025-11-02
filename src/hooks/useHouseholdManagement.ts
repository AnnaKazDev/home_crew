import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/db/supabase.client";
import { getHouseholdForUser } from "@/lib/households.service";
import { getHouseholdMembers, removeHouseholdMember } from "@/lib/household-members.service";
import type { HouseholdDTO, MemberDTO, UpdateHouseholdCmd } from "@/types";

interface HouseholdManagementViewModel {
  household: HouseholdDTO | null;
  members: MemberDTO[];
  currentUserRole: 'admin' | 'member';
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
  isUpdatingHousehold: boolean;
  isUpdatingMember: boolean;
}

interface HouseholdManagementActions {
  loadData: () => Promise<void>;
  updateHousehold: (updates: UpdateHouseholdCmd) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

export const useHouseholdManagement = (): HouseholdManagementViewModel & HouseholdManagementActions => {
  const [household, setHousehold] = useState<HouseholdDTO | null>(null);
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member'>('member');
  const [currentUserId] = useState<string>('e9d12995-1f3e-491d-9628-3c4137d266d1'); // Development user
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingHousehold, setIsUpdatingHousehold] = useState(false);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);

  const useApi = !isSupabaseConfigured;

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (useApi) {
        // Use API routes when Supabase is not configured
        const [householdRes, membersRes] = await Promise.all([
          fetch('/api/v1/households/current'),
          fetch('/api/v1/members')
        ]);

        if (!householdRes.ok) {
          throw new Error('Failed to load household data');
        }
        if (!membersRes.ok) {
          throw new Error('Failed to load members data');
        }

        const householdData = await householdRes.json();
        const membersData = await membersRes.json();

        setHousehold(householdData);
        setMembers(membersData);
        setCurrentUserRole(householdData.role || 'member');
      } else {
        // Use Supabase directly
        const supabase = getSupabaseClient();

        const [householdData, membersData] = await Promise.all([
          getHouseholdForUser(supabase, currentUserId),
          getHouseholdMembers(supabase, currentUserId)
        ]);

        setHousehold(householdData);
        setMembers(membersData);

        // Determine current user role
        const currentUserMember = membersData.find(member => member.user_id === currentUserId);
        setCurrentUserRole(currentUserMember?.role || 'member');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(errorMessage);
      console.error('Error loading household data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHousehold = useCallback(async (updates: UpdateHouseholdCmd) => {
    if (!household) return;

    try {
      setIsUpdatingHousehold(true);
      setError(null);

      if (useApi) {
        const res = await fetch(`/api/v1/households/${household.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          throw new Error('Failed to update household');
        }

        const updatedHousehold = await res.json();
        setHousehold(updatedHousehold);
      } else {
        // Use Supabase directly - for now, just update local state
        // In production, this would call updateHousehold service
        const supabase = getSupabaseClient();
        // TODO: Implement updateHousehold call when service is ready
        setHousehold({
          ...household,
          name: updates.name || household.name,
        });
      }
    } catch (err) {
      let errorMessage = 'Failed to update household';

      if (err instanceof Error) {
        // Map specific error messages from backend
        switch (err.message) {
          case 'NOT_HOUSEHOLD_ADMIN':
            errorMessage = 'Only administrators can update household settings';
            break;
          case 'NOT_HOUSEHOLD_MEMBER':
            errorMessage = 'You are not a member of this household';
            break;
          default:
            errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error('Error updating household:', err);
      throw err;
    } finally {
      setIsUpdatingHousehold(false);
    }
  }, [household]);

  const removeMember = useCallback(async (memberId: string) => {
    try {
      setIsUpdatingMember(true);
      setError(null);

      if (useApi) {
        const res = await fetch(`/api/v1/members/${memberId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Failed to remove member');
        }

        setMembers(prev => prev.filter(member => member.id !== memberId));
      } else {
        // Use Supabase directly
        const supabase = getSupabaseClient();
        await removeHouseholdMember(supabase, memberId, currentUserId);
        setMembers(prev => prev.filter(member => member.id !== memberId));
      }
    } catch (err) {
      let errorMessage = 'Failed to remove member';

      if (err instanceof Error) {
        // Map specific error messages from backend
        switch (err.message) {
          case 'NOT_HOUSEHOLD_ADMIN':
            errorMessage = 'Only administrators can remove members';
            break;
          case 'MEMBER_NOT_FOUND':
            errorMessage = 'Member not found';
            break;
          case 'CANNOT_REMOVE_SELF':
            errorMessage = 'You cannot remove yourself from the household';
            break;
          case 'CANNOT_REMOVE_LAST_ADMIN':
            errorMessage = 'Cannot remove the last administrator';
            break;
          case 'NOT_HOUSEHOLD_MEMBER':
            errorMessage = 'You are not a member of this household';
            break;
          default:
            errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error('Error removing member:', err);
      throw err;
    } finally {
      setIsUpdatingMember(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, []);

  return {
    household,
    members,
    currentUserRole,
    currentUserId,
    isLoading,
    error,
    isUpdatingHousehold,
    isUpdatingMember,
    loadData,
    updateHousehold,
    removeMember,
  };
};
