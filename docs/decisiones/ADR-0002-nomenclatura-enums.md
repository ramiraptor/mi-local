# ADR-0002 · Nomenclatura canónica y mapeo de enums

**Estado:** Aceptado.

Las máquinas de estado del PRD Maestro §15 se implementan como enums de
Postgres con tokens EXACTOS. Para estados cuyo nombre canónico es en español,
el token es la forma MAYÚSCULA_CON_GUIONES y la etiqueta de presentación vive
en `src/lib/constants.ts` (`LABELS`):

| Dominio | Tokens BD | Etiquetas UI |
|---|---|---|
| Assessment | `NOT_STARTED / IN_PROGRESS / COMPLETED` | — |
| Perfil (derivado, no almacenado) | — | Pendiente / Por completar / Completado |
| Property | `DRAFT / PUBLISHED / UNPUBLISHED / ARCHIVED` | Borrador / Publicada / Pausada / Archivada |
| Intención | `CONTACT / VISIT` | — |
| Pipeline | `NEW / CONTACTED / VISIT_SCHEDULED / VISIT_COMPLETED / IN_NEGOTIATION / WON / LOST` | — |
| Precalificación | `SIN_REVISAR / NO_PERTINENTE / POR_VALIDAR / CALIFICADO` | Sin revisar / No pertinente / Por validar / Calificado |
| Triestado demanda | `SI / NO / INDIFERENTE` | Sí / No / Indiferente |
| Triestado oferta | `SI / NO / NO_SE` | Sí / No / No sé (No sé ≠ No; NULL en `parking_spaces` = no informado) |

Decisiones adicionales (campos no especificados al detalle en el PRD):

- `budget_flexibility`: `SIN_FLEXIBILIDAD / HASTA_10 / HASTA_20 / EVALUA_CASO`.
- `business_stage`: `IDEA / EN_MARCHA / EN_EXPANSION`.
- `search_horizon`: `INMEDIATO / UNO_TRES_MESES / TRES_SEIS_MESES / MAS_SEIS_MESES / EXPLORANDO`.
- `property_condition`: `EXCELENTE / BUENO / REGULAR / A_REFACCIONAR`.
- La completitud del perfil (Pendiente/Por completar/Completado) se CALCULA en
  `src/app/perfil/page.tsx` a partir de assessment + datos mínimos; no se
  almacena, evitando estados paralelos incoherentes.
