// return_to seguro: SOLO rutas internas whitelisted (PRD 04).
// Evita open redirects: nada de esquemas, dominios externos ni '//'.

const ALLOWED_PREFIXES = [
  "/",
  "/explorar",
  "/propiedad/",
  "/perfil",
  "/mis-locales",
  "/evaluacion/emprendedor",
  "/evaluacion/propietario",
  "/admin",
];

export function safeReturnTo(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  // Debe ser ruta interna absoluta, sin protocolo ni autoridad
  if (!decoded.startsWith("/")) return null;
  if (decoded.startsWith("//") || decoded.startsWith("/\\")) return null;
  if (decoded.includes("://") || decoded.includes("\n") || decoded.includes("\r")) return null;

  const pathOnly = decoded.split("?")[0] ?? "";
  if (pathOnly === "/") return decoded;
  const ok = ALLOWED_PREFIXES.some((p) => {
    if (p === "/") return false; // la raíz solo coincide de forma exacta
    return pathOnly === p || pathOnly.startsWith(p.endsWith("/") ? p : p + "/");
  });
  return ok ? decoded : null;
}
