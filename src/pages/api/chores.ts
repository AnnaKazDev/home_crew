import type { APIRoute } from 'astro';
import { PREDEFINED_CHORES, type PredefinedChore } from '../../models/chores';

export const GET: APIRoute = async () => {
  try {
    // Group chores by category
    const groupedChores = PREDEFINED_CHORES.reduce((acc, chore) => {
      if (!acc[chore.category]) {
        acc[chore.category] = [];
      }
      acc[chore.category].push(chore);
      return acc;
    }, {} as Record<string, PredefinedChore[]>);

    // Validate data before sending
    if (!PREDEFINED_CHORES || PREDEFINED_CHORES.length === 0) {
      return new Response(JSON.stringify({
        error: 'No chores available',
        message: 'Chores data is empty or unavailable'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      chores: PREDEFINED_CHORES,
      groupedChores,
      categories: Object.keys(groupedChores),
      total: PREDEFINED_CHORES.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in /api/chores:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch chores data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
