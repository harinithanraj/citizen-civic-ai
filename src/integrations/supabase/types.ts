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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          confidence: number
          created_at: string
          detected_category: string
          duplicate_probability: number
          explanation: string
          id: string
          issue_id: string
          recommended_department: string | null
          severity: Database["public"]["Enums"]["issue_priority"]
          summary: string | null
        }
        Insert: {
          confidence?: number
          created_at?: string
          detected_category?: string
          duplicate_probability?: number
          explanation?: string
          id?: string
          issue_id: string
          recommended_department?: string | null
          severity?: Database["public"]["Enums"]["issue_priority"]
          summary?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          detected_category?: string
          duplicate_probability?: number
          explanation?: string
          id?: string
          issue_id?: string
          recommended_department?: string | null
          severity?: Database["public"]["Enums"]["issue_priority"]
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      duplicate_links: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          related_issue_id: string
          similarity_score: number
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          related_issue_id: string
          similarity_score?: number
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          related_issue_id?: string
          similarity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "duplicate_links_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duplicate_links_related_issue_id_fkey"
            columns: ["related_issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_updates: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          message: string
          status: Database["public"]["Enums"]["issue_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          message?: string
          status?: Database["public"]["Enums"]["issue_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          message?: string
          status?: Database["public"]["Enums"]["issue_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_updates_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          address: string | null
          ai_confidence: number | null
          assigned_officer: string | null
          category: string
          complaint_number: string
          created_at: string
          department_id: string | null
          description: string
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          priority: Database["public"]["Enums"]["issue_priority"]
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          ai_confidence?: number | null
          assigned_officer?: string | null
          category?: string
          complaint_number?: string
          created_at?: string
          department_id?: string | null
          description: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          ai_confidence?: number | null
          assigned_officer?: string | null
          category?: string
          complaint_number?: string
          created_at?: string
          department_id?: string | null
          description?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          ward: string | null
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          name?: string
          phone?: string | null
          ward?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "citizen" | "admin"
      issue_priority: "low" | "medium" | "high" | "critical"
      issue_status:
        | "reported"
        | "ai_analyzed"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "verified"
        | "reopened"
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
      app_role: ["citizen", "admin"],
      issue_priority: ["low", "medium", "high", "critical"],
      issue_status: [
        "reported",
        "ai_analyzed",
        "assigned",
        "in_progress",
        "resolved",
        "verified",
        "reopened",
      ],
    },
  },
} as const
