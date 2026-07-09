import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// Protección de administrador (usuario/contraseña) para:
//   - /resultados            (pantalla para cargar resultados oficiales)
//   - /api/resultados/*      (API que guarda esos resultados)
//   - /api/export            (descarga del Excel con ranking + predicciones)
//
// El usuario y la contraseña se leen de las variables de entorno ADMIN_USER
// y ADMIN_PASSWORD (configúralas en Vercel). Si no están configuradas, se
// usan estos valores por defecto — solo para desarrollo local, cámbialos en
// producción desde Vercel > Settings > Environment Variables.
// =============================================================================

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Fanero2026!";

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    try {
      const base64Credentials = authHeader.split(" ")[1];
      const decoded = atob(base64Credentials);
      const separatorIndex = decoded.indexOf(":");
      const user = decoded.slice(0, separatorIndex);
      const password = decoded.slice(separatorIndex + 1);
      if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
        return NextResponse.next();
      }
    } catch {
      // credenciales mal formadas: cae al 401 de abajo
    }
  }

  return new NextResponse("Acceso restringido. Ingresa el usuario y contraseña de administrador.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Polla Mundialista 2026 - Admin"' },
  });
}

export const config = {
  matcher: ["/resultados/:path*", "/api/resultados/:path*", "/api/export/:path*"],
};
