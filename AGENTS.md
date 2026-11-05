# AGENTS.md — Reglas para agentes de código en milocal-mvp1

1. **Fuentes de verdad:** `MiLocal_PRD_Maestro_MVP1_v1.0.md` (funcional) y
   `MiLocal_Anexo_Transversal_Seguridad_Privacidad_Datos_v1.0.md` (seguridad,
   MUST innegociables). Precedencia: Anexo > PRD Maestro > instrucciones del
   operador > criterio propio.
2. **No agregar** nada excluido del MVP1: matching/scoring, porcentajes de
   compatibilidad, chat usuario–propietario, agenda automática, KYC, OTP
   telefónico, pagos, BI avanzado, venta/divulgación de datos.
3. **Nomenclatura canónica obligatoria** (ver `docs/decisiones/ADR-0002`):
   las máquinas de estado nunca se mezclan.
4. **Esquema solo por migraciones** versionadas en `supabase/migrations/`;
   jamás cambios a mano en consola. Toda tabla nueva nace con RLS.
5. **Secretos** solo en env vars (Netlify/Supabase/.env* locales gitignoreados).
   `service_role` únicamente en código de servidor.
6. **Antes de commitear:** `npm run lint && npm run typecheck && npm test`.
   Para cambios de BD/permisos: `npm run test:rls` (requiere `supabase start`).
7. Commits pequeños y descriptivos; `main` siempre desplegable; PRs pequeñas
   cuando haya colaboración.
8. Reportar resultados REALES de pruebas (nunca «debería pasar») y declarar
   explícitamente lo no implementado.
