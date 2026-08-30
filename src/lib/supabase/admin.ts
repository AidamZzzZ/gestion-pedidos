import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Cliente con la service_role key: se salta RLS por completo. SOLO se usa en
// server actions para gestionar cuentas de Auth (crear/borrar vendedores).
// El import "server-only" hace que el build falle si esto se importa desde
// un componente cliente.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
