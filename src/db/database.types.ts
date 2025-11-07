export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      chore_status_log: {
        Row: {
          changed_by_user_id: string;
          created_at: string;
          daily_chore_id: string;
          id: number;
          new_assignee_id: string | null;
          new_status: Database['public']['Enums']['chore_status'] | null;
          points_delta: number | null;
          previous_assignee_id: string | null;
          previous_status: Database['public']['Enums']['chore_status'] | null;
        };
        Insert: {
          changed_by_user_id: string;
          created_at?: string;
          daily_chore_id: string;
          id?: number;
          new_assignee_id?: string | null;
          new_status?: Database['public']['Enums']['chore_status'] | null;
          points_delta?: number | null;
          previous_assignee_id?: string | null;
          previous_status?: Database['public']['Enums']['chore_status'] | null;
        };
        Update: {
          changed_by_user_id?: string;
          created_at?: string;
          daily_chore_id?: string;
          id?: number;
          new_assignee_id?: string | null;
          new_status?: Database['public']['Enums']['chore_status'] | null;
          points_delta?: number | null;
          previous_assignee_id?: string | null;
          previous_status?: Database['public']['Enums']['chore_status'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chore_status_log_changed_by_user_id_fkey';
            columns: ['changed_by_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chore_status_log_daily_chore_id_fkey';
            columns: ['daily_chore_id'];
            isOneToOne: false;
            referencedRelation: 'daily_chores';
            referencedColumns: ['id'];
          },
        ];
      };
      chores_catalog: {
        Row: {
          category: string;
          created_at: string;
          created_by_user_id: string | null;
          deleted_at: string | null;
          emoji: string | null;
          household_id: string | null;
          id: string;
          points: number;
          predefined: boolean;
          time_of_day: Database['public']['Enums']['time_of_day_type'];
          title: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          created_by_user_id?: string | null;
          deleted_at?: string | null;
          emoji?: string | null;
          household_id?: string | null;
          id?: string;
          points: number;
          predefined?: boolean;
          time_of_day?: Database['public']['Enums']['time_of_day_type'];
          title: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          deleted_at?: string | null;
          emoji?: string | null;
          household_id?: string | null;
          id?: string;
          points?: number;
          predefined?: boolean;
          time_of_day?: Database['public']['Enums']['time_of_day_type'];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chores_catalog_created_by_user_id_fkey';
            columns: ['created_by_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chores_catalog_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_chores: {
        Row: {
          assignee_id: string | null;
          chore_catalog_id: string;
          created_at: string;
          date: string;
          deleted_at: string | null;
          household_id: string;
          id: string;
          points: number;
          status: Database['public']['Enums']['chore_status'];
          time_of_day: Database['public']['Enums']['time_of_day_type'];
          updated_at: string;
        };
        Insert: {
          assignee_id?: string | null;
          chore_catalog_id: string;
          created_at?: string;
          date: string;
          deleted_at?: string | null;
          household_id: string;
          id?: string;
          points: number;
          status?: Database['public']['Enums']['chore_status'];
          time_of_day?: Database['public']['Enums']['time_of_day_type'];
          updated_at?: string;
        };
        Update: {
          assignee_id?: string | null;
          chore_catalog_id?: string;
          created_at?: string;
          date?: string;
          deleted_at?: string | null;
          household_id?: string;
          id?: string;
          points?: number;
          status?: Database['public']['Enums']['chore_status'];
          time_of_day?: Database['public']['Enums']['time_of_day_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_chores_assignee_id_fkey';
            columns: ['assignee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_chores_chore_catalog_id_fkey';
            columns: ['chore_catalog_id'];
            isOneToOne: false;
            referencedRelation: 'chores_catalog';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_chores_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
        ];
      };
      household_members: {
        Row: {
          household_id: string;
          id: string;
          joined_at: string;
          role: Database['public']['Enums']['household_role'];
          user_id: string;
        };
        Insert: {
          household_id: string;
          id?: string;
          joined_at?: string;
          role?: Database['public']['Enums']['household_role'];
          user_id: string;
        };
        Update: {
          household_id?: string;
          id?: string;
          joined_at?: string;
          role?: Database['public']['Enums']['household_role'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'household_members_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'household_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      households: {
        Row: {
          created_at: string;
          current_pin: string;
          id: string;
          name: string;
          pin_expires_at: string | null;
          pin_hash: string;
          timezone: string;
        };
        Insert: {
          created_at?: string;
          current_pin?: string;
          id?: string;
          name: string;
          pin_expires_at?: string | null;
          pin_hash: string;
          timezone?: string;
        };
        Update: {
          created_at?: string;
          current_pin?: string;
          id?: string;
          name?: string;
          pin_expires_at?: string | null;
          pin_hash?: string;
          timezone?: string;
        };
        Relationships: [];
      };
      points_events: {
        Row: {
          created_at: string;
          daily_chore_id: string | null;
          event_type: Database['public']['Enums']['points_event_type'];
          id: number;
          points: number;
          task_date: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          daily_chore_id?: string | null;
          event_type: Database['public']['Enums']['points_event_type'];
          id?: number;
          points: number;
          task_date: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          daily_chore_id?: string | null;
          event_type?: Database['public']['Enums']['points_event_type'];
          id?: number;
          points?: number;
          task_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'points_events_daily_chore_id_fkey';
            columns: ['daily_chore_id'];
            isOneToOne: false;
            referencedRelation: 'daily_chores';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'points_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          name: string;
          total_points: number;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id: string;
          name: string;
          total_points?: number;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          total_points?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      current_user_household_members: {
        Row: {
          household_id: string | null;
          id: string | null;
          joined_at: string | null;
          role: Database['public']['Enums']['household_role'] | null;
          user_id: string | null;
        };
        Insert: {
          household_id?: string | null;
          id?: string | null;
          joined_at?: string | null;
          role?: Database['public']['Enums']['household_role'] | null;
          user_id?: string | null;
        };
        Update: {
          household_id?: string | null;
          id?: string | null;
          joined_at?: string | null;
          role?: Database['public']['Enums']['household_role'] | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'household_members_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'household_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      create_household_with_admin: {
        Args: { p_name: string; p_pin: string; p_user_id: string };
        Returns: {
          current_pin: string;
          id: string;
          name: string;
        }[];
      };
    };
    Enums: {
      chore_status: 'todo' | 'done';
      household_role: 'admin' | 'member';
      points_event_type: 'add' | 'subtract';
      time_of_day_type: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
    };
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      chore_status: ['todo', 'done'],
      household_role: ['admin', 'member'],
      points_event_type: ['add', 'subtract'],
      time_of_day_type: ['morning', 'afternoon', 'evening', 'night', 'any'],
    },
  },
} as const;
