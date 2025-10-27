import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!supabaseAnonKey && !supabaseServiceKey) {
  throw new Error("Either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is required");
}

export const DEFAULT_USER_ID = "e9d12995-1f3e-491d-9628-3c4137d266d1";

export const supabaseClient = supabaseServiceKey ? createClient<Database>(supabaseUrl, supabaseServiceKey) : createClient<Database>(supabaseUrl, supabaseAnonKey);

// Service role client for bypassing RLS in development
export const supabaseServiceClient = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey)
  : supabaseClient;


export type SupabaseClient = typeof supabaseClient;
