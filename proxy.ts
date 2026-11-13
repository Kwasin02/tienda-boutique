import { NextResponse, type NextRequest } from "next/server";

// Primera barrera: sin cookie de sesión no se entra al panel. La verificación real (firma, expiración,
// usuario) se hace con requireAdmin() en cada página y acción del servidor.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.has("admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
