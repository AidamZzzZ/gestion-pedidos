import { headers } from "next/headers";

export type SesionResuelta = {
  id: string;
  nombre: string;
  rol: "admin" | "vendedor";
};

// El middleware (src/lib/supabase/middleware.ts) ya valida la sesion y el rol
// para /admin, /vendedor y /login, y deja el resultado en estos headers.
// Leerlos aca es gratis (no hay red de por medio) en vez de repetir
// getUser() + una consulta a "usuarios" que el middleware ya hizo.
export async function obtenerSesionDeHeaders(): Promise<SesionResuelta | null> {
  const headerList = await headers();
  const id = headerList.get("x-usuario-id");
  const rol = headerList.get("x-usuario-rol");
  const nombreCodificado = headerList.get("x-usuario-nombre");

  if (!id || !nombreCodificado || (rol !== "admin" && rol !== "vendedor")) {
    return null;
  }

  return { id, nombre: decodeURIComponent(nombreCodificado), rol };
}
