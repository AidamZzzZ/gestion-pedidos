import { redirect } from "next/navigation";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";
import { AppShell } from "@/components/app-shell";

const TABS = [
  { href: "/vendedor/panel", label: "Panel" },
  { href: "/vendedor/pedidos", label: "Pedidos" },
  { href: "/vendedor/cobros", label: "Cobros" },
  { href: "/vendedor/ganancias", label: "Ganancias" },
];

export default async function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await obtenerSesionDeHeaders();

  if (!sesion) redirect("/login");
  if (sesion.rol !== "vendedor") redirect("/admin");

  return (
    <AppShell nombre={sesion.nombre} etiqueta="Panel vendedor" tabs={TABS}>
      {children}
    </AppShell>
  );
}
