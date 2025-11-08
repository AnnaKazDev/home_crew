import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../../../db/database.types.ts';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the session token from cookies
    const sessionToken = cookies.get('sb-127-auth-token')?.value;

    if (!sessionToken) {
      return new Response(
        JSON.stringify({
          session: null,
          user: null,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a simple client to decode the JWT token
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return [{ name: 'sb-127-auth-token', value: sessionToken }];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return new Response(
        JSON.stringify({
          session: null,
          user: null,
          error: error.message,
        }),
        {
          status: 200, // Return 200 even on error to avoid client-side issues
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        session: session,
        user: session?.user || null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Session error:', error);
    return new Response(
      JSON.stringify({
        session: null,
        user: null,
        error: 'Internal server error',
      }),
      {
        status: 200, // Return 200 to avoid client-side issues
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
