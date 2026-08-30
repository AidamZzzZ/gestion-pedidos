import { redirect } from "next/navigation";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";
import { AppShell } from "@/components/app-shell";

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
    <AppShell nombre={sesion.nombre} etiqueta="Panel administrador" tabs={TABS}>
      {children}
    </AppShell>
  );
}
