import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware";
import { safeReturnTo } from "@/lib/return-to";

const AUTH_REQUIRED_PREFIXES = ["/perfil", "/mis-locales"];

export async function middleware(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareSupabase(request);

  // Refresca tokens si corresponde (patrón @supabase/ssr)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ── /admin: sesión + rol ADMIN (tabla backend) + MFA aal2 ──────────────────
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?return_to=${encodeURIComponent(safeReturnTo(path) ?? "/")}`;
      return NextResponse.redirect(url);
    }
    const { data: status } = await supabase.rpc("get_my_admin_status");
    const s = (status ?? {}) as { is_admin?: boolean; aal2?: boolean };
    if (!s.is_admin) {
      // Usuario sin rol: fuera. (Las RLS/vistas niegan igualmente los datos.)
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (!s.aal2 && path !== "/admin/mfa") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/mfa";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return getResponse();
  }

  // ── Rutas privadas de usuario ──────────────────────────────────────────────
  if (AUTH_REQUIRED_PREFIXES.some((p) => path.startsWith(p)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?return_to=${encodeURIComponent(safeReturnTo(path + request.nextUrl.search) ?? "/")}`;
    return NextResponse.redirect(url);
  }

  return getResponse();
}

export const config = {
  matcher: [
    // Excluir estáticos e imágenes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|css|js|map)$).*)",
  ],
};
