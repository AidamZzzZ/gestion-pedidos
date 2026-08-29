import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() revalida el token contra Supabase (no confiar solo en la cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname.startsWith("/login");

  if (!user) {
    if (!isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Ya hay sesion: solo resolver el rol si la ruta lo necesita, para no pagar
  // una consulta extra en cada request a rutas que no dependen de el.
  const necesitaRol = isLoginRoute || pathname.startsWith("/admin") || pathname.startsWith("/vendedor");
  if (!necesitaRol) return response;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  const destinoPropio = perfil?.rol === "admin" ? "/admin" : "/vendedor";

  if (isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = destinoPropio;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && perfil?.rol !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/vendedor";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/vendedor") && perfil?.rol !== "vendedor") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}
