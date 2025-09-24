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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          language: string | null
          name: string
          updated_at: string
          user_id: string
          voice: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          language?: string | null
          name: string
          updated_at?: string
          user_id: string
          voice?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          language?: string | null
          name?: string
          updated_at?: string
          user_id?: string
          voice?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          assistant_id: string
          created_at: string
          id: string
          phone_number_id: string | null
          status: string | null
          updated_at: string
          user_id: string
          vapi_api_key: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          id?: string
          phone_number_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          vapi_api_key: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          id?: string
          phone_number_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vapi_api_key?: string
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          agent_id: string
          call_id: string
          caller_number: string
          campaign_id: string | null
          created_at: string
          duration: number | null
          end_of_call_report: Json | null
          id: string
          metadata: Json | null
          phone_number: string | null
          start_time: string
          status: string
          updated_at: string
          user_id: string
          vapi_call_id: string | null
        }
        Insert: {
          agent_id: string
          call_id: string
          caller_number: string
          campaign_id?: string | null
          created_at?: string
          duration?: number | null
          end_of_call_report?: Json | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          start_time: string
          status: string
          updated_at?: string
          user_id: string
          vapi_call_id?: string | null
        }
        Update: {
          agent_id?: string
          call_id?: string
          caller_number?: string
          campaign_id?: string | null
          created_at?: string
          duration?: number | null
          end_of_call_report?: Json | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string
          vapi_call_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          campaign_name: string
          created_at: string
          failed_calls: number | null
          id: string
          prompt_id: string | null
          status: string
          successful_calls: number | null
          total_numbers: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_name: string
          created_at?: string
          failed_calls?: number | null
          id?: string
          prompt_id?: string | null
          status?: string
          successful_calls?: number | null
          total_numbers?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_name?: string
          created_at?: string
          failed_calls?: number | null
          id?: string
          prompt_id?: string | null
          status?: string
          successful_calls?: number | null
          total_numbers?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      numbers: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          phone_number: string
          phone_number_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          phone_number: string
          phone_number_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          phone_number?: string
          phone_number_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_config: {
        Row: {
          created_at: string
          id: string
          twilio_account_sid: string
          twilio_auth_token: string
          twilio_phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          twilio_account_sid: string
          twilio_auth_token: string
          twilio_phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          twilio_account_sid?: string
          twilio_auth_token?: string
          twilio_phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          phone: string | null
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id: string
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          created_at: string
          first_message: string
          id: string
          prompt_name: string
          system_prompt: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_message: string
          id?: string
          prompt_name: string
          system_prompt: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_message?: string
          id?: string
          prompt_name?: string
          system_prompt?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_campaign_failed: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      increment_campaign_success: {
        Args: { campaign_id: string }
        Returns: undefined
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
