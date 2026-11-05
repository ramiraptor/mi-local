# ADR-0001 · Stack tecnológico MVP1 (cerrado por founders, 04/11/2026)

**Estado:** Aceptado — no reabrir sin decisión de founders.

| Capa | Decisión |
|---|---|
| Lenguaje | TypeScript 5 estricto (`strict: true`, `noUncheckedIndexedAccess`) |
| Framework | Next.js 15 (App Router, RSC), SSR/ISR en páginas públicas |
| Estilos | Tailwind CSS v4 + componentes propios accesibles, mobile-first |
| Backend/BD | Supabase (Postgres + RLS en todas las tablas, Auth, Storage) |
| Hosting | Netlify con `@netlify/plugin-nextjs` |
| Mapa | Leaflet + react-leaflet, tiles raster CARTO Voyager (gratuitos, con atribución), pines aproximados |
| Imágenes | `sharp` en servidor: validación de MIME real, re-encode WebP (elimina EXIF/GPS), thumbnails |
| Email | SMTP Resend configurado en Supabase Auth (el SMTP por defecto de Supabase no sirve para producción) |
| Tests | Vitest (unidad + integración RLS contra stack local) + Playwright (E2E flujos A y B) |
| Analítica | Capa propia `analytics_events` tras adapter; GA4/Clarity NO activos (LEGAL-06) |

Decisión de mapa: se eligió Leaflet sobre MapLibre GL por menor peso de bundle y
porque el requisito es un mapa básico con pines aproximados (sin estilos
vectoriales).
