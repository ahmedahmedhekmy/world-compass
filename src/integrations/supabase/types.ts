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
      analytics_events: {
        Row: {
          browser: string | null
          country_slug: string | null
          created_at: string
          device_type: string | null
          event: string
          id: number
          language: string | null
          metadata: Json
          path: string | null
          referrer_source: string | null
          region: string | null
          visitor_hash: string | null
        }
        Insert: {
          browser?: string | null
          country_slug?: string | null
          created_at?: string
          device_type?: string | null
          event: string
          id?: number
          language?: string | null
          metadata?: Json
          path?: string | null
          referrer_source?: string | null
          region?: string | null
          visitor_hash?: string | null
        }
        Update: {
          browser?: string | null
          country_slug?: string | null
          created_at?: string
          device_type?: string | null
          event?: string
          id?: number
          language?: string | null
          metadata?: Json
          path?: string | null
          referrer_source?: string | null
          region?: string | null
          visitor_hash?: string | null
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          end_date: string | null
          full_name: string
          id: string
          offer_id: string | null
          offer_title: string | null
          phone: string | null
          special_requests: string | null
          start_date: string | null
          status: string
          travellers: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          end_date?: string | null
          full_name: string
          id?: string
          offer_id?: string | null
          offer_title?: string | null
          phone?: string | null
          special_requests?: string | null
          start_date?: string | null
          status?: string
          travellers?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          end_date?: string | null
          full_name?: string
          id?: string
          offer_id?: string | null
          offer_title?: string | null
          phone?: string | null
          special_requests?: string | null
          start_date?: string | null
          status?: string
          travellers?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          capital: string | null
          content: Json
          continent: string
          created_at: string
          currency: string | null
          flag: string | null
          gallery: Json
          guide_price_usd: number | null
          hero_image_url: string | null
          id: string
          iso_code: string | null
          languages: string[] | null
          name_ar: string
          name_en: string
          native_name: string | null
          published: boolean
          region: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          capital?: string | null
          content?: Json
          continent: string
          created_at?: string
          currency?: string | null
          flag?: string | null
          gallery?: Json
          guide_price_usd?: number | null
          hero_image_url?: string | null
          id?: string
          iso_code?: string | null
          languages?: string[] | null
          name_ar: string
          name_en: string
          native_name?: string | null
          published?: boolean
          region?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          capital?: string | null
          content?: Json
          continent?: string
          created_at?: string
          currency?: string | null
          flag?: string | null
          gallery?: Json
          guide_price_usd?: number | null
          hero_image_url?: string | null
          id?: string
          iso_code?: string | null
          languages?: string[] | null
          name_ar?: string
          name_en?: string
          native_name?: string | null
          published?: boolean
          region?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          country_slug: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          country_slug: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          country_slug?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          country_slug: string
          cover_image_url: string | null
          created_at: string
          id: string
          last_updated: string
          pdf_url: string | null
          preview_text: string | null
          price_usd: number | null
          published: boolean
          sections: Json
          seo_description: string | null
          seo_title: string | null
          summary: string | null
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          country_slug: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          last_updated?: string
          pdf_url?: string | null
          preview_text?: string | null
          price_usd?: number | null
          published?: boolean
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          country_slug?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          last_updated?: string
          pdf_url?: string | null
          preview_text?: string | null
          price_usd?: number | null
          published?: boolean
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          active: boolean
          alt_text: string | null
          collection: string
          country_slug: string | null
          created_at: string
          id: string
          kind: string
          sort_order: number
          storage_path: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          alt_text?: string | null
          collection?: string
          country_slug?: string | null
          created_at?: string
          id?: string
          kind?: string
          sort_order?: number
          storage_path?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          alt_text?: string | null
          collection?: string
          country_slug?: string | null
          created_at?: string
          id?: string
          kind?: string
          sort_order?: number
          storage_path?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          admin_notes: string | null
          body: string
          created_at: string
          email: string
          full_name: string
          id: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          body: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          body?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          language: string
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          language?: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          created_at: string
          cta_label: string | null
          destination: string | null
          duration: string | null
          ends_at: string | null
          featured: boolean
          id: string
          image_url: string | null
          includes: string[] | null
          sort_order: number
          starting_price_usd: number | null
          starts_at: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          destination?: string | null
          duration?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          includes?: string[] | null
          sort_order?: number
          starting_price_usd?: number | null
          starts_at?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          destination?: string | null
          duration?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          includes?: string[] | null
          sort_order?: number
          starting_price_usd?: number | null
          starts_at?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_notes: string | null
          amount_usd: number
          country_slug: string | null
          created_at: string
          currency: string
          email: string
          full_name: string | null
          id: string
          product_type: string
          provider: string | null
          provider_ref: string | null
          reference: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_usd: number
          country_slug?: string | null
          created_at?: string
          currency?: string
          email: string
          full_name?: string | null
          id?: string
          product_type: string
          provider?: string | null
          provider_ref?: string | null
          reference: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_usd?: number
          country_slug?: string | null
          created_at?: string
          currency?: string
          email?: string
          full_name?: string | null
          id?: string
          product_type?: string
          provider?: string | null
          provider_ref?: string | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          comment: string
          country: string | null
          created_at: string
          id: string
          is_demo: boolean
          name: string
          photo_url: string | null
          published: boolean
          rating: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          comment: string
          country?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          photo_url?: string | null
          published?: boolean
          rating?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          comment?: string
          country?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          photo_url?: string | null
          published?: boolean
          rating?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      trip_requests: {
        Row: {
          accommodation_level: string | null
          admin_notes: string | null
          adults: number
          budget: number | null
          children: number
          children_ages: string | null
          created_at: string
          currency: string | null
          departure_city: string | null
          departure_country: string | null
          destination_city: string | null
          destination_country: string | null
          email: string
          end_date: string | null
          estimate: Json | null
          full_name: string
          id: string
          kind: string
          nationality: string | null
          nights: number | null
          notes: string | null
          phone: string | null
          preferred_contact: string | null
          start_date: string | null
          status: string
          travel_style: string | null
          updated_at: string
          user_id: string | null
          visa_help: boolean
        }
        Insert: {
          accommodation_level?: string | null
          admin_notes?: string | null
          adults?: number
          budget?: number | null
          children?: number
          children_ages?: string | null
          created_at?: string
          currency?: string | null
          departure_city?: string | null
          departure_country?: string | null
          destination_city?: string | null
          destination_country?: string | null
          email: string
          end_date?: string | null
          estimate?: Json | null
          full_name: string
          id?: string
          kind?: string
          nationality?: string | null
          nights?: number | null
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          start_date?: string | null
          status?: string
          travel_style?: string | null
          updated_at?: string
          user_id?: string | null
          visa_help?: boolean
        }
        Update: {
          accommodation_level?: string | null
          admin_notes?: string | null
          adults?: number
          budget?: number | null
          children?: number
          children_ages?: string | null
          created_at?: string
          currency?: string | null
          departure_city?: string | null
          departure_country?: string | null
          destination_city?: string | null
          destination_country?: string | null
          email?: string
          end_date?: string | null
          estimate?: Json | null
          full_name?: string
          id?: string
          kind?: string
          nationality?: string | null
          nights?: number | null
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          start_date?: string | null
          status?: string
          travel_style?: string | null
          updated_at?: string
          user_id?: string | null
          visa_help?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      owns_guide: {
        Args: { _country_slug: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
