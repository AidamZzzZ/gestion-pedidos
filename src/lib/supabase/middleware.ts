import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

type Claims = {
  sub: string;
  user_rol?: "admin" | "vendedor";
  user_nombre?: string;
};

export async function updateSession(request: NextRequest) {
  // Headers "internos": si ya resolvimos user+rol aca, se los pasamos al
  // layout/pagina via request headers para que no tengan que volver a
  // golpear la red (cada ida y vuelta a Supabase pesa varios cientos de ms
  // en conexiones con latencia alta, y hacerlo dos veces por click se nota).
  const requestHeaders = new Headers(request.headers);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() valida el JWT (localmente y sin red si el proyecto usa claves
  // de firma asimetricas; si no, cae a un request como getUser()) y devuelve
  // el rol/nombre ya incluidos por el Auth Hook (supabase/migrations/
  // 20260902000000_custom_access_token_hook.sql) - un viaje de red menos que
  // antes, que ademas hacia getUser() + una consulta aparte a "usuarios".
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims as Claims | undefined;

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname.startsWith("/login");

  if (!claims) {
    if (!isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Ya hay sesion: solo resolver el rol si la ruta lo necesita, para no pagar
  // una consulta extra en cada request a rutas que no dependen de el.
  const necesitaRol =
    pathname === "/" || isLoginRoute || pathname.startsWith("/admin") || pathname.startsWith("/vendedor");
  if (!necesitaRol) return response;

  let rol = claims.user_rol;
  let nombre = claims.user_nombre;

  // Respaldo: si el Auth Hook todavia no esta activado en el Dashboard (o la
  // sesion se emitio antes de activarlo), el JWT no trae estos claims
  // todavia. Consultamos como antes para que la app siga funcionando igual
  // mientras tanto, y se vuelve mas rapida sola apenas el hook quede activo.
  if (!rol || !nombre) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("nombre, rol")
      .eq("id", claims.sub)
      .single();
    rol = perfil?.rol;
    nombre = perfil?.nombre;
  }

  const destinoPropio = rol === "admin" ? "/admin" : "/vendedor";

  if (pathname === "/" || isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = destinoPropio;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && rol !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/vendedor";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/vendedor") && rol !== "vendedor") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Llegamos hasta aca solo si el usuario tiene permiso para esta ruta:
  // le pasamos sus datos ya resueltos al layout/pagina via headers.
  requestHeaders.set("x-usuario-id", claims.sub);
  requestHeaders.set("x-usuario-nombre", encodeURIComponent(nombre ?? ""));
  requestHeaders.set("x-usuario-rol", rol ?? "");
  response = NextResponse.next({ request: { headers: requestHeaders } });

  return response;
}
