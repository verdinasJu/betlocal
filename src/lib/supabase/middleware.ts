import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rutas cuyo contenido vive en la base de datos y por tanto necesitan cuenta. */
const PROTECTED_PREFIXES = ["/apuestas", "/rendimiento"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  const isPublicAsset =
    path.startsWith("/_next") ||
    path.startsWith("/icons") ||
    path === "/manifest.json" ||
    path === "/sw.js" ||
    path.endsWith(".png") ||
    path.endsWith(".svg") ||
    path.endsWith(".ico");

  if (isPublicAsset) return supabaseResponse;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Solo lo que persiste en servidor exige cuenta. Las recomendaciones y los
  // ajustes de riesgo funcionan sin registro, guardados en el dispositivo.
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix)
  );

  if (!user && requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.searchParams.get("next") ?? "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
