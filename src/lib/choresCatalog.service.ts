import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { CatalogItemDTO, CreateCatalogItemCmd } from '@/types';

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

type CreateCatalogItemCmdType = z.infer<typeof CreateCatalogItemCmdSchema>;

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
