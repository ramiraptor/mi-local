# Runbook · Cambio de URL pública a www.milocal.io

**Estado:** PENDIENTE — documentado el 07/11/2026, se ejecutará más adelante.
**URL actual:** https://mi-local-cl.netlify.app → **URL objetivo:** https://www.milocal.io
**Requisito:** acceso al DNS de `milocal.io` (el mismo proveedor donde se
agregaron los registros de Resend para `info.milocal.io`).

La URL antigua no se pierde: con dominio primario configurado, Netlify
redirige `mi-local-cl.netlify.app` → `www.milocal.io` con 301.

## Paso 1 — Asignar el dominio en Netlify

UI: https://app.netlify.com → sitio `mi-local-cl` → **Domain management** →
**Add a domain** → `www.milocal.io` → marcarlo como **Primary domain**.
Agregar también `milocal.io` (quedará como redirección a www).

Por API (token en `.env.ops`):

```powershell
npx netlify api updateSite --data '{ "site_id": "<SITE_ID>", "body": { "custom_domain": "www.milocal.io", "domain_aliases": ["milocal.io"] } }'
```

## Paso 2 — Registros DNS (en el proveedor de milocal.io)

| Host | Tipo | Valor |
|---|---|---|
| `www` | CNAME | `mi-local-cl.netlify.app` |
| `@` (raíz) | A | `75.2.60.5` |

No tocar los registros TXT/MX/CNAME de `info.milocal.io` (Resend).
Propagación: minutos a algunas horas.

## Paso 3 — SSL (automático)

Netlify emite el certificado Let's Encrypt solo cuando el DNS propaga.
Verificar en **Domain management → HTTPS**; si no aparece, botón
**Verify DNS configuration** / **Provision certificate**.

## Paso 4 — Configuración de la app (ORDEN IMPORTA)

Mantener AMBAS URLs en la allow list durante la transición (sesiones y
correos en vuelo); retirar la .netlify.app recién ~1 semana después.

1. **Netlify env** (los 3 contextos) y redeploy:

```powershell
npx netlify env:set NEXT_PUBLIC_SITE_URL "https://www.milocal.io" --context production --context deploy-preview --context branch-deploy
.\scripts\deploy.ps1
```

2. **Supabase Auth** (Dashboard → Authentication → URL Configuration, o
   Management API `PATCH /v1/projects/<REF>/config/auth`):
   - `site_url`: `https://www.milocal.io`
   - `uri_allow_list`: `https://www.milocal.io/**,https://mi-local-cl.netlify.app/**,http://localhost:3000/**`

   Las plantillas de correo usan `{{ .RedirectTo }}` (origen del navegador),
   así que funcionan en ambos dominios mientras ambos estén en la allow list.

3. **CI:** en `.github/workflows/ci.yml`, job `quality` → paso Build →
   `NEXT_PUBLIC_SITE_URL: https://www.milocal.io`.

4. **Docs:** README (línea «Producción:») y cualquier referencia a la URL.

## Paso 5 — Verificación post-cambio

- [ ] `https://www.milocal.io` responde 200 con los headers de seguridad.
- [ ] `https://mi-local-cl.netlify.app` redirige 301 a `www.milocal.io`.
- [ ] `https://milocal.io` redirige a `https://www.milocal.io`.
- [ ] `robots.txt` y `sitemap.xml` muestran la nueva URL.
- [ ] Registro de prueba: el correo llega desde `no-reply@info.milocal.io`,
      el enlace apunta a `www.milocal.io` y confirma correctamente.
- [ ] Login + acceso a `/admin` (MFA) funcionan en el dominio nuevo.
- [ ] Si se usa Google Search Console: dar de alta la nueva propiedad.

## Rollback

Quitar el primary domain en Domain management (el sitio vuelve a atender solo
en `mi-local-cl.netlify.app`) y revertir los pasos 4.1–4.3. Los registros DNS
pueden quedar: sin dominio asignado en Netlify no afectan.
