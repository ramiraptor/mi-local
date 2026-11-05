# Definiciones de KPI · v1 (MVP1)

Zona horaria de reporte: **America/Santiago**. Fuente temporal: `created_at`
(timestamptz, UTC en BD). Metas configurables en `app_settings`
(`goal_entrepreneurs` = 200, `goal_owners` = 50) — son referencias de
captación del piloto, no SLA.

| KPI | Fuente | Numerador | Exclusiones / notas |
|---|---|---|---|
| Emprendedores | `entrepreneur_profiles` | count(*) | No implica candidatos calificados |
| Propietarios | `owner_profiles` | count(*) | No equivale a propiedades publicadas |
| Vistas de ficha | `analytics_events` `property_view` | count(*) | Sin PII; /admin excluido; no es interés |
| Clic «Me interesa» | `analytics_events` `interest_cta_click` | count(*) | NO es lead válido |
| Solicitudes válidas | `interests` | count(*) | Solo cuenta con correo verificado (lo exige la RPC) |
| Contactados | `interests` | `commercial_status <> 'NEW'` | El correo automático NO cuenta |
| Calificados | `interests` | `qualification_status = 'CALIFICADO'` | Por oportunidad, no etiqueta global |
| Visitas coordinadas | `interest_status_history` | transiciones a `VISIT_SCHEDULED` | Intención VISIT no cuenta |
| Visitas realizadas | `interest_status_history` | transiciones a `VISIT_COMPLETED` | — |
| Negociaciones | `interests` | `IN_NEGOTIATION` | — |
| Cierres WON | `interests` | `WON` | Solo mediación MiLocal confirmada con evidencia |
| Vigencia por confirmar | `properties` | PUBLISHED con `availability_last_confirmed_at` nulo o >30 días | Solo confirmación explícita renueva |

Implementación: RPC `admin_dashboard_metrics()` (solo ADMIN aal2).
Cambios a estas definiciones se versionan en este archivo.
