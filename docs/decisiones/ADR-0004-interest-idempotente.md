# ADR-0004 · Interest canónico: idempotencia, snapshot e intención

**Estado:** Aceptado.

- `unique (user_id, property_id)` es un constraint real en BD; la creación pasa
  por la RPC `create_interest` (SECURITY DEFINER) que:
  - exige sesión + correo verificado + nombre y teléfono en el perfil;
  - verifica EN LA MISMA TRANSACCIÓN que la propiedad siga `PUBLISHED`
    (`FOR SHARE`);
  - hace upsert: el reintento incrementa `interest_attempt_count` y
    `last_attempt_at` SIN tocar `created_at` ni `rent_snapshot_clp`;
  - congela `rent_snapshot_clp` solo en el primer insert;
  - aplica rate limiting (20/hora por usuario).
- **Intención en reintentos:** se conserva la intención ORIGINAL del Interest;
  el reintento (incluso con otra intención) queda trazado en
  `interest_status_history` (`field = 'intent_attempt'`). Razón: la intención
  es parte del lead canónico que ya está en gestión; cambiarla silenciosamente
  mutaría el lead (prohibido por PRD §18). El equipo ve la nueva intención en
  el historial.
- Inmutabilidad reforzada por trigger: `created_at` y `rent_snapshot_clp` no
  pueden modificarse ni siquiera con `service_role`.
- Un cierre WON/LOST no se reabre automáticamente por un reintento.
