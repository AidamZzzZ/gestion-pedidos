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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          created_at: string
          direccion_fiscal: string
          id: string
          nombre_contacto: string
          nombre_empresa: string
          numero_contacto: string
          rif: string
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          created_at?: string
          direccion_fiscal: string
          id?: string
          nombre_contacto: string
          nombre_empresa: string
          numero_contacto: string
          rif: string
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          created_at?: string
          direccion_fiscal?: string
          id?: string
          nombre_contacto?: string
          nombre_empresa?: string
          numero_contacto?: string
          rif?: string
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      detalle_pedido: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal: number | null
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: string
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal?: number | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          pedido_id?: string
          precio_unitario?: number
          producto_id?: string
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "detalle_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_pedido_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cancelado_at: string | null
          cantidad_total_productos: number
          cliente_id: string
          comision_vendedor: number
          created_at: string
          enviado_at: string | null
          estado: Database["public"]["Enums"]["estado_pedido"]
          fecha: string
          id: string
          monto_total: number
          numero_orden: string
          porcentaje_comision_aplicado: number
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          cancelado_at?: string | null
          cantidad_total_productos?: number
          cliente_id: string
          comision_vendedor?: number
          created_at?: string
          enviado_at?: string | null
          estado?: Database["public"]["Enums"]["estado_pedido"]
          fecha?: string
          id?: string
          monto_total?: number
          numero_orden?: string
          porcentaje_comision_aplicado?: number
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          cancelado_at?: string | null
          cantidad_total_productos?: number
          cliente_id?: string
          comision_vendedor?: number
          created_at?: string
          enviado_at?: string | null
          estado?: Database["public"]["Enums"]["estado_pedido"]
          fecha?: string
          id?: string
          monto_total?: number
          numero_orden?: string
          porcentaje_comision_aplicado?: number
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          precio: number
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          precio: number
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          precio?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          correo_electronico: string
          created_at: string
          id: string
          nombre: string
          porcentaje_comision: number
          rol: Database["public"]["Enums"]["rol_usuario"]
          updated_at: string
        }
        Insert: {
          correo_electronico: string
          created_at?: string
          id: string
          nombre: string
          porcentaje_comision?: number
          rol?: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Update: {
          correo_electronico?: string
          created_at?: string
          id?: string
          nombre?: string
          porcentaje_comision?: number
          rol?: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_admin: { Args: never; Returns: boolean }
      // Entradas agregadas a mano para las funciones de supabase/migrations/20260829000000_login_helpers.sql.
      // Se reemplazan solas al correr `npm run supabase:types` una vez esa migracion este aplicada.
      listar_vendedores_login: {
        Args: Record<PropertyKey, never>
        Returns: { id: string; nombre: string }[]
      }
      obtener_admin_login: {
        Args: Record<PropertyKey, never>
        Returns: { id: string; nombre: string }[]
      }
      resolver_correo_login: {
        Args: {
          p_usuario_id: string
          p_rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Returns: string
      }
      // Agregada a mano para supabase/migrations/20260830000000_resumen_admin.sql.
      resumen_admin: {
        Args: Record<PropertyKey, never>
        Returns: { articulos_en_stock: number; total_vendido: number }[]
      }
      // Agregada a mano para supabase/migrations/20260831000000_resumen_vendedor.sql.
      resumen_vendedor: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_vendido: number
          comision_total: number
          pedidos_realizados: number
        }[]
      }
      // Agregada a mano para supabase/migrations/20260901000000_resumen_por_vendedor.sql.
      resumen_por_vendedor: {
        Args: Record<PropertyKey, never>
        Returns: {
          vendedor_id: string
          nombre: string
          total_vendido: number
          comision_total: number
          pedidos_realizados: number
        }[]
      }
    }
    Enums: {
      estado_pedido: "pendiente" | "enviado" | "cancelado"
      rol_usuario: "admin" | "vendedor"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      estado_pedido: ["pendiente", "enviado", "cancelado"],
      rol_usuario: ["admin", "vendedor"],
    },
  },
} as const
