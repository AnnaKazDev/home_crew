import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { CatalogItemDTO, CreateCatalogItemCmd, UpdateCatalogItemCmd } from '@/types';

/**
 * Zod schema for validating CreateCatalogItemCmd
 * Validates request body when creating a custom chore catalog item
 */
export const CreateCatalogItemCmdSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(50, 'Title must be 50 characters or less')
    .transform((val) => val.trim()),
  category: z
    .string()
    .min(1, 'Category cannot be empty'),
  points: z
    .number()
    .int('Points must be an integer')
    .min(0, 'Points must be at least 0')
    .max(100, 'Points must be at most 100')
    .refine((val) => val % 5 === 0, 'Points must be divisible by 5'),
  time_of_day: z
    .enum(['morning', 'afternoon', 'evening', 'night', 'any'])
    .default('any')
    .optional(),
  emoji: z
    .string()
    .optional()
    .nullable(),
});

/**
 * Zod schema for validating UpdateCatalogItemCmd
 * All fields are optional for partial updates
 */
export const UpdateCatalogItemCmdSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(50, 'Title must be 50 characters or less')
    .transform((val) => val.trim())
    .optional(),
  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .optional(),
  points: z
    .number()
    .int('Points must be an integer')
    .min(0, 'Points must be at least 0')
    .max(100, 'Points must be at most 100')
    .refine((val) => val % 5 === 0, 'Points must be divisible by 5')
    .optional(),
  time_of_day: z
    .enum(['morning', 'afternoon', 'evening', 'night', 'any'])
    .optional(),
  emoji: z
    .string()
    .optional()
    .nullable(),
});

type CreateCatalogItemCmdType = z.infer<typeof CreateCatalogItemCmdSchema>;
type UpdateCatalogItemCmdType = z.infer<typeof UpdateCatalogItemCmdSchema>;

/**
 * Service function to create a new custom chore in the catalog
 * 
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID for which to create the chore
 * @param userId - The user ID creating the chore
 * @param data - Validated CreateCatalogItemCmd data
 * @returns Promise<CatalogItemDTO> - The created catalog item DTO
 * @throws Error if duplicate title exists or database operation fails
 */
export async function createCatalogItem(
  supabase: SupabaseClient<Database>,
  householdId: string,
  userId: string,
  data: CreateCatalogItemCmdType
): Promise<CatalogItemDTO> {
  // Check for duplicate title (case-insensitive, non-deleted only)
  const { data: existingItem, error: checkError } = await supabase
    .from('chores_catalog')
    .select('id')
    .eq('household_id', householdId)
    .ilike('title', data.title)
    .is('deleted_at', null)
    .single();

  // If query returned a result (not just "no rows"), we have a duplicate
  if (existingItem) {
    throw new Error('DUPLICATE_TITLE');
  }

  // Handle unexpected errors in the check query
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking duplicate title:', checkError);
    throw new Error('Database error while checking for duplicates');
  }

  // Insert new catalog item
  const { data: newItem, error: insertError } = await supabase
    .from('chores_catalog')
    .insert({
      household_id: householdId,
      title: data.title,
      category: data.category,
      points: data.points,
      time_of_day: data.time_of_day ?? 'any',
      emoji: data.emoji ?? null,
      created_by_user_id: userId,
      predefined: false, // Custom chores are always non-predefined
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating catalog item:', insertError);
    throw new Error('Failed to create catalog item');
  }

  if (!newItem) {
    throw new Error('Failed to retrieve created catalog item');
  }

  // Map to DTO
  const catalogItemDTO: CatalogItemDTO = {
    id: newItem.id,
    title: newItem.title,
    emoji: newItem.emoji,
    time_of_day: newItem.time_of_day,
    category: newItem.category,
    points: newItem.points,
    predefined: newItem.predefined,
    created_by_user_id: newItem.created_by_user_id,
    created_at: newItem.created_at,
    deleted_at: newItem.deleted_at,
  };

  return catalogItemDTO;
}

/**
 * Service function to fetch all active catalog items for a household
 * 
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID to fetch items for
 * @returns Promise<CatalogItemDTO[]> - Array of catalog items
 * @throws Error if database operation fails
 */
export async function getCatalogItems(
  supabase: SupabaseClient<Database>,
  householdId: string
): Promise<CatalogItemDTO[]> {
  const { data: items, error } = await supabase
    .from('chores_catalog')
    .select('*')
    .eq('household_id', householdId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching catalog items:', error);
    throw new Error('Failed to fetch catalog items');
  }

  if (!items) {
    return [];
  }

  // Map to DTOs
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    emoji: item.emoji,
    time_of_day: item.time_of_day,
    category: item.category,
    points: item.points,
    predefined: item.predefined,
    created_by_user_id: item.created_by_user_id,
    created_at: item.created_at,
    deleted_at: item.deleted_at,
  }));
}

/**
 * Service function to update a catalog item
 * 
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID (for authorization)
 * @param itemId - The catalog item ID to update
 * @param data - Validated partial UpdateCatalogItemCmd data
 * @returns Promise<CatalogItemDTO> - The updated catalog item DTO
 * @throws Error if item not found or update fails
 */
export async function updateCatalogItem(
  supabase: SupabaseClient<Database>,
  householdId: string,
  itemId: string,
  data: UpdateCatalogItemCmdType
): Promise<CatalogItemDTO> {
  // Verify item exists and belongs to this household
  const { data: existingItem, error: checkError } = await supabase
    .from('chores_catalog')
    .select('*')
    .eq('id', itemId)
    .eq('household_id', householdId)
    .is('deleted_at', null)
    .single();

  if (checkError || !existingItem) {
    console.error('Error checking existing item:', checkError);
    throw new Error('NOT_FOUND');
  }

  // Build update payload - only include provided fields
  const updatePayload: Record<string, unknown> = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.points !== undefined) updatePayload.points = data.points;
  if (data.time_of_day !== undefined) updatePayload.time_of_day = data.time_of_day;
  if (data.emoji !== undefined) updatePayload.emoji = data.emoji;

  // If nothing to update, return existing item
  if (Object.keys(updatePayload).length === 0) {
    return mapToDTO(existingItem);
  }

  // If title is being updated, check for duplicates
  if (data.title !== undefined) {
    const { data: duplicateItem } = await supabase
      .from('chores_catalog')
      .select('id')
      .eq('household_id', householdId)
      .ilike('title', data.title)
      .neq('id', itemId)
      .is('deleted_at', null)
      .single();

    if (duplicateItem) {
      throw new Error('DUPLICATE_TITLE');
    }
  }

  // Update the item
  const { data: updatedItem, error: updateError } = await supabase
    .from('chores_catalog')
    .update(updatePayload)
    .eq('id', itemId)
    .eq('household_id', householdId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating catalog item:', updateError);
    throw new Error('Failed to update catalog item');
  }

  if (!updatedItem) {
    throw new Error('Failed to retrieve updated catalog item');
  }

  return mapToDTO(updatedItem);
}

/**
 * Service function to soft-delete a catalog item
 * 
 * @param supabase - SupabaseClient instance
 * @param householdId - The household ID (for authorization)
 * @param itemId - The catalog item ID to delete
 * @throws Error if item not found or deletion fails
 */
export async function deleteCatalogItem(
  supabase: SupabaseClient<Database>,
  householdId: string,
  itemId: string
): Promise<void> {
  // Verify item exists and belongs to this household
  const { data: existingItem, error: checkError } = await supabase
    .from('chores_catalog')
    .select('id')
    .eq('id', itemId)
    .eq('household_id', householdId)
    .is('deleted_at', null)
    .single();

  if (checkError || !existingItem) {
    console.error('Error checking item for deletion:', checkError);
    throw new Error('NOT_FOUND');
  }

  // Soft delete by setting deleted_at
  const { error: deleteError } = await supabase
    .from('chores_catalog')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('household_id', householdId);

  if (deleteError) {
    console.error('Error deleting catalog item:', deleteError);
    throw new Error('Failed to delete catalog item');
  }
}

/**
 * Helper function to map a catalog row to CatalogItemDTO
 */
function mapToDTO(item: Database['public']['Tables']['chores_catalog']['Row']): CatalogItemDTO {
  return {
    id: item.id,
    title: item.title,
    emoji: item.emoji,
    time_of_day: item.time_of_day,
    category: item.category,
    points: item.points,
    predefined: item.predefined,
    created_by_user_id: item.created_by_user_id,
    created_at: item.created_at,
    deleted_at: item.deleted_at,
  };
}
