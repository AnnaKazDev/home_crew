import { defineMiddleware } from 'astro:middleware';
import { getSupabaseServiceClient } from '../db/supabase.client.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client
  context.locals.supabase = getSupabaseServiceClient();

  // Get the pathname from the URL
  const pathname = context.url.pathname;

  // Pages that require authentication
  const protectedRoutes = ['/profile', '/household', '/daily_chores'];

  // Check if current route requires authentication
  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  if (requiresAuth) {
    // For server-side rendering, we need to check auth server-side
    // Since we're using client-side auth store, we'll let the components handle it
    // But we can still redirect on the client side as implemented in the components
  }

  return next();
});
