import { defineMiddleware } from "astro:middleware";

import { getSupabaseServiceClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = getSupabaseServiceClient();
  return next();
});
