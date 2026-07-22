export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          team_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          team_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          team_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_user_id_profiles_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          created_at: string;
          friend_id: string;
          id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          friend_id: string;
          id?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          friend_id?: string;
          id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey";
            columns: ["friend_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_forum_replies: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          topic_id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          topic_id: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          topic_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_forum_replies_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "organization_forum_topics";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_forum_topics: {
        Row: {
          content: string;
          created_at: string;
          created_by: string;
          id: string;
          team_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          created_by: string;
          id?: string;
          team_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          team_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_forum_topics_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      player_stages: {
        Row: {
          added_by: string;
          created_at: string;
          description: string | null;
          id: string;
          points: number;
          stage_name: string;
          team_id: string | null;
          user_id: string;
          verified: boolean;
        };
        Insert: {
          added_by: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          points: number;
          stage_name: string;
          team_id?: string | null;
          user_id: string;
        };
        Update: {
          added_by?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          points?: number;
          stage_name?: string;
          team_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_stages_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      point_transactions: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          points: number;
          transaction_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          points: number;
          transaction_type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          points?: number;
          transaction_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      private_messages: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          message: string;
          recipient_id: string;
          sender_id: string;
          subject: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message: string;
          recipient_id: string;
          sender_id: string;
          subject?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          recipient_id?: string;
          sender_id?: string;
          subject?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "private_messages_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_id: number | null;
          created_at: string;
          full_name: string | null;
          id: string;
          points: number;
          rank_level: number;
          rank_title: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          status: string | null;
          team_id: string | null;
          total_deals: number;
          updated_at: string;
          username: string;
          crystalls: number | null;
        };
        Insert: {
          avatar_id?: number | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          points?: number;
          rank_level?: number;
          rank_title?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          status?: string | null;
          team_id?: string | null;
          total_deals?: number;
          updated_at?: string;
          username: string;
          crystalls?: number | null;
        };
        Update: {
          avatar_id?: number | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          points?: number;
          rank_level?: number;
          rank_title?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          status?: string | null;
          team_id?: string | null;
          total_deals?: number;
          updated_at?: string;
          username?: string;
          crystalls?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      shared_stages: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          points_received: number;
          share_percentage: number;
          shared_with_user_id: string;
          stage_id: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          points_received: number;
          share_percentage?: number;
          shared_with_user_id: string;
          stage_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          points_received?: number;
          share_percentage?: number;
          shared_with_user_id?: string;
          stage_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_stages_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_stages_shared_with_user_id_fkey";
            columns: ["shared_with_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_stages_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "player_stages";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_purchases: {
        Row: {
          id: string;
          item_cost: number;
          item_name: string;
          purchased_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          item_cost: number;
          item_name: string;
          purchased_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          item_cost?: number;
          item_name?: string;
          purchased_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          custom_rank: string | null;
          id: string;
          joined_at: string;
          role: string;
          team_id: string;
          user_id: string;
        };
        Insert: {
          custom_rank?: string | null;
          id?: string;
          joined_at?: string;
          role?: string;
          team_id: string;
          user_id: string;
        };
        Update: {
          custom_rank?: string | null;
          id?: string;
          joined_at?: string;
          role?: string;
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      team_notification_settings: {
        Row: {
          created_at: string;
          id: string;
          notify_new_members: boolean;
          notify_purchases: boolean;
          notify_rank_changes: boolean;
          notify_stage_completion: boolean;
          team_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notify_new_members?: boolean;
          notify_purchases?: boolean;
          notify_rank_changes?: boolean;
          notify_stage_completion?: boolean;
          team_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notify_new_members?: boolean;
          notify_purchases?: boolean;
          notify_rank_changes?: boolean;
          notify_stage_completion?: boolean;
          team_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_notification_settings_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: true;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          name: string;
          treasury_balance: number | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          name: string;
          treasury_balance?: number | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          name?: string;
          treasury_balance?: number | null;
        };
        Relationships: [];
      };
      treasury_transactions: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          stage_name: string;
          team_id: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          stage_name: string;
          team_id: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          stage_name?: string;
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treasury_transactions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_stage_for_self: {
        Args: {
          stage_name_param: string;
          points_param: number;
          description_param?: string;
        };
        Returns: undefined;
      };
      add_treasury_funds: {
        Args: {
          team_id_param: string;
          amount_param: number;
          description_param?: string;
          contributor_user_id?: string;
        };
        Returns: undefined;
      };
      find_user_by_username: {
        Args: { username_param: string };
        Returns: {
          user_id: string;
          username: string;
          full_name: string;
        }[];
      };
      get_team_rankings: {
        Args: Record<PropertyKey, never>;
        Returns: {
          team_id: string;
          team_name: string;
          total_points: number;
          member_count: number;
          avg_points: number;
          treasury_balance: number;
        }[];
      };
      get_topic_team_id: {
        Args: { topic_id_param: string };
        Returns: string;
      };
      is_team_leader: {
        Args: { team_id_param: string; user_id_param: string };
        Returns: boolean;
      };
      is_team_member: {
        Args: { team_id_param: string; user_id_param: string };
        Returns: boolean;
      };
      is_team_member_check: {
        Args: { team_id_param: string; user_id_param: string };
        Returns: boolean;
      };
      is_user_team_member: {
        Args: { team_id_param: string };
        Returns: boolean;
      };
      manage_user_points_by_leader: {
        Args: {
          target_user_id: string;
          points_to_add: number;
          transaction_type_param: string;
          description_param?: string;
          stage_name_param?: string;
        };
        Returns: undefined;
      };
      send_team_notification: {
        Args: {
          team_id_param: string;
          message_text: string;
          notification_type: string;
        };
        Returns: undefined;
      };
      share_stage_with_users: {
        Args: {
          stage_id_param: string;
          user_ids: string[];
          description_param?: string;
        };
        Returns: undefined;
      };
      update_user_points_and_rank: {
        Args: {
          user_id_param: string;
          points_to_add: number;
          transaction_type_param: string;
          description_param?: string;
        };
        Returns: undefined;
      };
      update_user_ranks_after_points_change: {
        Args: { user_ids: string[] };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: "manager" | "closer" | "leader";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      user_role: ["manager", "closer"],
    },
  },
} as const;
