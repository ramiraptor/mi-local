# Runbook · Rotación de secretos

Inventario de secretos y dónde viven (NUNCA en el repo ni en el chat):

| Secreto | Dónde vive | Cómo rotar |
|---|---|---|
| `service_role` / secret key Supabase | Netlify env (`SUPABASE_SERVICE_ROLE_KEY`) | Dashboard Supabase → Settings → API keys → rotate; actualizar env en Netlify; redeploy |
| `anon`/publishable key | Netlify env + cliente (pública, RLS la protege) | Igual que arriba; es pública por diseño |
| Contraseña BD Postgres | Gestor de claves de founders | Dashboard → Settings → Database → Reset password; actualizar scripts de backup |
| API key Resend (SMTP) | Config Auth de Supabase (smtp_pass) | resend.com → revocar y crear nueva; `PATCH /v1/projects/{ref}/config/auth` o Dashboard → Auth → SMTP |
| Personal Access Token Supabase | `.env.ops` local del operador | supabase.com/dashboard/account/tokens → revocar; generar nuevo |
| Netlify PAT | `.env.ops` local del operador | app.netlify.com → User settings → Applications → revocar |
| GitHub (credenciales git) | Credential manager del equipo | github.com → Settings → Developer settings |

## Procedimiento ante filtración

1. **Revocar/rotar de inmediato** el secreto afectado (tabla de arriba).
2. Actualizar el valor en Netlify (`npx netlify env:set …`) y redeploy.
3. Revisar accesos: Supabase Dashboard → Logs (API/Auth) y Netlify deploy log.
4. Si la `service_role` estuvo expuesta: asumir lectura total de BD → evaluar
   notificación según Ley 21.719 art. 14 sexies con asesoría legal (OPS-02).
5. Registrar el incidente: fecha, alcance, acciones, responsable (bitácora).

## Reglas permanentes

- `service_role` jamás en cliente, logs ni variables `NEXT_PUBLIC_*`.
- `.env*` está gitignoreado; verificar con `git status` antes de cada commit.
- Mínimo dos responsables institucionales con acceso de recuperación (MFA) a
  Supabase/Netlify/GitHub — pendiente de formalizar (OPS-03).
