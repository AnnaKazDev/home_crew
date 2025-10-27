import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey =
  import.meta.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseAnonKey);

export const DEFAULT_USER_ID = "e9d12995-1f3e-491d-9628-3c4137d266d1";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Service role client for bypassing RLS in development
export const supabaseServiceClient = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey)
  : supabaseClient;

console.log("Service role key available:", !!supabaseServiceKey);
console.log("Using service client:", supabaseServiceClient !== supabaseClient);

export type SupabaseClient = typeof supabaseClient;
