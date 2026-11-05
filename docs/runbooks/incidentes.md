# Runbook · Gestión de incidentes (SEG-10 / OPS-02)

**Responsables nominales y suplentes: PENDIENTE de asignación por founders
(OPS-02).** Este runbook define el procedimiento; sin nombres asignados el
gate sigue abierto.

## Flujo

1. **Detectar** — alerta de proveedor (status.supabase.com,
   netlifystatus.com), reporte de usuario o anomalía en /admin.
2. **Contener** — según el caso: despublicar ficha afectada (moderación),
   rotar secreto (ver `rotacion-secretos.md`), pausar el sitio (Netlify →
   Stop builds + publicar página de mantenimiento), o deshabilitar signups
   (Supabase Auth settings).
3. **Evaluar** — qué datos/titulares/servicios están comprometidos; clasificar
   severidad (S1 exposición de PII / S2 indisponibilidad / S3 degradación).
4. **Escalar** — founders + asesoría legal si hay PII. La Ley 21.719 (art. 14
   sexies, vigente desde 01/12/2026) exige reportar vulneraciones relevantes a
   la autoridad sin dilaciones indebidas; la evaluación es jurídica, no
   técnica.
5. **Recuperar** — restaurar (ver `restauracion-supabase.md`), rollback
   (ver `rollback-netlify.md`), corregir causa raíz.
6. **Documentar** — bitácora cronológica: fechas, decisiones, afectados,
   verificaciones y mejoras preventivas.

## Contactos de plataforma

- Supabase status: https://status.supabase.com · soporte: dashboard → Support
- Netlify status: https://www.netlifystatus.com
- Resend status: https://resend-status.com

## Nota sobre consolas

Supabase Studio es herramienta EXCEPCIONAL (SEG-11): uso solo por personal
técnico autorizado, con MFA, motivo registrado y respaldo previo. No asumir
que estará disponible si el proveedor cae.
