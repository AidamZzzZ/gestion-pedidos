import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();

  const [{ data: vendedores }, { data: admins }] = await Promise.all([
    supabase.rpc("listar_vendedores_login"),
    supabase.rpc("obtener_admin_login"),
  ]);

  return <LoginForm vendedores={vendedores ?? []} admin={admins?.[0] ?? null} />;
}
