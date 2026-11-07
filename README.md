# MiLocal MVP1

Marketplace de locales comerciales para la Región Metropolitana y Viña del Mar:
los emprendedores estructuran su búsqueda y manifiestan interés; los oferentes
publican gratis; el equipo MiLocal intermedia manualmente cada solicitud.

**Producción:** https://mi-local-cl.netlify.app
**Repositorio:** https://github.com/ramiraptor/mi-local

Especificación: `MiLocal_PRD_Maestro_MVP1_v1.0.md` (funcional) y
`MiLocal_Anexo_Transversal_Seguridad_Privacidad_Datos_v1.0.md` (seguridad y
privacidad, MUST). Reglas para agentes: `AGENTS.md`.

---

## Stack

Next.js 15 (App Router, RSC) · TypeScript estricto · Tailwind CSS v4 ·
Supabase (Postgres + RLS, Auth con MFA TOTP para ADMIN, Storage) · Netlify ·
Leaflet (tiles CARTO) · sharp (saneamiento EXIF/GPS) · Vitest + Playwright.
Decisiones en `docs/decisiones/` (ADR-0001…0006, KPIs versionados).

## Desarrollo

```bash
npm install
supabase start          # stack local (Docker) + migraciones
cp .env.example .env.local   # completar con las keys que imprime supabase start
npm run dev
```

Comprobaciones:

```bash
npm run lint && npm run typecheck   # estática
npm test                            # unitarios
npm run test:rls                    # RLS/acceso cruzado (requiere supabase start)
npm run test:e2e                    # Playwright: flujos A y B (levanta next dev)
```

## Operación

- **Migraciones:** solo vía `supabase/migrations/` + `supabase db push`
  (jamás cambios a mano en consola).
- **Provisión ADMIN:** `scripts/provision_admin.sql` en el SQL Editor
  (el usuario debe existir y luego enrolar MFA en `/admin/mfa`). Jamás desde
  el frontend.
- **Runbooks:** `docs/runbooks/` — restauración de BD+fotos, rollback de
  Netlify, rotación de secretos, incidentes.
- **Deploy:** `.\scripts\deploy.ps1` — usa `NETLIFY_AUTH_TOKEN`/`NETLIFY_SITE_ID`
  de `.env.ops`, sin `netlify login` (sitio aún no conectado a Git; conectar en
  Netlify UI → "Link repository" para CI/CD automático).

## Cobertura por pilar (estado real al cierre)

| Pilar | Estado | Notas |
|---|---|---|
| 01 Landing | ✅ Hecho | Hero 2 CTA, ≤6 fichas PUBLISHED, SEO (meta/OG/sitemap/robots), ISR |
| 02 Assessment Emprendedor | ✅ Hecho | 7 bloques, borrador anónimo 7 días, 1–3 comunas, triestado, precarga desde BD al editar |
| 03 Assessment Propietario | ✅ Hecho | 6 bloques, `property_id` DRAFT estable (ver ADR-0003), `address_full` privado |
| 04 Registro y roles | ✅ Hecho | Un paso, verificación real de correo, doble contexto, `return_to` whitelisted, ADMIN solo por script |
| 05 Perfiles | ✅ Hecho | Búsqueda única editable, Mis locales, completitud derivada, opt-ins separados/revocables |
| 06 Publicación | ✅ Hecho | DRAFT→PUBLISHED automático, fotos saneadas (sharp, bucket privado), moderación con bloqueo, vigencia explícita |
| 07 Explorar | ✅ Hecho | Solo PUBLISHED, filtros, paginación, lista/mapa con pines aproximados, Interest único con snapshot |
| 08 Administración | ✅ Hecho | MFA aal2, resumen/KPIs, usuarios, moderación, bandeja+pipeline+precalificación+notas+historial, 4 CSV auditados |

## Resultados de pruebas (ejecuciones reales, 05/11/2026)

- **Unitarias (Vitest):** 15/15 ✅ (CSV anti formula injection, `return_to`,
  formato es-CL).
- **RLS / acceso cruzado (Vitest + Supabase local):** 32/32 ✅ — deny-by-default,
  B no lee/edita datos de A cambiando UUIDs, proyección pública sin
  `address_full`/coordenadas exactas/PII, guard de transiciones, Interest
  idempotente con `created_at` y `rent_snapshot_clp` inmutables, gating ADMIN
  con TOTP real (aal1 denegado, aal2 permitido), moderación con bloqueo de
  republicación, «ya se arrendó» ≠ WON, auditoría de CSV, analítica que
  descarta PII y eventos fuera de diccionario, consentimientos append-only.
- **E2E (Playwright, viewport móvil):** 2/2 ✅ — Flujo A completo (assessment →
  registro → vinculación de borrador → foto saneada → PUBLISHED → visible en
  explorar → ficha pública sin PII y con pin aproximado) y Flujo B completo
  (visitante → registro exprés sin assessment → retorno a la ficha → CONTACT →
  doble envío sin duplicar, insistencia registrada).
  *Nota: el entorno local auto-confirma correos; la exigencia de verificación
  está probada a nivel de RPC/RLS y por configuración de Auth en producción.*
- **Lighthouse móvil (producción, 05/11/2026, emulación Moto G Power):**
  - `/` (landing): **Performance 92 · Accesibilidad 100 · Best Practices 100 · SEO 100** (LCP 1,8 s, TTFB 310 ms, CLS 0,001)
  - `/explorar`: **Performance 93 · Accesibilidad 100 · Best Practices 100 · SEO 100** (LCP 2,7 s)
  - Objetivo ≥90 móvil: ✅ cumplido en ambas páginas.

## Checklist de seguridad §5 (verificación punto a punto)

1. ✅ RLS deny-by-default en todas las tablas; proyección pública por vistas
   con SOLO campos permitidos; tests de acceso cruzado en verde.
2. ✅ Correo verificado exigido en servidor para publicar y crear Interest
   (RPCs `publish_property`/`create_interest`); explorar y borradores no lo
   exigen. En producción, Supabase Auth además no emite sesión sin confirmar.
3. ✅ ADMIN: tabla `admin_users` (alta solo por script auditado), middleware +
   layout + vistas/RPCs exigen `is_admin_aal2()` (MFA TOTP). Usuarios normales
   sin MFA.
4. ✅ Fotos: MIME real validado con sharp, ≤8MB, re-encode WebP (EXIF/GPS
   eliminados), thumbnails, bucket privado + URLs firmadas TTL 1h; al
   despublicar la exposición cesa de inmediato y las firmas expiran ≤1h.
5. ✅ Coordenadas: exactas en columnas privadas; pin público = redondeo 3
   decimales + jitter determinista por property_id (fallback centroide de
   comuna, ADR-0006). Verificado en tests (pin ≠ exacta, sin columnas privadas
   en la vista).
6. ✅ Idempotencia: `unique(user_id, property_id)` real; upsert incrementa
   insistencias sin tocar fecha original ni snapshot (inmutables por trigger
   incluso para service_role); verificación de PUBLISHED en la misma
   transacción.
7. ✅ Auditoría `admin_actions` append-only: moderación, pipeline,
   precalificación, asignación, cierres (LOST exige motivo, WON exige
   evidencia), exportaciones CSV (dataset/filtros/filas) y cambios de
   privilegio (script).
8. ✅ CSV: UTF-8+BOM, cabeceras estables v1, IDs texto, fechas ISO 8601,
   prefijo `'` anti formula injection, sin `address_full` ni notas privadas,
   descarga solo ADMIN aal2 y auditada (sin auditoría no hay descarga).
9. ✅ Secretos solo en env vars (Netlify/Supabase); `service_role` solo en
   servidor (`server-only`); repo sin claves (`.env*` gitignoreado).
10. ✅ Analítica propia sin PII con diccionario cerrado (verificado: claves no
    permitidas se descartan), `/admin` excluido de instrumentación, errores de
    login/recuperación sin filtrar existencia de cuentas.
11. ✅ Consentimientos: T&C/Privacidad enlazados y versionados en `consents`
    (append-only), marketing y proactividad separados/desmarcados/revocables,
    declaración 18+ en registro.
12. ✅ Rate limiting: Interest 20/h/usuario y eventos 120/min (BD), además de
    los límites nativos de Supabase Auth en registro/login.

## Gates LEGAL/OPS — abiertos (responsabilidad de founders; NO declarados cumplidos)

| Gate | Estado | Nota |
|---|---|---|
| LEGAL-01 responsable del tratamiento | 🔴 Abierto | Textos legales publicados como «v0 — en revisión legal» sin razón social |
| LEGAL-02 bases jurídicas y textos finales | 🔴 Abierto | Reemplazar `/terminos` y `/privacidad` y versionar en `app_settings` |
| LEGAL-03 retención | 🔴 Abierto | Sin plazos definidos; no se inventaron |
| LEGAL-04 ejercicio de derechos | 🟡 Parcial | Canal `privacidad@milocal.cl` publicado; proceso/plazos sin validar |
| LEGAL-05 proveedores/transferencias | 🟡 Parcial | Inventario: Supabase (⚠️ región **ca-central-1**, no la más cercana a Chile), Netlify, Resend, GitHub, CARTO/OSM (tiles). DPAs sin revisar |
| LEGAL-06 analítica externa | ✅ Mitigado | GA4/Clarity NO activos; solo capa propia sin PII |
| LEGAL-07 uso interno de datos | ✅ Mitigado técnica y documentalmente | Sin exportación a terceros; CSV auditados |
| LEGAL-08 motor futuro | 🔴 Abierto | Sin matching en MVP1 (cumplido por diseño) |
| OPS-01 RPO/RTO y backups probados | 🔴 Abierto | Plan Free: sin backups restaurables ni PITR. Runbook listo; falta decidir plan Pro o dumps programados y ENSAYAR restauración |
| OPS-02 responsables de incidentes | 🔴 Abierto | Runbook listo; faltan nombres titular/suplente |
| OPS-03 accesos técnicos y recuperación | 🟡 Parcial | Runbook de rotación listo; falta formalizar 2 responsables con MFA en cuentas corporativas |

## Riesgos y limitaciones conocidas

1. ~~Correo transaccional~~ **Resuelto el 07/11/2026:** dominio
   `info.milocal.io` verificado en Resend y remitente actualizado a
   `no-reply@info.milocal.io`; los correos ya llegan a cualquier destinatario.
   Las plantillas de confirmación/recuperación usan flujo `token_hash`
   (válido en cualquier navegador; ver regla 9 de `AGENTS.md`) y el límite de
   envío quedó en 30 correos/hora.
2. **Sitio Netlify no conectado a Git:** deploys vía CLI. Conectar el repo en
   la UI para deploys automáticos y Deploy Previews por PR.
3. **Región de Supabase (ca-central-1):** funcional, pero con más latencia que
   sa-east-1 y relevante para LEGAL-05. Migrar = proyecto nuevo + restore.
4. **Smoke de producción con correo de tercero pendiente:** con el dominio
   verificado (07/11/2026) los correos ya llegan a cualquier casilla; falta
   ejecutar una vez el ciclo registro → verificación → publicar/solicitar con
   un correo ajeno al equipo. El ciclo completo ya se probó con
   `equipomilocal@gmail.com` (verificación, recuperación, ADMIN + MFA) y los
   flujos están cubiertos E2E en local.

## Backlog priorizado — Día 2

1. ✅ ~~Verificar dominio en Resend + remitente propio~~ (hecho 07/11/2026).
   Pendiente: probar registro completo en producción con un correo de tercero.
2. Conectar Netlify ↔ GitHub (CI/CD + Deploy Previews) y activar el workflow
   `rls` de GitHub Actions como gate de PR.
3. ✅ ~~Provisionar ADMIN de producción (founder) + enrolar MFA~~ (hecho
   05/11/2026; cuenta verificada, contraseña establecida, TOTP enrolado).
4. Decidir plan de backups (Pro/PITR o dumps programados) y ENSAYAR
   restauración (OPS-01).
5. Textos legales definitivos (LEGAL-01/02) y versionar en `app_settings`.
6. Pulido UX: estados vacíos de explorar con sugerencias, editor de búsqueda
   inline en perfil, galería con zoom, paginación con lazy-load real.
7. Recordatorio operativo de vigencia ~30 días (hoy es indicador en /admin;
   falta notificación interna programada).
8. Evaluar migración de región de Supabase a sa-east-1.
9. Cambiar la URL pública a `www.milocal.io` — procedimiento completo y
   checklist en `docs/runbooks/cambio-dominio.md` (decidido 07/11/2026,
   pendiente de ejecutar).
