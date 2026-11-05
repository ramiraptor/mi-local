# Runbook · Backups y restauración de Supabase

**Proyecto:** `gtteyldxczqxmvtdojtc` (producción) · Responsable: founders/técnico (OPS-01/OPS-03)

## Estado de backups

- Plan Free de Supabase: **no incluye backups automáticos gestionados**
  descargables. Los planes Pro+ incluyen backups diarios (7 días) y PITR
  opcional. → **Riesgo OPS-01 abierto**: decidir upgrade a Pro o backup propio
  programado ANTES de operar con datos reales.
- Backup lógico manual (cualquier plan), desde una máquina con acceso:

```bash
# Esquema + datos (usa el pooler IPv4; pedir el host exacto en Dashboard → Settings → Database)
supabase db dump --db-url "$PROD_DB_URL" -f backup_schema.sql
supabase db dump --db-url "$PROD_DB_URL" --data-only -f backup_data.sql
```

- **Fotos (Storage)**: el bucket `property-photos` NO entra en el dump SQL.
  Respaldar objetos por separado (script con `service_role` listando
  `storage.objects` y descargando cada path), junto con la tabla
  `property_photos` que guarda orden/portada.

## Restauración (ensayo pendiente — OPS-01)

1. Crear proyecto Supabase limpio (staging).
2. Aplicar migraciones versionadas: `supabase db push --db-url <staging>`.
3. Restaurar datos: `psql <staging> -f backup_data.sql`.
4. Subir objetos de Storage respaldados al bucket `property-photos`.
5. Verificar relaciones usuarios–inmuebles–intereses:
   `select count(*) from interests i join properties p on p.id = i.property_id;`
6. Correr `npm run test:rls` apuntando al staging.

⚠️ Una restauración NO debe reactivar datos ya suprimidos/rectificados por
ejercicio de derechos: revisar solicitudes de privacidad posteriores a la fecha
del backup antes de abrir tráfico.

## Rotación ante credencial filtrada

Ver `rotacion-secretos.md`.
