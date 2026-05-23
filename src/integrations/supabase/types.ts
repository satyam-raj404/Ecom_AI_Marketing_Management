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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          created_by: string | null
          end_time: string | null
          google_event_id: string | null
          id: string
          start_time: string | null
          title: string
          type: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          google_event_id?: string | null
          id?: string
          start_time?: string | null
          title: string
          type?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          google_event_id?: string | null
          id?: string
          start_time?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      content_runs: {
        Row: {
          completed_at: string | null
          current_step: string | null
          error_message: string | null
          facebook_image_path: string | null
          facebook_post: string | null
          facebook_post_url: string | null
          facebook_posted: boolean | null
          id: string
          image_prompt: string | null
          instagram_image_path: string | null
          instagram_post: string | null
          instagram_post_url: string | null
          instagram_posted: boolean | null
          linkedin_image_path: string | null
          linkedin_post: string | null
          linkedin_post_url: string | null
          linkedin_posted: boolean | null
          run_date: string
          started_at: string | null
          status: string
          step_progress: Json | null
          user_id: string
          x_image_path: string | null
          x_post: string | null
          x_post_url: string | null
          x_posted: boolean | null
        }
        Insert: {
          completed_at?: string | null
          current_step?: string | null
          error_message?: string | null
          facebook_image_path?: string | null
          facebook_post?: string | null
          facebook_post_url?: string | null
          facebook_posted?: boolean | null
          id?: string
          image_prompt?: string | null
          instagram_image_path?: string | null
          instagram_post?: string | null
          instagram_post_url?: string | null
          instagram_posted?: boolean | null
          linkedin_image_path?: string | null
          linkedin_post?: string | null
          linkedin_post_url?: string | null
          linkedin_posted?: boolean | null
          run_date: string
          started_at?: string | null
          status?: string
          step_progress?: Json | null
          user_id: string
          x_image_path?: string | null
          x_post?: string | null
          x_post_url?: string | null
          x_posted?: boolean | null
        }
        Update: {
          completed_at?: string | null
          current_step?: string | null
          error_message?: string | null
          facebook_image_path?: string | null
          facebook_post?: string | null
          facebook_post_url?: string | null
          facebook_posted?: boolean | null
          id?: string
          image_prompt?: string | null
          instagram_image_path?: string | null
          instagram_post?: string | null
          instagram_post_url?: string | null
          instagram_posted?: boolean | null
          linkedin_image_path?: string | null
          linkedin_post?: string | null
          linkedin_post_url?: string | null
          linkedin_posted?: boolean | null
          run_date?: string
          started_at?: string | null
          status?: string
          step_progress?: Json | null
          user_id?: string
          x_image_path?: string | null
          x_post?: string | null
          x_post_url?: string | null
          x_posted?: boolean | null
        }
        Relationships: []
      }
      customer_feedback: {
        Row: {
          added_at: string | null
          added_by: string | null
          customer_name: string
          id: string
          quote: string
          sentiment: string | null
          source: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          customer_name: string
          id?: string
          quote: string
          sentiment?: string | null
          source?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          customer_name?: string
          id?: string
          quote?: string
          sentiment?: string | null
          source?: string | null
        }
        Relationships: []
      }
      monthly_targets: {
        Row: {
          demos_target: number | null
          emails_target: number | null
          follower_targets: Json | null
          hero_metric: string | null
          id: string
          leads_target: number | null
          month_year: string
          rd_tasks_target: number | null
          updated_at: string | null
        }
        Insert: {
          demos_target?: number | null
          emails_target?: number | null
          follower_targets?: Json | null
          hero_metric?: string | null
          id?: string
          leads_target?: number | null
          month_year: string
          rd_tasks_target?: number | null
          updated_at?: string | null
        }
        Update: {
          demos_target?: number | null
          emails_target?: number | null
          follower_targets?: Json | null
          hero_metric?: string | null
          id?: string
          leads_target?: number | null
          month_year?: string
          rd_tasks_target?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pipeline_leads: {
        Row: {
          city: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_contacted: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          owner: string | null
          phone: string | null
          source: string | null
          stage: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          owner?: string | null
          phone?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          owner?: string | null
          phone?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          access_token: string | null
          connected_at: string | null
          id: string
          metadata: Json
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          status: string
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          id?: string
          metadata?: Json
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          id?: string
          metadata?: Json
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reddit_opportunities: {
        Row: {
          author: string | null
          found_at: string | null
          id: string
          keywords: string[] | null
          post_title: string | null
          post_url: string | null
          status: string | null
          subreddit: string
          suggested_reply: string | null
        }
        Insert: {
          author?: string | null
          found_at?: string | null
          id?: string
          keywords?: string[] | null
          post_title?: string | null
          post_url?: string | null
          status?: string | null
          subreddit: string
          suggested_reply?: string | null
        }
        Update: {
          author?: string | null
          found_at?: string | null
          id?: string
          keywords?: string[] | null
          post_title?: string | null
          post_url?: string | null
          status?: string | null
          subreddit?: string
          suggested_reply?: string | null
        }
        Relationships: []
      }
      sheet_connections: {
        Row: {
          access_token: string | null
          connected_at: string | null
          id: string
          refresh_token: string | null
          sheet_id: string | null
          sheet_name: string | null
          sheet_url: string | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          id?: string
          refresh_token?: string | null
          sheet_id?: string | null
          sheet_name?: string | null
          sheet_url?: string | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          id?: string
          refresh_token?: string | null
          sheet_id?: string | null
          sheet_name?: string | null
          sheet_url?: string | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_ideas: {
        Row: {
          author: string
          created_at: string | null
          id: string
          status: string | null
          text: string
          type: string | null
          voted_by: string[] | null
          votes: number | null
        }
        Insert: {
          author: string
          created_at?: string | null
          id?: string
          status?: string | null
          text: string
          type?: string | null
          voted_by?: string[] | null
          votes?: number | null
        }
        Update: {
          author?: string
          created_at?: string | null
          id?: string
          status?: string | null
          text?: string
          type?: string | null
          voted_by?: string[] | null
          votes?: number | null
        }
        Relationships: []
      }
      team_notes: {
        Row: {
          author: string
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          is_win: boolean | null
          title: string
        }
        Insert: {
          author: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_win?: boolean | null
          title: string
        }
        Update: {
          author?: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_win?: boolean | null
          title?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_model: string | null
          anthropic_key: string | null
          auto_run_enabled: boolean | null
          auto_run_time: string | null
          created_at: string | null
          id: string
          image_model_key: string | null
          image_model_provider: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          anthropic_key?: string | null
          auto_run_enabled?: boolean | null
          auto_run_time?: string | null
          created_at?: string | null
          id?: string
          image_model_key?: string | null
          image_model_provider?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_model?: string | null
          anthropic_key?: string | null
          auto_run_enabled?: boolean | null
          auto_run_time?: string | null
          created_at?: string | null
          id?: string
          image_model_key?: string | null
          image_model_provider?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_kpis: {
        Row: {
          amitav_tasks: string[] | null
          best_content_reason: string | null
          best_content_type: string | null
          created_at: string | null
          demos_completed: number | null
          dipali_tasks: string[] | null
          facebook_followers: number | null
          filled_at: string | null
          filled_by: string | null
          id: string
          instagram_followers: number | null
          linkedin_followers: number | null
          new_leads: number | null
          pilots_started: number | null
          rd_tasks_completed: number | null
          rd_tasks_pending: number | null
          rd_top_items: string[] | null
          satyam_tasks: string[] | null
          top_post_engagement: number | null
          top_post_platform: string | null
          top_post_url: string | null
          top_reel_platform: string | null
          top_reel_thumbnail: string | null
          top_reel_url: string | null
          top_reel_views: number | null
          updated_at: string | null
          week_of: string
          x_followers: number | null
        }
        Insert: {
          amitav_tasks?: string[] | null
          best_content_reason?: string | null
          best_content_type?: string | null
          created_at?: string | null
          demos_completed?: number | null
          dipali_tasks?: string[] | null
          facebook_followers?: number | null
          filled_at?: string | null
          filled_by?: string | null
          id?: string
          instagram_followers?: number | null
          linkedin_followers?: number | null
          new_leads?: number | null
          pilots_started?: number | null
          rd_tasks_completed?: number | null
          rd_tasks_pending?: number | null
          rd_top_items?: string[] | null
          satyam_tasks?: string[] | null
          top_post_engagement?: number | null
          top_post_platform?: string | null
          top_post_url?: string | null
          top_reel_platform?: string | null
          top_reel_thumbnail?: string | null
          top_reel_url?: string | null
          top_reel_views?: number | null
          updated_at?: string | null
          week_of: string
          x_followers?: number | null
        }
        Update: {
          amitav_tasks?: string[] | null
          best_content_reason?: string | null
          best_content_type?: string | null
          created_at?: string | null
          demos_completed?: number | null
          dipali_tasks?: string[] | null
          facebook_followers?: number | null
          filled_at?: string | null
          filled_by?: string | null
          id?: string
          instagram_followers?: number | null
          linkedin_followers?: number | null
          new_leads?: number | null
          pilots_started?: number | null
          rd_tasks_completed?: number | null
          rd_tasks_pending?: number | null
          rd_top_items?: string[] | null
          satyam_tasks?: string[] | null
          top_post_engagement?: number | null
          top_post_platform?: string | null
          top_post_url?: string | null
          top_reel_platform?: string | null
          top_reel_thumbnail?: string | null
          top_reel_url?: string | null
          top_reel_views?: number | null
          updated_at?: string | null
          week_of?: string
          x_followers?: number | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          id: string
          lead_id: string | null
          message_text: string | null
          reply_text: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          template_used: string | null
        }
        Insert: {
          id?: string
          lead_id?: string | null
          message_text?: string | null
          reply_text?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          template_used?: string | null
        }
        Update: {
          id?: string
          lead_id?: string | null
          message_text?: string | null
          reply_text?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          template_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "pipeline_leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
