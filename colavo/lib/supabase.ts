import { createClient } from '@supabase/supabase-js';

// Type definitions for our Supabase database
export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
          message_type: 'text' | 'system' | 'file';
          reply_to: string | null;
          is_edited: boolean;
          edited_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          message_type?: 'text' | 'system' | 'file';
          reply_to?: string | null;
          is_edited?: boolean;
          edited_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          message_type?: 'text' | 'system' | 'file';
          reply_to?: string | null;
          is_edited?: boolean;
          edited_at?: string | null;
        };
      };
      user_presence: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          last_seen: string;
          is_online: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          last_seen?: string;
          is_online?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          last_seen?: string;
          is_online?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using Better Auth instead
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Create a server-side client for API routes
// We'll use anon key and rely on application-level security + RLS
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};

export type SupabaseClient = typeof supabase; 