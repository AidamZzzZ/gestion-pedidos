import { redirect } from "next/navigation";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";
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
  const sesion = await obtenerSesionDeHeaders();

  if (!sesion) redirect("/login");
  if (sesion.rol !== "admin") redirect("/vendedor");

  return (
    <div className="min-h-screen bg-[#eae7e2] pb-24">
      <header className="flex items-center justify-between border-b border-black/5 px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7c8a66] font-display text-sm font-bold text-[#f4f1ea]">
            {sesion.nombre.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
              Panel administrador
            </p>
            <h1 className="font-display text-lg font-bold text-[#1f1b16]">
              {sesion.nombre}
            </h1>
          </div>
        </div>
        <form action={cerrarSesion}>
          <button className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#3c6e82] transition hover:bg-white">
            Salir
          </button>
        </form>
      </header>

      <div className="pt-6">{children}</div>

      <BottomTabs tabs={TABS} />
    </div>
  );
}
