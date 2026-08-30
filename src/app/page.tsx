import { redirect } from "next/navigation";

// El middleware ya resuelve "/" -> /admin o /vendedor segun el rol (o /login
// si no hay sesion) antes de que esta pagina llegue a renderizar. Esto es
// solo un respaldo por si algun dia el matcher de proxy.ts cambiara.
export default function Home() {
  redirect("/login");
}
