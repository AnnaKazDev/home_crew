import { defineMiddleware } from "astro:middleware";
import { getSupabaseServiceClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client
  context.locals.supabase = getSupabaseServiceClient();

  // Authentication is handled client-side by auth store
  // This allows for better SPA-like experience
  return next();
});
