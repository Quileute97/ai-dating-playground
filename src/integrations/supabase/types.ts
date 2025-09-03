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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          content: string
          created_at: string | null
          fake_user_id: string
          id: string
          is_from_admin: boolean | null
          real_user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          fake_user_id: string
          id?: string
          is_from_admin?: boolean | null
          real_user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          fake_user_id?: string
          id?: string
          is_from_admin?: boolean | null
          real_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_messages_fake_user_id_fkey"
            columns: ["fake_user_id"]
            isOneToOne: false
            referencedRelation: "fake_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          prompt: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          prompt: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          prompt?: string
        }
        Relationships: []
      }
      bank_info: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          id: number
          qr_url: string | null
          updated_at: string | null
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          id?: number
          qr_url?: string | null
          updated_at?: string | null
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          id?: number
          qr_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          user_fake_id: string
          user_real_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          user_fake_id: string
          user_real_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          user_fake_id?: string
          user_real_id?: string
        }
        Relationships: []
      }
      fake_user_posts: {
        Row: {
          content: string | null
          created_at: string | null
          fake_user_id: string
          id: string
          location: Json | null
          media_type: string | null
          media_url: string | null
          sticker: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          fake_user_id: string
          id?: string
          location?: Json | null
          media_type?: string | null
          media_url?: string | null
          sticker?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          fake_user_id?: string
          id?: string
          location?: Json | null
          media_type?: string | null
          media_url?: string | null
          sticker?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fake_user_posts_fake_user_id_fkey"
            columns: ["fake_user_id"]
            isOneToOne: false
            referencedRelation: "fake_users"
            referencedColumns: ["id"]
          },
        ]
      }
      fake_users: {
        Row: {
          age: number | null
          ai_prompt_id: string | null
          album: Json | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          dating_preferences: Json | null
          education: string | null
          gender: string | null
          height: number | null
          id: string
          interests: Json | null
          is_active: boolean | null
          is_dating_active: boolean | null
          job: string | null
          last_active: string | null
          lat: number | null
          lng: number | null
          location_name: string | null
          name: string
        }
        Insert: {
          age?: number | null
          ai_prompt_id?: string | null
          album?: Json | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          dating_preferences?: Json | null
          education?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          interests?: Json | null
          is_active?: boolean | null
          is_dating_active?: boolean | null
          job?: string | null
          last_active?: string | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          name: string
        }
        Update: {
          age?: number | null
          ai_prompt_id?: string | null
          album?: Json | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          dating_preferences?: Json | null
          education?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          interests?: Json | null
          is_active?: boolean | null
          is_dating_active?: boolean | null
          job?: string | null
          last_active?: string | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fake_users_ai_prompt_id_fkey"
            columns: ["ai_prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          sender: string
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          sender: string
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          sender?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payos_invoices: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          order_code: number
          payos_data: Json | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_code: number
          payos_data?: Json | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_code?: number
          payos_data?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          location: Json | null
          media_type: string | null
          media_url: string | null
          sticker: Json | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          location?: Json | null
          media_type?: string | null
          media_url?: string | null
          sticker?: Json | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          location?: Json | null
          media_type?: string | null
          media_url?: string | null
          sticker?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          album: Json | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          dating_preferences: Json | null
          education: string | null
          gender: string | null
          height: number | null
          id: string
          interests: Json | null
          is_dating_active: boolean | null
          is_premium: boolean | null
          job: string | null
          last_active: string | null
          lat: number | null
          lng: number | null
          location_name: string | null
          name: string | null
          premium_expires: string | null
          tai_khoan_hoat_dong: boolean | null
        }
        Insert: {
          age?: number | null
          album?: Json | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          dating_preferences?: Json | null
          education?: string | null
          gender?: string | null
          height?: number | null
          id: string
          interests?: Json | null
          is_dating_active?: boolean | null
          is_premium?: boolean | null
          job?: string | null
          last_active?: string | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          name?: string | null
          premium_expires?: string | null
          tai_khoan_hoat_dong?: boolean | null
        }
        Update: {
          age?: number | null
          album?: Json | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          dating_preferences?: Json | null
          education?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          interests?: Json | null
          is_dating_active?: boolean | null
          is_premium?: boolean | null
          job?: string | null
          last_active?: string | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          name?: string | null
          premium_expires?: string | null
          tai_khoan_hoat_dong?: boolean | null
        }
        Relationships: []
      }
      stranger_queue: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      timeline_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      upgrade_requests: {
        Row: {
          admin_id: string | null
          approved_at: string | null
          bank_info: Json | null
          created_at: string | null
          duration_days: number | null
          expires_at: string | null
          id: string
          note: string | null
          price: number
          status: string
          type: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          approved_at?: string | null
          bank_info?: Json | null
          created_at?: string | null
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          note?: string | null
          price: number
          status?: string
          type: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          approved_at?: string | null
          bank_info?: Json | null
          created_at?: string | null
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          note?: string | null
          price?: number
          status?: string
          type?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_likes: {
        Row: {
          created_at: string | null
          id: string
          liked_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked_id: string
          liker_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          liked_id?: string
          liker_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      comment_on_fake_post: {
        Args: {
          content_param: string
          post_id_param: string
          user_id_param: string
        }
        Returns: string
      }
      create_conversation_with_fake_user: {
        Args: { fake_user_id: string; real_user_id: string }
        Returns: string
      }
      get_fake_users_for_dating: {
        Args: {
          gender_pref?: string
          max_age?: number
          max_distance?: number
          min_age?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          age: number
          album: Json
          avatar: string
          bio: string
          distance_km: number
          education: string
          gender: string
          height: number
          id: string
          interests: Json
          job: string
          lat: number
          lng: number
          location_name: string
          name: string
        }[]
      }
      get_timeline_with_fake_posts: {
        Args: {
          limit_param?: number
          offset_param?: number
          user_id_param?: string
        }
        Returns: {
          comment_count: number
          content: string
          created_at: string
          id: string
          is_fake_user: boolean
          like_count: number
          location: Json
          media_type: string
          media_url: string
          sticker: Json
          user_age: number
          user_avatar: string
          user_gender: string
          user_has_liked: boolean
          user_id: string
          user_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      like_fake_post: {
        Args: { post_id_param: string; user_id_param: string }
        Returns: undefined
      }
      like_fake_user: {
        Args: {
          liked_id_param: string
          liked_type_param: string
          liker_id_param: string
          liker_type_param: string
        }
        Returns: boolean
      }
      send_friend_request_to_fake_user: {
        Args: { fake_user_id: string; real_user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
