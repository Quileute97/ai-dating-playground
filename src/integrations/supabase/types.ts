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
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string | null
          buyer_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          content_id: string | null
          created_at: string | null
          gross_amount: number | null
          id: string
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          affiliate_id?: string | null
          buyer_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          content_id?: string | null
          created_at?: string | null
          gross_amount?: number | null
          id?: string
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          affiliate_id?: string | null
          buyer_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          content_id?: string | null
          created_at?: string | null
          gross_amount?: number | null
          id?: string
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          clicks: number | null
          code: string
          content_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          clicks?: number | null
          code: string
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          clicks?: number | null
          code?: string
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          created_at: string | null
          referral_code: string
          total_commission: number | null
          total_referrals: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          referral_code: string
          total_commission?: number | null
          total_referrals?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          referral_code?: string
          total_commission?: number | null
          total_referrals?: number | null
          user_id?: string
        }
        Relationships: []
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
      content_purchases: {
        Row: {
          amount: number
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          comment: string | null
          content_id: string
          created_at: string | null
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          content_id: string
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          content_id?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      content_uploads: {
        Row: {
          admin_note: string | null
          article_body: string | null
          average_rating: number | null
          created_at: string | null
          creator_id: string
          description: string | null
          difficulty: string | null
          download_count: number | null
          drive_file_id: string | null
          duration_minutes: number | null
          embed_url: string | null
          file_url: string | null
          id: string
          like_count: number | null
          price: number | null
          program: string | null
          question_count: number | null
          status: string | null
          subject_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          university_id: string | null
          updated_at: string | null
          view_count: number | null
          year_level: string | null
        }
        Insert: {
          admin_note?: string | null
          article_body?: string | null
          average_rating?: number | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          difficulty?: string | null
          download_count?: number | null
          drive_file_id?: string | null
          duration_minutes?: number | null
          embed_url?: string | null
          file_url?: string | null
          id?: string
          like_count?: number | null
          price?: number | null
          program?: string | null
          question_count?: number | null
          status?: string | null
          subject_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type?: string
          university_id?: string | null
          updated_at?: string | null
          view_count?: number | null
          year_level?: string | null
        }
        Update: {
          admin_note?: string | null
          article_body?: string | null
          average_rating?: number | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          difficulty?: string | null
          download_count?: number | null
          drive_file_id?: string | null
          duration_minutes?: number | null
          embed_url?: string | null
          file_url?: string | null
          id?: string
          like_count?: number | null
          price?: number | null
          program?: string | null
          question_count?: number | null
          status?: string | null
          subject_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          university_id?: string | null
          updated_at?: string | null
          view_count?: number | null
          year_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_uploads_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_uploads_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_uploads_year_level_fkey"
            columns: ["year_level"]
            isOneToOne: false
            referencedRelation: "year_levels"
            referencedColumns: ["code"]
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
      creator_applications: {
        Row: {
          admin_note: string | null
          avatar_url: string | null
          bank_info: Json | null
          bio: string | null
          created_at: string | null
          full_name: string
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          avatar_url?: string | null
          bank_info?: Json | null
          bio?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_note?: string | null
          avatar_url?: string | null
          bank_info?: Json | null
          bio?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creator_tests: {
        Row: {
          access: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          difficulty: Database["public"]["Enums"]["test_difficulty"] | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          passing_score: number | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["test_status"] | null
          subject: string | null
          title: string
          topic: string | null
          total_points: number | null
          total_questions: number | null
          updated_at: string | null
        }
        Insert: {
          access?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["test_difficulty"] | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          passing_score?: number | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["test_status"] | null
          subject?: string | null
          title: string
          topic?: string | null
          total_points?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Update: {
          access?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["test_difficulty"] | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          passing_score?: number | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["test_status"] | null
          subject?: string | null
          title?: string
          topic?: string | null
          total_points?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          passed: boolean | null
          score: number | null
          test_id: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          passed?: boolean | null
          score?: number | null
          test_id: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          passed?: boolean | null
          score?: number | null
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "creator_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "exam_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_comments: {
        Row: {
          content: string
          created_at: string
          exam_id: string
          id: string
          is_pinned: boolean
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          exam_id: string
          id?: string
          is_pinned?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          exam_id?: string
          id?: string
          is_pinned?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_comments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "exam_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_submissions: {
        Row: {
          answers: Json
          correct_count: number
          created_at: string
          duration_seconds: number
          exam_id: string
          id: string
          score: number
          total_count: number
          user_id: string
        }
        Insert: {
          answers?: Json
          correct_count?: number
          created_at?: string
          duration_seconds?: number
          exam_id: string
          id?: string
          score?: number
          total_count?: number
          user_id: string
        }
        Update: {
          answers?: Json
          correct_count?: number
          created_at?: string
          duration_seconds?: number
          exam_id?: string
          id?: string
          score?: number
          total_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          question_count: number
          slug: string
          subject_id: string
          tier: string
          title: string
          updated_at: string
          year_level: number
        }
        Insert: {
          created_at?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          question_count?: number
          slug: string
          subject_id: string
          tier?: string
          title: string
          updated_at?: string
          year_level?: number
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          question_count?: number
          slug?: string
          subject_id?: string
          tier?: string
          title?: string
          updated_at?: string
          year_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      fake_post_comments: {
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
            foreignKeyName: "fake_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fake_user_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      fake_post_likes: {
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
            foreignKeyName: "fake_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fake_user_posts"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      questions: {
        Row: {
          content: string
          correct_option: string
          created_at: string
          exam_id: string
          explanation: string
          id: string
          options: Json
          order_index: number
        }
        Insert: {
          content: string
          correct_option: string
          created_at?: string
          exam_id: string
          explanation?: string
          id?: string
          options?: Json
          order_index?: number
        }
        Update: {
          content?: string
          correct_option?: string
          created_at?: string
          exam_id?: string
          explanation?: string
          id?: string
          options?: Json
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      star_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          note: string | null
          order_code: string | null
          related_post_id: string | null
          related_user_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          note?: string | null
          order_code?: string | null
          related_post_id?: string | null
          related_user_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          note?: string | null
          order_code?: string | null
          related_post_id?: string | null
          related_user_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
          views_count?: number | null
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
      study_activity: {
        Row: {
          activity_date: string
          created_at: string
          id: string
          points: number
          user_id: string
        }
        Insert: {
          activity_date?: string
          created_at?: string
          id?: string
          points?: number
          user_id: string
        }
        Update: {
          activity_date?: string
          created_at?: string
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          order_index: number | null
          points: number | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"] | null
          test_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"] | null
          test_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"] | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "creator_tests"
            referencedColumns: ["id"]
          },
        ]
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
      universities: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          short_name: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          short_name?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          short_name?: string | null
          slug?: string
          sort_order?: number | null
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
      user_stars: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          last_daily_claim: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          last_daily_claim?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          last_daily_claim?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          last_active_date: string | null
          longest_streak: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          order_code: string | null
          package_type: string
          payment_amount: number | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          order_code?: string | null
          package_type: string
          payment_amount?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          order_code?: string | null
          package_type?: string
          payment_amount?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vmed_payouts: {
        Row: {
          account_info: Json
          admin_note: string | null
          amount: number
          created_at: string | null
          creator_id: string
          id: string
          method: string
          processed_at: string | null
          status: string | null
        }
        Insert: {
          account_info: Json
          admin_note?: string | null
          amount: number
          created_at?: string | null
          creator_id: string
          id?: string
          method: string
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          account_info?: Json
          admin_note?: string | null
          amount?: number
          created_at?: string | null
          creator_id?: string
          id?: string
          method?: string
          processed_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      vmed_profiles: {
        Row: {
          avatar_url: string | null
          bank_account: Json | null
          created_at: string
          creator_bio: string | null
          current_year_level: string | null
          full_name: string
          is_pro: boolean
          is_verified_creator: boolean | null
          onboarding_completed: boolean | null
          onboarding_quiz_score: number | null
          payout_status: string | null
          pro_expires_at: string | null
          role: Database["public"]["Enums"]["vmed_role"] | null
          total_earnings: number | null
          updated_at: string
          user_id: string
          weak_subjects: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bank_account?: Json | null
          created_at?: string
          creator_bio?: string | null
          current_year_level?: string | null
          full_name?: string
          is_pro?: boolean
          is_verified_creator?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_quiz_score?: number | null
          payout_status?: string | null
          pro_expires_at?: string | null
          role?: Database["public"]["Enums"]["vmed_role"] | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          weak_subjects?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bank_account?: Json | null
          created_at?: string
          creator_bio?: string | null
          current_year_level?: string | null
          full_name?: string
          is_pro?: boolean
          is_verified_creator?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_quiz_score?: number | null
          payout_status?: string | null
          pro_expires_at?: string | null
          role?: Database["public"]["Enums"]["vmed_role"] | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          weak_subjects?: string[] | null
        }
        Relationships: []
      }
      vmed_royalties: {
        Row: {
          content_id: string | null
          created_at: string | null
          creator_id: string | null
          creator_share: number | null
          gross_revenue: number | null
          id: string
          month: string
          payout_id: string | null
          platform_share: number | null
          status: string | null
          total_sales: number | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          creator_share?: number | null
          gross_revenue?: number | null
          id?: string
          month: string
          payout_id?: string | null
          platform_share?: number | null
          status?: string | null
          total_sales?: number | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          creator_share?: number | null
          gross_revenue?: number | null
          id?: string
          month?: string
          payout_id?: string | null
          platform_share?: number | null
          status?: string | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vmed_royalties_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vmed_royalties_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "vmed_payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      vmed_transactions: {
        Row: {
          amount: number
          buyer_id: string
          content_id: string | null
          created_at: string | null
          creator_earnings: number
          creator_id: string | null
          id: string
          paid_out: boolean | null
          payment_method: string | null
          payment_status: string | null
          platform_fee: number
          transaction_id: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          content_id?: string | null
          created_at?: string | null
          creator_earnings: number
          creator_id?: string | null
          id?: string
          paid_out?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee: number
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          content_id?: string | null
          created_at?: string | null
          creator_earnings?: number
          creator_id?: string | null
          id?: string
          paid_out?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vmed_transactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      year_levels: {
        Row: {
          code: string
          label: string
          program: string | null
          sort_order: number
        }
        Insert: {
          code: string
          label: string
          program?: string | null
          sort_order: number
        }
        Update: {
          code?: string
          label?: string
          program?: string | null
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      vmed_profiles_public: {
        Row: {
          avatar_url: string | null
          creator_bio: string | null
          full_name: string | null
          is_verified_creator: boolean | null
          role: Database["public"]["Enums"]["vmed_role"] | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          creator_bio?: string | null
          full_name?: string | null
          is_verified_creator?: boolean | null
          role?: Database["public"]["Enums"]["vmed_role"] | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          creator_bio?: string | null
          full_name?: string | null
          is_verified_creator?: boolean | null
          role?: Database["public"]["Enums"]["vmed_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_daily_stars: {
        Args: { daily_amount?: number; user_id_param: string }
        Returns: boolean
      }
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
      donate_stars: {
        Args: {
          amount_param: number
          note_param?: string
          post_id_param?: string
          receiver_id_param: string
          sender_id_param: string
        }
        Returns: boolean
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
      increment_creator_earnings: {
        Args: { amount: number; profile_id: string }
        Returns: undefined
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
      trigger_sitemap_ping: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
      question_type: "multiple_choice" | "true_false" | "essay"
      test_difficulty: "easy" | "medium" | "hard"
      test_status: "draft" | "published" | "archived"
      vmed_role: "student" | "creator" | "admin"
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
      question_type: ["multiple_choice", "true_false", "essay"],
      test_difficulty: ["easy", "medium", "hard"],
      test_status: ["draft", "published", "archived"],
      vmed_role: ["student", "creator", "admin"],
    },
  },
} as const
