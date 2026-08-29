import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/lib/auth/actions";
import { BottomTabs } from "@/components/bottom-tabs";

const TABS = [
  { href: "/admin/panel", label: "Panel" },
  { href: "/admin/inventario", label: "Inventario" },
  { href: "/admin/vendedores", label: "Vendedores" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") redirect("/vendedor");

  return (
    <div className="min-h-screen bg-[#eae7e2] pb-24">
      <header className="flex items-center justify-between px-6 pt-8 pb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
            Panel administrador
          </p>
          <h1 className="font-display text-lg font-bold text-[#1f1b16]">
            {perfil.nombre}
          </h1>
        </div>
        <form action={cerrarSesion}>
          <button className="text-xs font-bold uppercase tracking-wide text-[#3c6e82]">
            Salir
          </button>
        </form>
      </header>

      {children}

      <BottomTabs tabs={TABS} />
    </div>
  );
}
