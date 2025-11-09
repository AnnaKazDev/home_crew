import { create } from 'zustand';
import { getSupabaseClient } from '@/db/supabase.client';
import type { ProfileDTO } from '@/types';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  // State
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  profile: ProfileDTO | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: ProfileDTO | null) => void;
  updateProfile: (data: { name: string; avatar_url?: string | null }) => Promise<void>;

  // Initialization
  initialize: () => Promise<(() => void) | undefined>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  loading: true,
  isAuthenticated: false,
  profile: null,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (loading) => set({ loading }),

  setProfile: (profile) => set({ profile }),

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('profiles').update(data).eq('id', user.id);

    if (error) throw error;

    // Update local state
    const currentProfile = get().profile;
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          ...data,
        },
      });
    }
  },

  // Initialize auth state
  initialize: async () => {
    try {
      const supabase = getSupabaseClient();

      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth error:', error);
        set({ user: null, profile: null, loading: false });
        return;
      }

      if (session?.user) {
        get().setUser(session.user);

        // Fetch profile using Supabase client
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profileData) {
          const profile: ProfileDTO = {
            ...profileData,
            email: session.user.email || '',
            total_points: profileData.total_points || 0,
          };
          set({ profile });
        }
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error('AuthStore: Initialization error:', error);
      set({ user: null, profile: null });
    } finally {
      set({ loading: false });
    }

    // Set up auth listener
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        get().setUser(session.user);

        // Fetch profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profileError && profileData) {
            const profile: ProfileDTO = {
              ...profileData,
              email: session.user.email || '',
              total_points: profileData.total_points || 0,
            };
            set({ profile });
          }
        } catch (fetchError) {
          console.error('AuthStore: Profile fetch error:', fetchError);
        }
      } else {
        set({ user: null, profile: null });
      }

      set({ loading: false });
    });

    return () => subscription.unsubscribe();
  },
}));
