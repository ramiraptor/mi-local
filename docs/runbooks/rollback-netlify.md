# Runbook · Rollback de deploy en Netlify

**Sitio:** `mi-local-cl` → https://mi-local-cl.netlify.app

## Rollback inmediato (UI — recomendado)

1. https://app.netlify.com → sitio `mi-local-cl` → **Deploys**.
2. Elegir el último deploy sano (verde) → **Publish deploy**.
3. El sitio vuelve a esa versión al instante (atómico, sin rebuild).

## Rollback por CLI

```powershell
npx netlify api listSiteDeploys --data '{ "site_id": "<SITE_ID>" }'   # ubicar deploy_id sano
npx netlify api restoreSiteDeploy --data '{ "site_id": "<SITE_ID>", "deploy_id": "<DEPLOY_ID>" }'
```

## Compatibilidad con migraciones de BD

Las migraciones de Supabase NO se revierten con el rollback del frontend.
Regla: las migraciones deben ser retrocompatibles con la versión anterior del
frontend (aditivas). Si una migración rompe la versión anterior:
1. Publicar fix-forward en vez de rollback, o
2. Aplicar una migración correctiva (`supabase db push`) antes del rollback.

## Caída del panel /admin

- El código del panel se revierte con el rollback normal.
- Si el problema es de datos/permisos: diagnosticar con el SQL Editor de
  Supabase (acceso técnico excepcional, con MFA, motivo y respaldo previo —
  SEG-11). No operar el negocio por consola salvo emergencia documentada.
