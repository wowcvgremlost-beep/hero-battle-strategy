export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      battles: {
        Row: {
          attacker_id: string
          attacker_power: number
          created_at: string
          defender_id: string | null
          defender_power: number
          exp_reward: number
          gold_reward: number
          id: string
          is_pve: boolean
          winner_id: string | null
        }
        Insert: {
          attacker_id: string
          attacker_power: number
          created_at?: string
          defender_id?: string | null
          defender_power: number
          exp_reward?: number
          gold_reward?: number
          id?: string
          is_pve?: boolean
          winner_id?: string | null
        }
        Update: {
          attacker_id?: string
          attacker_power?: number
          created_at?: string
          defender_id?: string | null
          defender_power?: number
          exp_reward?: number
          gold_reward?: number
          id?: string
          is_pve?: boolean
          winner_id?: string | null
        }
        Relationships: []
      }
      daily_rewards: {
        Row: {
          created_at: string
          id: string
          last_claim_date: string
          streak: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_claim_date?: string
          streak?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_claim_date?: string
          streak?: number
          user_id?: string
        }
        Relationships: []
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_raid_participants: {
        Row: {
          damage_dealt: number
          id: string
          participated_at: string
          raid_id: string
          user_id: string
        }
        Insert: {
          damage_dealt?: number
          id?: string
          participated_at?: string
          raid_id: string
          user_id: string
        }
        Update: {
          damage_dealt?: number
          id?: string
          participated_at?: string
          raid_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_raid_participants_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "guild_raids"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_raids: {
        Row: {
          completed_at: string | null
          created_at: string
          exp_reward: number
          gold_reward: number
          guild_id: string
          id: string
          raid_boss_power: number
          raid_name: string
          status: string
          total_damage: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exp_reward?: number
          gold_reward?: number
          guild_id: string
          id?: string
          raid_boss_power?: number
          raid_name: string
          status?: string
          total_damage?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exp_reward?: number
          gold_reward?: number
          guild_id?: string
          id?: string
          raid_boss_power?: number
          raid_name?: string
          status?: string
          total_damage?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_raids_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          created_at: string
          description: string | null
          experience: number
          icon: string | null
          id: string
          leader_id: string
          level: number
          max_members: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          experience?: number
          icon?: string | null
          id?: string
          leader_id: string
          level?: number
          max_members?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          experience?: number
          icon?: string | null
          id?: string
          leader_id?: string
          level?: number
          max_members?: number
          name?: string
        }
        Relationships: []
      }
      hero_skills: {
        Row: {
          created_at: string
          id: string
          skill_id: string
          skill_level: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill_id: string
          skill_level?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill_id?: string
          skill_level?: number
          user_id?: string
        }
        Relationships: []
      }
      player_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_army: {
        Row: {
          count: number
          created_at: string
          id: string
          unit_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          unit_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          unit_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_artifacts: {
        Row: {
          artifact_id: string
          created_at: string
          id: string
          is_equipped: boolean
          slot: string
          user_id: string
        }
        Insert: {
          artifact_id: string
          created_at?: string
          id?: string
          is_equipped?: boolean
          slot: string
          user_id: string
        }
        Update: {
          artifact_id?: string
          created_at?: string
          id?: string
          is_equipped?: boolean
          slot?: string
          user_id?: string
        }
        Relationships: []
      }
      player_buildings: {
        Row: {
          building_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      player_quests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          quest_id: string
          status: string
          target: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          quest_id: string
          status?: string
          target?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          quest_id?: string
          status?: string
          target?: number
          user_id?: string
        }
        Relationships: []
      }
      player_spells: {
        Row: {
          created_at: string
          id: string
          spell_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          spell_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          spell_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          built_this_turn: boolean
          character_created: boolean
          character_name: string | null
          created_at: string
          day: number
          gold: number
          hero_attack: number
          hero_defense: number
          hero_experience: number
          hero_id: string | null
          hero_knowledge: number
          hero_level: number
          hero_spellpower: number
          id: string
          mana: number
          map_col: number
          map_position: number
          map_row: number
          town: Database["public"]["Enums"]["game_town"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          built_this_turn?: boolean
          character_created?: boolean
          character_name?: string | null
          created_at?: string
          day?: number
          gold?: number
          hero_attack?: number
          hero_defense?: number
          hero_experience?: number
          hero_id?: string | null
          hero_knowledge?: number
          hero_level?: number
          hero_spellpower?: number
          id?: string
          mana?: number
          map_col?: number
          map_position?: number
          map_row?: number
          town?: Database["public"]["Enums"]["game_town"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          built_this_turn?: boolean
          character_created?: boolean
          character_name?: string | null
          created_at?: string
          day?: number
          gold?: number
          hero_attack?: number
          hero_defense?: number
          hero_experience?: number
          hero_id?: string | null
          hero_knowledge?: number
          hero_level?: number
          hero_spellpower?: number
          id?: string
          mana?: number
          map_col?: number
          map_position?: number
          map_row?: number
          town?: Database["public"]["Enums"]["game_town"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_guild_leader: {
        Args: { _guild_id: string; _user_id: string }
        Returns: boolean
      }
      is_guild_member: {
        Args: { _guild_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      game_town:
        | "castle"
        | "rampart"
        | "tower"
        | "inferno"
        | "necropolis"
        | "dungeon"
        | "stronghold"
        | "fortress"
        | "conflux"
        | "cove"
        | "factory"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_town: [
        "castle",
        "rampart",
        "tower",
        "inferno",
        "necropolis",
        "dungeon",
        "stronghold",
        "fortress",
        "conflux",
        "cove",
        "factory",
      ],
    },
  },
} as const
