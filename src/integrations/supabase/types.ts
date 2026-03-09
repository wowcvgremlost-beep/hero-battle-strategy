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
      defeated_tiles: {
        Row: {
          id: string
          killed_at: string
          killed_by: string
          tile_key: string
          tile_type: string
        }
        Insert: {
          id?: string
          killed_at?: string
          killed_by: string
          tile_key: string
          tile_type?: string
        }
        Update: {
          id?: string
          killed_at?: string
          killed_by?: string
          tile_key?: string
          tile_type?: string
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
      multiplayer_army: {
        Row: {
          count: number
          id: string
          player_id: string
          unit_name: string
        }
        Insert: {
          count?: number
          id?: string
          player_id: string
          unit_name: string
        }
        Update: {
          count?: number
          id?: string
          player_id?: string
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_army_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_players"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_chat: {
        Row: {
          created_at: string
          id: string
          message: string
          player_name: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          player_name?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          player_name?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_chat_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_defeated_tiles: {
        Row: {
          id: string
          killed_at: string
          killed_by: string
          room_id: string
          tile_key: string
        }
        Insert: {
          id?: string
          killed_at?: string
          killed_by: string
          room_id: string
          tile_key: string
        }
        Update: {
          id?: string
          killed_at?: string
          killed_by?: string
          room_id?: string
          tile_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_defeated_tiles_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_duels: {
        Row: {
          challenger_id: string
          challenger_roll: number | null
          created_at: string
          defender_id: string
          defender_roll: number | null
          gold_stake: number
          id: string
          room_id: string
          status: string
          winner_id: string | null
        }
        Insert: {
          challenger_id: string
          challenger_roll?: number | null
          created_at?: string
          defender_id: string
          defender_roll?: number | null
          gold_stake?: number
          id?: string
          room_id: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          challenger_id?: string
          challenger_roll?: number | null
          created_at?: string
          defender_id?: string
          defender_roll?: number | null
          gold_stake?: number
          id?: string
          room_id?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_duels_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_players: {
        Row: {
          character_name: string | null
          created_at: string
          day: number
          gold: number
          has_ended_turn: boolean
          health: number
          hero_attack: number
          hero_defense: number
          hero_experience: number
          hero_id: string | null
          hero_knowledge: number
          hero_level: number
          hero_spellpower: number
          id: string
          is_ready: boolean
          mana: number
          map_col: number
          map_row: number
          player_number: number
          room_id: string
          status: string
          town: string | null
          user_id: string
        }
        Insert: {
          character_name?: string | null
          created_at?: string
          day?: number
          gold?: number
          has_ended_turn?: boolean
          health?: number
          hero_attack?: number
          hero_defense?: number
          hero_experience?: number
          hero_id?: string | null
          hero_knowledge?: number
          hero_level?: number
          hero_spellpower?: number
          id?: string
          is_ready?: boolean
          mana?: number
          map_col?: number
          map_row?: number
          player_number?: number
          room_id: string
          status?: string
          town?: string | null
          user_id: string
        }
        Update: {
          character_name?: string | null
          created_at?: string
          day?: number
          gold?: number
          has_ended_turn?: boolean
          health?: number
          hero_attack?: number
          hero_defense?: number
          hero_experience?: number
          hero_id?: string | null
          hero_knowledge?: number
          hero_level?: number
          hero_spellpower?: number
          id?: string
          is_ready?: boolean
          mana?: number
          map_col?: number
          map_row?: number
          player_number?: number
          room_id?: string
          status?: string
          town?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_raids: {
        Row: {
          boss_power: number
          created_at: string
          exp_reward: number
          gold_reward: number
          id: string
          raid_name: string
          room_id: string
          status: string
          total_damage: number
        }
        Insert: {
          boss_power?: number
          created_at?: string
          exp_reward?: number
          gold_reward?: number
          id?: string
          raid_name: string
          room_id: string
          status?: string
          total_damage?: number
        }
        Update: {
          boss_power?: number
          created_at?: string
          exp_reward?: number
          gold_reward?: number
          id?: string
          raid_name?: string
          room_id?: string
          status?: string
          total_damage?: number
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_raids_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_rooms: {
        Row: {
          created_at: string
          creator_id: string
          current_round: number
          id: string
          map_size: number
          max_players: number
          password: string
          player_count: number
          room_code: string
          status: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          current_round?: number
          id?: string
          map_size?: number
          max_players?: number
          password?: string
          player_count?: number
          room_code: string
          status?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          current_round?: number
          id?: string
          map_size?: number
          max_players?: number
          password?: string
          player_count?: number
          room_code?: string
          status?: string
        }
        Relationships: []
      }
      multiplayer_trades: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: string
          item_count: number
          item_id: string
          item_type: string
          price: number
          room_id: string
          seller_id: string
          status: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          item_count?: number
          item_id: string
          item_type: string
          price?: number
          room_id: string
          seller_id: string
          status?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          item_count?: number
          item_id?: string
          item_type?: string
          price?: number
          room_id?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_trades_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
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
      player_event_progress: {
        Row: {
          claimed: boolean
          created_at: string
          event_id: string
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          claimed?: boolean
          created_at?: string
          event_id: string
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          claimed?: boolean
          created_at?: string
          event_id?: string
          id?: string
          progress?: number
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
      trade_offers: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: string
          item_count: number
          item_id: string
          item_type: string
          price: number
          seller_id: string
          sold_at: string | null
          status: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          item_count?: number
          item_id: string
          item_type: string
          price?: number
          seller_id: string
          sold_at?: string | null
          status?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          item_count?: number
          item_id?: string
          item_type?: string
          price?: number
          seller_id?: string
          sold_at?: string | null
          status?: string
        }
        Relationships: []
      }
      trade_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          receiver_offer: Json
          resolved_at: string | null
          sender_id: string
          sender_offer: Json
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          receiver_offer?: Json
          resolved_at?: string | null
          sender_id: string
          sender_offer?: Json
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          receiver_offer?: Json
          resolved_at?: string | null
          sender_id?: string
          sender_offer?: Json
          status?: string
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
      is_room_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      join_multiplayer_room: {
        Args: { _password?: string; _room_code: string }
        Returns: Json
      }
      recompute_room_player_count: {
        Args: { _room_id: string }
        Returns: undefined
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
