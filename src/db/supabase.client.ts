import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const isServer = import.meta.env.SSR;

// Use PUBLIC_ vars in the browser, fall back to server-only vars on the server
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = isServer ? import.meta.env.SUPABASE_SERVICE_ROLE_KEY : undefined;

export const DEFAULT_USER_ID = "e9d12995-1f3e-491d-9628-3c4137d266d1";

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));

let cachedBrowserClient: ReturnType<typeof createClient<Database>> | null = null;
let cachedServiceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient(): ReturnType<typeof createClient<Database>> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.");
  }
  if (!cachedBrowserClient) {
    const keyToUse = isServer && supabaseServiceKey ? supabaseServiceKey : (supabaseAnonKey as string);
    cachedBrowserClient = createClient<Database>(supabaseUrl as string, keyToUse, {
      auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return cachedBrowserClient;
}

export function getSupabaseServiceClient(): ReturnType<typeof createClient<Database>> {
  if (!isServer) {
    return getSupabaseClient();
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return getSupabaseClient();
  }
  if (!cachedServiceClient) {
    cachedServiceClient = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }
  return cachedServiceClient;
}

export type SupabaseClient = ReturnType<typeof createClient<Database>>;
