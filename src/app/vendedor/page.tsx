import { redirect } from "next/navigation";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";
import { cerrarSesion } from "@/lib/auth/actions";

export default async function VendedorPage() {
  const sesion = await obtenerSesionDeHeaders();

  if (!sesion) redirect("/login");
  if (sesion.rol !== "vendedor") redirect("/admin");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eae7e2] px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
        Panel vendedor
      </p>
      <h1 className="font-display text-2xl font-bold text-[#1f1b16]">
        Bienvenido, {sesion.nombre}
      </h1>
      <form action={cerrarSesion}>
        <button className="rounded-2xl bg-[#3c6e82] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
