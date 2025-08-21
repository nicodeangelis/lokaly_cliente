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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      beneficios: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          local_id: string | null
          nivel_requerido: string | null
          puntos_requeridos: number | null
          tipo: string
          titulo: string
          updated_at: string
          valor: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          local_id?: string | null
          nivel_requerido?: string | null
          puntos_requeridos?: number | null
          tipo: string
          titulo: string
          updated_at?: string
          valor: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          local_id?: string | null
          nivel_requerido?: string | null
          puntos_requeridos?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficios_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficios_nivel_requerido_fkey"
            columns: ["nivel_requerido"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      locales: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          direccion: string
          email: string | null
          horarios: Json | null
          id: string
          imagen: string | null
          latitud: number | null
          longitud: number | null
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          direccion: string
          email?: string | null
          horarios?: Json | null
          id?: string
          imagen?: string | null
          latitud?: number | null
          longitud?: number | null
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          direccion?: string
          email?: string | null
          horarios?: Json | null
          id?: string
          imagen?: string | null
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      menu_categorias: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          alergenos: string[] | null
          categoria_id: string
          created_at: string
          descripcion: string | null
          disponible: boolean
          id: string
          imagen: string | null
          ingredientes: string[] | null
          local_id: string
          nombre: string
          orden: number
          precio: number
          sin_gluten: boolean
          updated_at: string
          vegano: boolean
          vegetariano: boolean
        }
        Insert: {
          alergenos?: string[] | null
          categoria_id: string
          created_at?: string
          descripcion?: string | null
          disponible?: boolean
          id?: string
          imagen?: string | null
          ingredientes?: string[] | null
          local_id: string
          nombre: string
          orden?: number
          precio: number
          sin_gluten?: boolean
          updated_at?: string
          vegano?: boolean
          vegetariano?: boolean
        }
        Update: {
          alergenos?: string[] | null
          categoria_id?: string
          created_at?: string
          descripcion?: string | null
          disponible?: boolean
          id?: string
          imagen?: string | null
          ingredientes?: string[] | null
          local_id?: string
          nombre?: string
          orden?: number
          precio?: number
          sin_gluten?: boolean
          updated_at?: string
          vegano?: boolean
          vegetariano?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "menu_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["id"]
          },
        ]
      }
      niveles: {
        Row: {
          color: string
          created_at: string
          descripcion: string | null
          icono: string
          id: string
          nombre: string
          puntos_maximos: number | null
          puntos_minimos: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          descripcion?: string | null
          icono?: string
          id?: string
          nombre: string
          puntos_maximos?: number | null
          puntos_minimos: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          descripcion?: string | null
          icono?: string
          id?: string
          nombre?: string
          puntos_maximos?: number | null
          puntos_minimos?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          fecha_registro: string
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          fecha_registro?: string
          id: string
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          fecha_registro?: string
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      puntos_usuario: {
        Row: {
          created_at: string
          id: string
          nivel_actual: string | null
          puntos_totales: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nivel_actual?: string | null
          puntos_totales?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nivel_actual?: string | null
          puntos_totales?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puntos_usuario_nivel_actual_fkey"
            columns: ["nivel_actual"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_tokens: {
        Row: {
          created_at: string
          expire_at: string
          id: string
          local_id: string
          nro_pos: string
          puntos_a_otorgar: number
          staff_id: string
          token: string
          usado: boolean
        }
        Insert: {
          created_at?: string
          expire_at: string
          id?: string
          local_id: string
          nro_pos: string
          puntos_a_otorgar?: number
          staff_id: string
          token: string
          usado?: boolean
        }
        Update: {
          created_at?: string
          expire_at?: string
          id?: string
          local_id?: string
          nro_pos?: string
          puntos_a_otorgar?: number
          staff_id?: string
          token?: string
          usado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "qr_tokens_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_tokens_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          local_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          local_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          local_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["id"]
          },
        ]
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
      visitas: {
        Row: {
          beneficio_aplicado: string | null
          created_at: string
          id: string
          local_id: string
          puntos_obtenidos: number
          qr_token: string | null
          user_id: string
        }
        Insert: {
          beneficio_aplicado?: string | null
          created_at?: string
          id?: string
          local_id: string
          puntos_obtenidos?: number
          qr_token?: string | null
          user_id: string
        }
        Update: {
          beneficio_aplicado?: string | null
          created_at?: string
          id?: string
          local_id?: string
          puntos_obtenidos?: number
          qr_token?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_beneficio_aplicado_fkey"
            columns: ["beneficio_aplicado"]
            isOneToOne: false
            referencedRelation: "beneficios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "staff" | "user"
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
