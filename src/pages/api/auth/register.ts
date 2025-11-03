import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../db/supabase.client.ts';
import { registerSchema, type RegisterFormData } from '../../../lib/validation/auth.schemas.ts';

// Function to generate a 6-digit PIN
function generatePIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple hash function for PIN (for demo purposes)
function hashPIN(pin: string): string {
  // In production, use proper hashing like bcrypt
  return `hashed_${pin}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData: RegisterFormData = await request.json();

    // Validate input data
    const validationResult = registerSchema.safeParse(formData);
    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validationResult.error.format()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { name, email, password, role, pin } = validationResult.data;

    const supabase = getSupabaseServiceClient();

    // Handle admin registration
    if (role === 'admin') {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!authData.user) {
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Generate PIN for household
      const householdPIN = generatePIN();

      // Create profile (without role column)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          total_points: 0
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway - profile might be created by trigger
      }

      // Create household (without admin_id column)
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert({
          name: `${name}'s Household`,
          pin_hash: hashPIN(householdPIN),
          current_pin: householdPIN
        })
        .select()
        .single();

      if (householdError) {
        console.error('Household creation error:', householdError);
        return new Response(JSON.stringify({ error: 'Failed to create household' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Add admin to household members with role
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: authData.user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        // Continue anyway
      }

      return new Response(JSON.stringify({
        user: authData.user,
        profile: {
          id: authData.user.id,
          name,
          role: 'admin'
        },
        household: householdData,
        pin: householdPIN,
        message: 'Registration successful. Please check your email for confirmation.'
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle member registration
    if (role === 'member' && pin) {
      // First, find household by PIN
      const { data: householdData, error: householdLookupError } = await supabase
        .from('households')
        .select('id, name')
        .eq('current_pin', pin)
        .single();

      if (householdLookupError || !householdData) {
        return new Response(JSON.stringify({ error: 'Invalid PIN. Household not found.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!authData.user) {
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Create profile (without role column)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          total_points: 0
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway - profile might be created by trigger
      }

      // Add member to household with role
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: authData.user.id,
          role: 'member'
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        return new Response(JSON.stringify({ error: 'Failed to join household' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        user: authData.user,
        profile: {
          id: authData.user.id,
          name,
          role: 'member'
        },
        household: householdData,
        message: 'Registration successful. Please check your email for confirmation.'
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid registration data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
