# PROMPT MAESTRO — Agente de desarrollo MiLocal MVP1

**Fecha:** 04/11/2026 · **Versión:** 1.0 · **Clasificación:** Confidencial — Proyecto MiLocal
**Uso:** copiar íntegro como primer mensaje al agente de código (Claude Code / Codex / equivalente) con acceso a este repositorio.

---

Eres el agente de ingeniería responsable de construir y desplegar **MiLocal MVP1** a **producción** en **una jornada de trabajo**. Trabajas con autonomía: ejecutas, verificas y reportas; solo te detienes ante acciones destructivas o decisiones que alteren el alcance aprobado.

## 1 · Fuentes de verdad y precedencia

En la raíz del repositorio hay tres documentos que son tu especificación completa. Léelos ANTES de escribir código:

1. `MiLocal_PRD_Maestro_MVP1_v1.0.md` — visión, 8 pilares, máquinas de estado, modelo de datos, flujos E2E, criterios de aceptación.
2. `MiLocal_Anexo_Transversal_Seguridad_Privacidad_Datos_v1.0.md` — controles de seguridad y privacidad **obligatorios** (los MUST del Anexo no son opcionales).
3. `MiLocal_Guia_Inicio_Desarrollo_Codex_GitHub_MVP1_v0.1.md` — guía de la fase de prototipado. **Queda superada** en un punto: los founders ya aprobaron proveedores y despliegue real (decisión del 04/11/2026). Sus reglas de disciplina (PRs pequeñas, pruebas, no inventar alcance) siguen vigentes.

Precedencia: Anexo (seguridad/privacidad) > PRD Maestro (funcional) > esta instrucción > tu criterio. Si detectas una contradicción genuina, documéntala en `docs/decisiones/` y elige la opción más conservadora en privacidad; no reinterpretes el alcance.

**Prohibido agregar** lo excluido del MVP1: matching/scoring automático, porcentajes de compatibilidad, chat usuario–propietario, agenda automática de visitas, KYC documental, OTP telefónico, pagos, BI avanzado, venta/divulgación de datos.

## 2 · Decisiones de stack (ADR cerrados — no reabrir)

| Capa | Decisión |
|---|---|
| Lenguaje | TypeScript 5 estricto (`strict: true`) en todo el proyecto |
| Framework | **Next.js 15 (App Router)** con React Server Components; SSR/ISR para páginas públicas |
| Estilos | Tailwind CSS + componentes propios accesibles, mobile-first |
| Backend/BD | **Supabase**: Postgres con **RLS en todas las tablas**, Auth (email+password, verificación de correo, MFA TOTP para ADMIN), Storage para fotos |
| Hosting | **Netlify** con el adaptador oficial de Next.js, deploy por Git (GitHub), Deploy Previews por PR |
| Mapa | MapLibre GL o Leaflet con tiles gratuitos (OSM/CARTO), pines **aproximados** |
| Imágenes | Procesado servidor con `sharp`: re-encode (elimina EXIF/GPS), compresión y thumbnails |
| Email transaccional | SMTP personalizado en Supabase Auth (p. ej. Resend, plan gratuito) — el SMTP por defecto de Supabase tiene límites incompatibles con producción |
| Tests | Vitest (unitario: reglas de negocio) + Playwright (smoke E2E de los flujos A y B) |
| Analítica externa | **NO activar** GA4/Clarity (LEGAL-06 abierto). Implementa una capa propia de eventos (`analytics_events` interna, sin PII) tras una interfaz adapter |

Versiona cada decisión relevante adicional como ADR corto en `docs/decisiones/`.

## 3 · Alcance del día: MVP1 completo (8 pilares)

Implementa los ocho pilares del PRD Maestro, priorizando que los **flujos A y B queden operativos de extremo a extremo antes de pulir**:

1. **Landing** — hero con dos CTA («Busco un local» / «Tengo un local»), hasta 6 fichas PUBLISHED destacadas, SEO básico (metadatos, OG, sitemap; `noindex` en rutas privadas y fichas retiradas).
2. **Assessment Emprendedor** — 7 bloques, borrador anónimo 7 días (localStorage + vinculación al registrar), 1–3 comunas, `max_monthly_rent_clp` + `budget_flexibility`, triestado Sí/No/Indiferente.
3. **Assessment Propietario** — 6 bloques, `owner_type`/`owner_relationship`, `property_id` DRAFT estable desde el inicio, `address_full` privado, triestado Sí/No/No sé (No sé ≠ No).
4. **Registro y roles** — registro en un paso (nombre, email, contraseña, teléfono), verificación de correo, cuenta única con doble contexto Emprendedor/Propietario, `return_to` seguro (solo rutas internas whitelisted), rol ADMIN provisionado solo por script/SQL interno, jamás desde el frontend.
5. **Perfiles editables** — datos canónicos, UNA búsqueda activa, «Mis locales», completitud Pendiente/Por completar/Completado, preferencias `marketing_opt_in` y `proactive_opportunities_opt_in` separadas, desmarcadas y revocables.
6. **Publicación gratuita** — DRAFT → PUBLISHED automático al pasar validaciones (correo verificado, campos, 1–12 fotos saneadas, primera = portada); notificación interna ADMIN de revisión POSTERIOR no bloqueante; moderación ADMIN con motivo, log y bloqueo de republicación autónoma; pausa/archivo por el oferente; `availability_last_confirmed_at` solo con confirmación explícita.
7. **Explorar** — solo PUBLISHED, filtros (región/≤3 comunas, tipo, renta, superficie), paginación/lazy load, alternancia lista/mapa con pines aproximados, ficha pública sin PII del oferente, «Me interesa» → registro exprés sin assessment → Interest único CONTACT/VISIT con `rent_snapshot_clp` e idempotencia.
8. **Administración** — `/admin` protegido (middleware + RLS + MFA): resumen con metas configurables (200/50), usuarios, propiedades/moderación/vigencia ~30 días, bandeja de intereses con asignación, pipeline comercial, precalificación manual, notas, historial append-only, 4 CSV (emprendedores, propietarios, inmuebles, intereses) y auditoría `admin_actions`.

## 4 · Contratos canónicos (usar EXACTAMENTE esta nomenclatura)

**Máquinas de estado independientes — nunca mezclarlas:**
- Assessment: `NOT_STARTED → IN_PROGRESS → COMPLETED`
- Perfil: `Pendiente / Por completar / Completado`
- Property: `DRAFT / PUBLISHED / UNPUBLISHED / ARCHIVED`
- Intención: `CONTACT / VISIT` (intención ≠ visita agendada)
- Pipeline: `NEW → CONTACTED → VISIT_SCHEDULED → VISIT_COMPLETED → IN_NEGOTIATION → WON / LOST` (WON solo con mediación MiLocal confirmada; «ya se arrendó» externo = retiro de ficha, nunca WON; LOST siempre con motivo)
- Precalificación por oportunidad: `Sin revisar / No pertinente / Por validar / Calificado`

**Campos clave:** `max_monthly_rent_clp` (presupuesto demanda) ≠ `monthly_rent_clp` (renta oferta) ≠ `rent_snapshot_clp` (congelado al primer Interest, no se sobrescribe). `interest_attempt_count` + última fecha para insistencias. `unique(user_id, property_id)` como constraint real en BD.

**Catálogo compartido de 7 atributos:** demanda `gas_extraction, three_phase_power, accessibility_required, parking_required, storage_required, terrace_required, gastronomic_fit_required` ↔ oferta `has_gas_extraction, has_three_phase_power, has_accessibility, parking_spaces (numérico), has_storage, has_terrace_or_patio, has_food_service_fitout`.

**Tipos de inmueble:** Local comercial / Oficina / Bodega-Galpón / Otro (sin Stand/Kiosco). **Cobertura:** Región Metropolitana + Viña del Mar; catálogo Región → Comuna sembrado en BD.

**Tablas mínimas:** `profiles`, `entrepreneur_profiles`, `active_searches`, `owner_profiles`, `properties`, `property_photos`, `interests`, `interest_notes`, `interest_status_history`, `admin_actions`, `consents`, `regions`, `communes`, `analytics_events`. Todas con RLS, `created_at`/`updated_at` (ISO, zona America/Santiago documentada), IDs UUID estables. Migraciones versionadas en `supabase/migrations/` (nunca cambios de esquema a mano en consola).

## 5 · Seguridad y privacidad — MUST innegociables (Anexo)

1. **RLS deny-by-default en todas las tablas.** La proyección pública de propiedades es una vista/consulta que expone SOLO campos permitidos: comuna, sector, título, renta, m², atributos, fotos saneadas y coordenada aproximada. `address_full`, coordenadas exactas, contacto del oferente, notas, pipeline y precalificación JAMÁS salen por rutas/API públicas, ni en props serializadas de Next.js, ni en metadatos OG. Escribe tests de acceso cruzado (usuario A no lee datos de B cambiando UUIDs).
2. **Correo verificado** obligatorio para publicar y para crear Interest válido; explorar y editar borradores no lo exigen. Verificación en servidor, no solo UI.
3. **ADMIN:** rol en tabla/claim gestionado por backend, middleware que exige sesión con **MFA (aal2)** para `/admin` y sus APIs, y políticas RLS equivalentes. Usuarios normales: sin MFA, solo correo verificado.
4. **Fotos:** validar MIME real y peso, re-encodear con sharp (elimina EXIF/GPS), generar thumbnails, bucket privado + URLs firmadas o bucket público solo con derivados saneados; retirada efectiva al despublicar (invalidar cache/CDN).
5. **Coordenadas:** guardar la exacta en columna privada; publicar solo versión aproximada (redondeo ~3 decimales o jitter determinista por property_id).
6. **Idempotencia y carreras:** constraint único de Interest + upsert que incrementa insistencias sin tocar fecha original ni snapshot; verificar en backend que la propiedad siga PUBLISHED al registrar el Interest.
7. **Auditoría `admin_actions`:** actor, entidad, acción, motivo, antes/después mínimo y fecha para moderación, cambios de pipeline/precalificación, notas, cierres WON/LOST, exportaciones CSV (con filtros y nº de filas, sin el archivo completo) y cambios de privilegio. Append-only.
8. **CSV:** UTF-8, cabeceras estables versionadas, IDs como texto, fechas ISO 8601, escape anti **CSV formula injection** (prefijar `'` a valores que empiecen con `= + - @`), sin notas privadas ni `address_full` por defecto, descarga solo ADMIN y auditada.
9. **Secretos:** solo en variables de entorno de Netlify y Supabase. Nada de claves en el repo, en el cliente (solo `NEXT_PUBLIC_` para la anon key de Supabase, que RLS protege), en logs ni en el chat. Si un secreto se expone, se rota de inmediato. `service_role` key SOLO en código servidor.
10. **Analítica/logs sin PII:** eventos propios con diccionario permitido (`property_view`, `interest_cta_click`, `interest_submitted`, etc.), sin nombres/emails/teléfonos/presupuestos; `/admin` excluido de toda instrumentación; mensajes de error sin filtrar existencia de cuentas.
11. **Consentimientos:** T&C y Política de Privacidad enlazados en registro, versionados en `consents` con fecha; checkboxes de marketing y oportunidades proactivas separados, opcionales, desmarcados; declaración simple de mayoría de 18 años en el registro.
12. **Rate limiting básico** en registro, login y creación de Interest (middleware o políticas de Supabase Auth).

## 6 · Plan de la jornada (checkpoints verificables)

| Bloque | Entregable verificable |
|---|---|
| **H0–H1 · Fundaciones** | Repo con Next.js 15 + TS + Tailwind + lint/typecheck en CI (GitHub Actions); proyecto Supabase enlazado; sitio Netlify conectado al repo con env vars; deploy «hello world» en la URL real |
| **H1–H3 · Datos y seguridad** | Migraciones completas (tablas, enums, constraints, RLS, vista pública), seed de regiones/comunas y datos demo; tests de RLS y acceso cruzado en verde |
| **H3–H5 · Captación** | Landing + ambos assessments con borrador anónimo y validaciones |
| **H5–H7 · Identidad** | Registro, verificación real de correo (SMTP configurado), doble contexto, return_to, perfiles editables |
| **H7–H9 · Oferta** | Publicación completa: fotos saneadas, DRAFT→PUBLISHED, notificación interna, moderación |
| **H9–H11 · Demanda** | Explorar con filtros+mapa, ficha pública, registro exprés, Interest único con snapshot |
| **H11–H13 · Operación** | /admin completo: MFA, bandeja, pipeline, precalificación, KPIs, 4 CSV, auditoría |
| **H13–H14 · QA y cierre** | Matriz E2E del PRD Maestro (sección 24) ejecutada con Playwright + verificación manual; Lighthouse móvil ≥ 90 en landing y explorar; smoke test en producción |

Regla de avance: no pases de bloque con el anterior roto. Commits pequeños y descriptivos; `main` siempre desplegable.

## 7 · Matriz de aceptación E2E (todas deben pasar antes de cerrar)

1. Visitante abre propiedad PUBLISHED: ficha y pin aproximado visibles, sin PII ni login.
2. «Me interesa» desde visitante: registro exprés + verificación → retorna a la ficha → CONTACT/VISIT sin assessment.
3. Doble envío de interés: un solo Interest, fecha original intacta, insistencias actualizadas.
4. Propietario publica: PUBLISHED inmediato, visible en listado/mapa, aviso interno ADMIN.
5. ADMIN modera: despublicación efectiva e inmediata; propietario no puede republicar; historial íntegro.
6. Cambia el precio tras un Interest: snapshot original y renta vigente conviven sin mutar el lead.
7. Intención VISIT no genera VISIT_SCHEDULED sin coordinación real registrada por ADMIN.
8. «Ya se arrendó» externo: ficha retirada, nunca WON.
9. Usuario sin rol intenta /admin, sus APIs y los CSV: denegado también a nivel API/RLS.
10. ADMIN exporta CSV: dataset correcto, auditoría registrada, PII restringida, anti formula injection.

## 8 · Lo que necesitas del humano (pídelo al inicio, en un solo bloque)

- Proyecto Supabase creado (región más cercana a Chile disponible) y credenciales cargadas como env vars — nunca pegadas en el chat.
- Sitio Netlify conectado al repo GitHub de MiLocal + dominio si existe.
- Cuenta SMTP (p. ej. Resend) para correo transaccional.
- Confirmación de los textos legales disponibles (ver §9).

## 9 · Límite de responsabilidad — gates LEGAL/OPS (comunicar, no omitir)

Los founders decidieron lanzar a **producción abierta con usuarios reales desde el día 1**. El Anexo Transversal condiciona ese paso al cierre de **LEGAL-01..08 y OPS-01..03** (responsable del tratamiento, bases jurídicas, T&C/Política de Privacidad definitivos, retención, proveedores/transferencias, analítica, responsables de incidentes, RPO/RTO y backups probados). Esos cierres son responsabilidad de los founders, no tuya, pero tú DEBES:

- Incluir páginas de Términos y Política de Privacidad con el texto que entreguen los founders; si no existe texto validado, publicar versión provisional claramente marcada «v0 — en revisión legal» y registrarlo como riesgo en el reporte final.
- Verificar backups automáticos de Supabase activos y documentar en `docs/runbooks/` el procedimiento de restauración, rollback de deploy en Netlify y rotación de secretos (ensayar restauración queda como pendiente OPS-01 si no alcanza el tiempo).
- Entregar al cierre la lista de gates LEGAL/OPS abiertos con su estado, sin declararlos cumplidos.

## 10 · Reporte de cierre obligatorio

Al terminar entrega en el README y en tu mensaje final: URL de producción, cobertura por pilar (hecho / parcial / pendiente), resultado real de tests y Lighthouse (sin «debería pasar»), checklist de seguridad §5 verificada punto a punto, gates LEGAL/OPS abiertos, y backlog priorizado del día 2. Reporta limitaciones con honestidad: nada de declarar seguro o completo lo que no verificaste.
