
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nqugsmhlnunxioauianh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xdWdzbWhsbnVueGlvYXVpYW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MjM2NTcsImV4cCI6MjA2MzQ5OTY1N30.Oq4DS2ALZx8hFMwjjqjEh7Pc1FaePb0idaX_XzkYrqo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Define our custom Database type that includes the puzzles table
export type CustomDatabase = Database & {
  public: {
    Tables: {
      puzzles: {
        Row: {
          id: string;
          puzzle_date: string;
          row1_label: string;
          row2_label: string;
          col1_label: string;
          col2_label: string;
          col3_label: string;
        };
        Insert: {
          id?: string;
          puzzle_date: string;
          row1_label: string;
          row2_label: string;
          col1_label: string;
          col2_label: string;
          col3_label: string;
        };
        Update: {
          id?: string;
          puzzle_date?: string;
          row1_label?: string;
          row2_label?: string;
          col1_label?: string;
          col2_label?: string;
          col3_label?: string;
        };
      };
      players: {
        Row: {
          id: string;
          name_first: string;
          name_last: string;
          name_given: string | null;
          debut_year: number | null;
          final_year: number | null;
        };
        Insert: {
          id: string;
          name_first: string;
          name_last: string;
          name_given?: string | null;
          debut_year?: number | null;
          final_year?: number | null;
        };
        Update: {
          id?: string;
          name_first?: string;
          name_last?: string;
          name_given?: string | null;
          debut_year?: number | null;
          final_year?: number | null;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          league_id: string;
        };
        Insert: {
          id: string;
          name: string;
          league_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          league_id?: string;
        };
      };
      appearances: {
        Row: {
          id: string;
          player_id: string;
          team_id: string;
          year: number;
        };
        Insert: {
          id?: string;
          player_id: string;
          team_id: string;
          year: number;
        };
        Update: {
          id?: string;
          player_id?: string;
          team_id?: string;
          year?: number;
        };
      };
    };
  };
};

export const supabase = createClient<CustomDatabase>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Critical for handling redirects with access tokens in the URL
      storage: localStorage
    }
  }
);
