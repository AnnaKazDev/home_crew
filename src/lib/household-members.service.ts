import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { MemberDTO, UpdateMemberRoleCmd } from '@/types';

/**
 * Zod schema for validating UpdateMemberRoleCmd
 * Validates request body when updating a household member's role
 */
export const UpdateMemberRoleCmdSchema = z.object({
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: "Role must be either 'admin' or 'member'" }),
  }),
});

type UpdateMemberRoleCmdType = z.infer<typeof UpdateMemberRoleCmdSchema>;

/**
 * Retrieves all members of the current user's household
 *
 * @param supabase - SupabaseClient instance
 * @param userId - ID of the user requesting household members
 * @returns Promise<MemberDTO[]> - Array of household members
 * @throws Error if user not in household or database query fails
 */
export async function getHouseholdMembers(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<MemberDTO[]> {
  // Get user's household ID and role
  const { data: membership, error: membershipError } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', userId)
    .single();

  if (membershipError || !membership) {
    if (membershipError?.code === 'PGRST116') {
      throw new Error('USER_NOT_IN_HOUSEHOLD');
    }
    throw new Error('Database error while retrieving household membership');
  }

  // Get all members of the household with their profile data
  const { data: members, error: membersError } = await supabase
    .from('household_members')
    .select(
      `
      id,
      role,
      joined_at,
      user_id,
      profiles (
        name,
        avatar_url
      )
    `
    )
    .eq('household_id', membership.household_id)
    .order('joined_at', { ascending: true });

  if (membersError) {
    throw new Error('Database error while retrieving household members');
  }

  // Transform to MemberDTO format
  return (members || []).map((member: any) => ({
    id: member.id,
    user_id: member.user_id,
    name: member.profiles?.name || '',
    avatar_url: member.profiles?.avatar_url || null,
    role: member.role,
    joined_at: member.joined_at,
  }));
}

/**
 * Updates a household member's role (admin only)
 *
 * @param supabase - SupabaseClient instance
 * @param memberId - ID of the member to update
 * @param newRole - New role to assign
 * @param currentUserId - ID of the user making the change (must be admin)
 * @returns Promise<MemberDTO> - Updated member data
 * @throws Error if user is not admin, member not found, or update fails
 */
export async function updateMemberRole(
  supabase: SupabaseClient<Database>,
  memberId: string,
  newRole: UpdateMemberRoleCmdType['role'],
  currentUserId: string
): Promise<MemberDTO> {
  // Get current user's membership and role
  const { data: currentUserMembership, error: currentUserError } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', currentUserId)
    .single();

  if (currentUserError || !currentUserMembership) {
    if (currentUserError?.code === 'PGRST116') {
      throw new Error('USER_NOT_IN_HOUSEHOLD');
    }
    throw new Error('Database error while checking user permissions');
  }

  // Check if current user is admin
  if (currentUserMembership.role !== 'admin') {
    throw new Error('NOT_HOUSEHOLD_ADMIN');
  }

  // Get target member's data and verify they belong to same household
  const { data: targetMember, error: targetMemberError } = await supabase
    .from('household_members')
    .select(
      `
      id,
      role,
      joined_at,
      user_id,
      household_id,
      profiles (
        name,
        avatar_url
      )
    `
    )
    .eq('id', memberId)
    .single();

  if (targetMemberError || !targetMember) {
    if (targetMemberError?.code === 'PGRST116') {
      throw new Error('MEMBER_NOT_FOUND');
    }
    throw new Error('Database error while retrieving member');
  }

  // Verify target member belongs to same household
  if (targetMember.household_id !== currentUserMembership.household_id) {
    throw new Error('MEMBER_NOT_IN_SAME_HOUSEHOLD');
  }

  // Prevent removing the last admin
  if (targetMember.role === 'admin' && newRole === 'member') {
    const { data: adminCount, error: adminCountError } = await supabase
      .from('household_members')
      .select('id', { count: 'exact' })
      .eq('household_id', currentUserMembership.household_id)
      .eq('role', 'admin');

    if (adminCountError) {
      throw new Error('Database error while checking admin count');
    }

    if ((adminCount?.length || 0) <= 1) {
      throw new Error('CANNOT_REMOVE_LAST_ADMIN');
    }
  }

  // Update member role
  const { data: updatedMember, error: updateError } = await supabase
    .from('household_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .select(
      `
      id,
      role,
      joined_at,
      user_id,
      profiles (
        name,
        avatar_url
      )
    `
    )
    .single();

  if (updateError) {
    throw new Error('Failed to update member role');
  }

  return {
    id: updatedMember.id,
    user_id: updatedMember.user_id,
    name: updatedMember.profiles?.name || '',
    avatar_url: updatedMember.profiles?.avatar_url || null,
    role: updatedMember.role,
    joined_at: updatedMember.joined_at,
  };
}

/**
 * Removes a member from household (admin only)
 *
 * @param supabase - SupabaseClient instance
 * @param memberId - ID of the member to remove
 * @param currentUserId - ID of the user making the removal (must be admin)
 * @throws Error if user is not admin, member not found, or removal fails
 */
export async function removeHouseholdMember(
  supabase: SupabaseClient<Database>,
  memberId: string,
  currentUserId: string
): Promise<void> {
  // Get current user's membership and role
  const { data: currentUserMembership, error: currentUserError } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', currentUserId)
    .single();

  if (currentUserError || !currentUserMembership) {
    if (currentUserError?.code === 'PGRST116') {
      throw new Error('USER_NOT_IN_HOUSEHOLD');
    }
    throw new Error('Database error while checking user permissions');
  }

  // Check if current user is admin
  if (currentUserMembership.role !== 'admin') {
    throw new Error('NOT_HOUSEHOLD_ADMIN');
  }

  // Get target member's data and verify they belong to same household
  const { data: targetMember, error: targetMemberError } = await supabase
    .from('household_members')
    .select('id, role, user_id, household_id')
    .eq('id', memberId)
    .single();

  if (targetMemberError || !targetMember) {
    if (targetMemberError?.code === 'PGRST116') {
      throw new Error('MEMBER_NOT_FOUND');
    }
    throw new Error('Database error while retrieving member');
  }

  // Verify target member belongs to same household
  if (targetMember.household_id !== currentUserMembership.household_id) {
    throw new Error('MEMBER_NOT_IN_SAME_HOUSEHOLD');
  }

  // Prevent removing self
  if (targetMember.user_id === currentUserId) {
    throw new Error('CANNOT_REMOVE_SELF');
  }

  // Prevent removing the last admin
  if (targetMember.role === 'admin') {
    const { data: adminCount, error: adminCountError } = await supabase
      .from('household_members')
      .select('id', { count: 'exact' })
      .eq('household_id', currentUserMembership.household_id)
      .eq('role', 'admin');

    if (adminCountError) {
      throw new Error('Database error while checking admin count');
    }

    if ((adminCount?.length || 0) <= 1) {
      throw new Error('CANNOT_REMOVE_LAST_ADMIN');
    }
  }

  // Hard delete the member
  const { error: deleteError } = await supabase
    .from('household_members')
    .delete()
    .eq('id', memberId);

  if (deleteError) {
    throw new Error('Failed to remove household member');
  }
}
