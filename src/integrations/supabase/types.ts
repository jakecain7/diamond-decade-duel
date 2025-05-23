export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appearances: {
        Row: {
          id: string
          player_id: string
          team_id: string
          year: number
        }
        Insert: {
          id?: string
          player_id: string
          team_id: string
          year: number
        }
        Update: {
          id?: string
          player_id?: string
          team_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "appearances_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appearances_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      batting_stats: {
        Row: {
          "2b": number | null
          "3b": number | null
          AB: number | null
          BB: number | null
          CS: number | null
          G: number | null
          GIDP: number | null
          H: number | null
          HBP: number | null
          HR: number | null
          IBB: number | null
          league_id: string | null
          player_id: string
          R: number | null
          RBI: number | null
          SB: number | null
          SF: number | null
          SH: number | null
          SO: number | null
          stint: number
          team_id: string | null
          year: number
        }
        Insert: {
          "2b"?: number | null
          "3b"?: number | null
          AB?: number | null
          BB?: number | null
          CS?: number | null
          G?: number | null
          GIDP?: number | null
          H?: number | null
          HBP?: number | null
          HR?: number | null
          IBB?: number | null
          league_id?: string | null
          player_id: string
          R?: number | null
          RBI?: number | null
          SB?: number | null
          SF?: number | null
          SH?: number | null
          SO?: number | null
          stint: number
          team_id?: string | null
          year: number
        }
        Update: {
          "2b"?: number | null
          "3b"?: number | null
          AB?: number | null
          BB?: number | null
          CS?: number | null
          G?: number | null
          GIDP?: number | null
          H?: number | null
          HBP?: number | null
          HR?: number | null
          IBB?: number | null
          league_id?: string | null
          player_id?: string
          R?: number | null
          RBI?: number | null
          SB?: number | null
          SF?: number | null
          SH?: number | null
          SO?: number | null
          stint?: number
          team_id?: string | null
          year?: number
        }
        Relationships: []
      }
      games: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
          thumbnail_url: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
          thumbnail_url?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          debut_year: number | null
          final_year: number | null
          id: string
          name_first: string
          name_given: string | null
          name_last: string
        }
        Insert: {
          debut_year?: number | null
          final_year?: number | null
          id: string
          name_first: string
          name_given?: string | null
          name_last: string
        }
        Update: {
          debut_year?: number | null
          final_year?: number | null
          id?: string
          name_first?: string
          name_given?: string | null
          name_last?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      puzzles: {
        Row: {
          col1_label: string
          col2_label: string
          col3_label: string
          created_at: string | null
          id: string
          puzzle_date: string
          row1_label: string
          row2_label: string
        }
        Insert: {
          col1_label: string
          col2_label: string
          col3_label: string
          created_at?: string | null
          id?: string
          puzzle_date: string
          row1_label: string
          row2_label: string
        }
        Update: {
          col1_label?: string
          col2_label?: string
          col3_label?: string
          created_at?: string | null
          id?: string
          puzzle_date?: string
          row1_label?: string
          row2_label?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          league_id: string
          name: string
        }
        Insert: {
          id: string
          league_id: string
          name: string
        }
        Update: {
          id?: string
          league_id?: string
          name?: string
        }
        Relationships: []
      }
      user_game_scores: {
        Row: {
          created_at: string
          game_id: string
          high_score: number
          id: string
          last_played_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          high_score?: number
          id?: string
          last_played_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          high_score?: number
          id?: string
          last_played_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_game_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_similar_players: {
        Args: { typed_name: string }
        Returns: {
          id: string
          name_first: string
          name_last: string
          similarity: number
        }[]
      }
      get_game_leaderboard: {
        Args: { p_game_id: string; p_limit?: number; p_timespan?: string }
        Returns: {
          high_score: number
          player_name: string
        }[]
      }
      get_random_slugger: {
        Args: { exclude_id?: string }
        Returns: {
          id: string
          name_first: string
          name_last: string
          career_hr: number
          debut_year: number
          final_year: number
          teams_played_for_names: string[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
