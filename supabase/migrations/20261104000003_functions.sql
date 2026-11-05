-- ============================================================================
-- MiLocal MVP1 — Migración 0003: funciones de negocio (RPC)
-- Todas las transiciones de estado pasan por aquí: validación en servidor,
-- idempotencia, auditoría y bloqueo de cambios directos (trigger guard).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers privados
-- ----------------------------------------------------------------------------

-- Coordenada pública aproximada: redondeo a 3 decimales + jitter determinista
-- por property_id (±~0.003°). Nunca publicar la coordenada exacta.
create or replace function app_private.approx_coord(p_seed text, p_value double precision)
returns double precision
language sql
immutable
as $$
  select case
    when p_value is null then null
    else round(p_value::numeric, 3)::double precision
         + (((hashtext(p_seed) % 601) - 300)::double precision / 100000.0)
  end;
$$;

create or replace function app_private.log_admin_action(
  p_actor uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_reason text default null,
  p_before jsonb default null,
  p_after jsonb default null,
  p_metadata jsonb default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.admin_actions (actor_user_id, entity_type, entity_id, action, reason, before_state, after_state, metadata)
  values (p_actor, p_entity_type, p_entity_id, p_action, p_reason, p_before, p_after, p_metadata);
$$;

create or replace function app_private.require_admin_aal2()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.is_admin_aal2() then
    raise exception 'ADMIN_AAL2_REQUIRED'
      using hint = 'Se requiere rol ADMIN con sesión MFA (aal2).';
  end if;
  return v_uid;
end;
$$;

-- Estado propio para middleware/UI: ¿soy admin? ¿tengo aal2?
create or replace function public.get_my_admin_status()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'is_admin', public.is_admin(),
    'aal2', coalesce(((select auth.jwt()) ->> 'aal'), '') = 'aal2',
    'email_verified', public.email_verified()
  );
$$;
grant execute on function public.get_my_admin_status() to authenticated;

-- ----------------------------------------------------------------------------
-- PUBLICACIÓN (Flujo A): DRAFT/UNPUBLISHED -> PUBLISHED automático tras
-- validaciones. Notificación interna ADMIN de revisión POSTERIOR no bloqueante.
-- ----------------------------------------------------------------------------
create or replace function public.publish_property(p_property_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_prop public.properties%rowtype;
  v_photo_count integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_prop from public.properties where id = p_property_id for update;
  if not found then
    raise exception 'PROPERTY_NOT_FOUND';
  end if;
  if v_prop.owner_user_id <> v_uid then
    raise exception 'NOT_OWNER';
  end if;
  if not public.email_verified() then
    raise exception 'EMAIL_NOT_VERIFIED'
      using hint = 'Debes verificar tu correo antes de publicar.';
  end if;
  if v_prop.moderation_locked then
    raise exception 'MODERATION_LOCKED'
      using hint = 'Esta publicación fue retirada por el equipo MiLocal y no puede republicarse sin su autorización.';
  end if;
  if v_prop.status not in ('DRAFT', 'UNPUBLISHED') then
    raise exception 'INVALID_STATUS_TRANSITION';
  end if;

  -- Validaciones de completitud mínima para salir a público
  if coalesce(trim(v_prop.title), '') = ''
     or v_prop.property_type is null
     or v_prop.region_id is null
     or v_prop.commune_id is null
     or v_prop.monthly_rent_clp is null
     or v_prop.surface_m2 is null
     or v_prop.owner_relationship is null
  then
    raise exception 'INCOMPLETE_PROPERTY'
      using hint = 'Faltan campos obligatorios: título, tipo, región/comuna, renta, superficie o relación con el inmueble.';
  end if;

  select count(*) into v_photo_count from public.property_photos where property_id = p_property_id;
  if v_photo_count < 1 then
    raise exception 'PHOTOS_REQUIRED' using hint = 'Debes subir al menos 1 fotografía (máximo 12).';
  end if;
  if v_photo_count > 12 then
    raise exception 'TOO_MANY_PHOTOS';
  end if;

  perform pg_catalog.set_config('app.allow_guarded_property_change', 'on', true);

  update public.properties
  set status = 'PUBLISHED',
      published_at = now(),
      first_published_at = coalesce(first_published_at, now()),
      unpublished_at = null,
      lat_public = app_private.approx_coord(id::text || ':lat', lat_exact),
      lng_public = app_private.approx_coord(id::text || ':lng', lng_exact),
      availability_last_confirmed_at = now()  -- publicar ES una confirmación explícita de vigencia
  where id = p_property_id;

  -- Revisión POSTERIOR no bloqueante
  insert into public.admin_notifications (type, property_id) values ('NEW_PUBLICATION', p_property_id);

  return jsonb_build_object('id', p_property_id, 'status', 'PUBLISHED');
end;
$$;
grant execute on function public.publish_property(uuid) to authenticated;

-- Pausa / archivo / «ya se arrendó» externo (NUNCA genera WON)
create or replace function public.owner_unpublish_property(p_property_id uuid, p_mode text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_prop public.properties%rowtype;
  v_new_status public.property_status;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_mode not in ('PAUSE', 'ARCHIVE', 'RENTED_EXTERNAL') then
    raise exception 'INVALID_MODE';
  end if;

  select * into v_prop from public.properties where id = p_property_id for update;
  if not found then
    raise exception 'PROPERTY_NOT_FOUND';
  end if;
  if v_prop.owner_user_id <> v_uid then
    raise exception 'NOT_OWNER';
  end if;

  v_new_status := case when p_mode = 'PAUSE' then 'UNPUBLISHED'::public.property_status
                       else 'ARCHIVED'::public.property_status end;

  perform pg_catalog.set_config('app.allow_guarded_property_change', 'on', true);

  update public.properties
  set status = v_new_status,
      unpublished_at = case when p_mode = 'PAUSE' then now() else unpublished_at end,
      archived_at = case when p_mode <> 'PAUSE' then now() else archived_at end
  where id = p_property_id;

  -- Trazabilidad: arriendo externo se registra, pero JAMÁS como WON
  insert into public.admin_actions (actor_user_id, entity_type, entity_id, action, reason, before_state, after_state)
  values (
    v_uid, 'property', p_property_id,
    case p_mode when 'PAUSE' then 'OWNER_UNPUBLISH' when 'ARCHIVE' then 'OWNER_ARCHIVE' else 'OWNER_RENTED_EXTERNAL' end,
    case when p_mode = 'RENTED_EXTERNAL' then 'Oferente reporta arriendo fuera de MiLocal (retiro de ficha; no es WON).' else null end,
    jsonb_build_object('status', v_prop.status),
    jsonb_build_object('status', v_new_status)
  );

  return jsonb_build_object('id', p_property_id, 'status', v_new_status);
end;
$$;
grant execute on function public.owner_unpublish_property(uuid, text) to authenticated;

-- Confirmación EXPLÍCITA de vigencia (~30 días). Login/edición no renuevan.
create or replace function public.owner_confirm_availability(p_property_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  perform 1 from public.properties where id = p_property_id and owner_user_id = v_uid for update;
  if not found then
    raise exception 'PROPERTY_NOT_FOUND';
  end if;

  perform pg_catalog.set_config('app.allow_guarded_property_change', 'on', true);
  update public.properties set availability_last_confirmed_at = now() where id = p_property_id;
  return jsonb_build_object('id', p_property_id, 'availability_last_confirmed_at', now());
end;
$$;
grant execute on function public.owner_confirm_availability(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- INTERÉS (Flujo B): Interest canónico único, idempotente, con snapshot de
-- renta congelado al primer interés y contador de insistencias.
-- ----------------------------------------------------------------------------
create or replace function public.create_interest(
  p_property_id uuid,
  p_intent public.interest_intent,
  p_source text default 'EXPLORE_DETAIL'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_prop public.properties%rowtype;
  v_profile public.profiles%rowtype;
  v_interest public.interests%rowtype;
  v_created boolean := false;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if not public.email_verified() then
    raise exception 'EMAIL_NOT_VERIFIED'
      using hint = 'Verifica tu correo para enviar la solicitud.';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if v_profile.full_name is null or v_profile.phone is null then
    raise exception 'PROFILE_INCOMPLETE'
      using hint = 'Necesitamos tu nombre y teléfono para gestionar la solicitud.';
  end if;

  if not app_private.hit_rate_limit('interest:' || v_uid::text, 20, interval '1 hour') then
    raise exception 'RATE_LIMITED';
  end if;

  -- Verificar en la MISMA transacción que la propiedad siga PUBLISHED
  select * into v_prop from public.properties where id = p_property_id for share;
  if not found then
    raise exception 'PROPERTY_NOT_FOUND';
  end if;
  if v_prop.status <> 'PUBLISHED' then
    raise exception 'PROPERTY_NOT_PUBLISHED'
      using hint = 'Esta publicación ya no está disponible para nuevas solicitudes.';
  end if;

  insert into public.interests (user_id, property_id, intent, rent_snapshot_clp, source, last_attempt_at)
  values (v_uid, p_property_id, p_intent, v_prop.monthly_rent_clp, p_source, now())
  on conflict (user_id, property_id) do update
    set interest_attempt_count = public.interests.interest_attempt_count + 1,
        last_attempt_at = now()
  returning * into v_interest;

  if v_interest.interest_attempt_count = 1 then
    v_created := true;
    insert into public.admin_notifications (type, interest_id, property_id)
    values ('NEW_INTEREST', v_interest.id, p_property_id);
  else
    -- Insistencia: trazar el reintento sin alterar fecha original ni snapshot
    insert into public.interest_status_history (interest_id, actor_user_id, field, old_value, new_value, reason)
    values (v_interest.id, v_uid, 'intent_attempt', v_interest.intent::text, p_intent::text,
            'Reintento de solicitud (insistencia #' || v_interest.interest_attempt_count || ')');
  end if;

  return jsonb_build_object(
    'id', v_interest.id,
    'created', v_created,
    'intent', v_interest.intent,
    'attempt_count', v_interest.interest_attempt_count,
    'created_at', v_interest.created_at
  );
end;
$$;
grant execute on function public.create_interest(uuid, public.interest_intent, text) to authenticated;

-- ----------------------------------------------------------------------------
-- ANALÍTICA PROPIA (adapter interno, sin PII, /admin excluido)
-- ----------------------------------------------------------------------------
create or replace function public.track_event(
  p_event_name text,
  p_anon_session_id uuid default null,
  p_property_id uuid default null,
  p_props jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean jsonb;
begin
  if not app_private.hit_rate_limit('events:' || coalesce(p_anon_session_id::text, coalesce(auth.uid()::text, 'anon')), 120, interval '1 minute') then
    return; -- silencioso: la analítica jamás debe romper el flujo
  end if;

  -- Diccionario de propiedades permitido (sin PII)
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_clean
  from jsonb_each(coalesce(p_props, '{}'::jsonb))
  where key in ('property_type', 'commune_slug', 'region_code', 'intent', 'source', 'path', 'results_count');

  insert into public.analytics_events (event_name, anon_session_id, property_id, props)
  values (p_event_name, p_anon_session_id, p_property_id, v_clean);
exception
  when check_violation then
    -- evento fuera del diccionario: se descarta en silencio
    return;
end;
$$;
grant execute on function public.track_event(text, uuid, uuid, jsonb) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- OPERACIÓN ADMIN (todas exigen aal2 y auditan en admin_actions)
-- ----------------------------------------------------------------------------

-- Moderación: despublicación con motivo + bloqueo de republicación autónoma
create or replace function public.admin_unpublish_property(p_property_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v_prop public.properties%rowtype;
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'REASON_REQUIRED';
  end if;
  select * into v_prop from public.properties where id = p_property_id for update;
  if not found then
    raise exception 'PROPERTY_NOT_FOUND';
  end if;

  perform pg_catalog.set_config('app.allow_guarded_property_change', 'on', true);
  update public.properties
  set status = 'UNPUBLISHED',
      unpublished_at = now(),
      moderation_locked = true,
      moderation_reason = p_reason
  where id = p_property_id;

  perform app_private.log_admin_action(
    v_admin, 'property', p_property_id, 'ADMIN_UNPUBLISH', p_reason,
    jsonb_build_object('status', v_prop.status, 'moderation_locked', v_prop.moderation_locked),
    jsonb_build_object('status', 'UNPUBLISHED', 'moderation_locked', true)
  );
  return jsonb_build_object('id', p_property_id, 'status', 'UNPUBLISHED', 'moderation_locked', true);
end;
$$;
grant execute on function public.admin_unpublish_property(uuid, text) to authenticated;

-- Liberación/republicación por ADMIN (levanta el bloqueo de moderación)
create or replace function public.admin_release_property(p_property_id uuid, p_reason text, p_republish boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v_prop public.properties%rowtype;
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'REASON_REQUIRED';
  end if;
  select * into v_prop from public.properties where id = p_property_id for update;
  if not found then
    raise exception 'PROPERTY_NOT_FOUND';
  end if;

  perform pg_catalog.set_config('app.allow_guarded_property_change', 'on', true);
  update public.properties
  set moderation_locked = false,
      moderation_reason = null,
      status = case when p_republish then 'PUBLISHED'::public.property_status else status end,
      published_at = case when p_republish then now() else published_at end
  where id = p_property_id;

  perform app_private.log_admin_action(
    v_admin, 'property', p_property_id,
    case when p_republish then 'ADMIN_REPUBLISH' else 'ADMIN_RELEASE_LOCK' end, p_reason,
    jsonb_build_object('status', v_prop.status, 'moderation_locked', v_prop.moderation_locked),
    jsonb_build_object('status', case when p_republish then 'PUBLISHED' else v_prop.status::text end, 'moderation_locked', false)
  );
  return jsonb_build_object('id', p_property_id, 'moderation_locked', false);
end;
$$;
grant execute on function public.admin_release_property(uuid, text, boolean) to authenticated;

-- Marcar notificación interna como revisada
create or replace function public.admin_mark_notification_reviewed(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
begin
  update public.admin_notifications
  set reviewed_at = now(), reviewed_by = v_admin
  where id = p_notification_id and reviewed_at is null;
end;
$$;
grant execute on function public.admin_mark_notification_reviewed(uuid) to authenticated;

-- Pipeline comercial por Interest. WON exige evidencia; LOST exige motivo.
create or replace function public.admin_set_interest_status(
  p_interest_id uuid,
  p_new_status public.commercial_status,
  p_reason text default null,
  p_evidence text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v_int public.interests%rowtype;
begin
  select * into v_int from public.interests where id = p_interest_id for update;
  if not found then
    raise exception 'INTEREST_NOT_FOUND';
  end if;
  if p_new_status = v_int.commercial_status then
    return jsonb_build_object('id', p_interest_id, 'commercial_status', p_new_status);
  end if;
  if p_new_status = 'LOST' and coalesce(trim(p_reason), '') = '' then
    raise exception 'LOST_REASON_REQUIRED';
  end if;
  if p_new_status = 'WON' and coalesce(trim(p_evidence), '') = '' then
    raise exception 'WON_EVIDENCE_REQUIRED'
      using hint = 'WON solo con mediación MiLocal confirmada; registra evidencia/contexto.';
  end if;

  update public.interests
  set commercial_status = p_new_status,
      lost_reason = case when p_new_status = 'LOST' then p_reason else lost_reason end,
      won_evidence = case when p_new_status = 'WON' then p_evidence else won_evidence end,
      closed_at = case when p_new_status in ('WON', 'LOST') then now() else null end
  where id = p_interest_id;

  insert into public.interest_status_history (interest_id, actor_user_id, field, old_value, new_value, reason)
  values (p_interest_id, v_admin, 'commercial_status', v_int.commercial_status::text, p_new_status::text,
          coalesce(p_reason, p_evidence));

  perform app_private.log_admin_action(
    v_admin, 'interest', p_interest_id, 'SET_COMMERCIAL_STATUS', coalesce(p_reason, p_evidence),
    jsonb_build_object('commercial_status', v_int.commercial_status),
    jsonb_build_object('commercial_status', p_new_status)
  );
  return jsonb_build_object('id', p_interest_id, 'commercial_status', p_new_status);
end;
$$;
grant execute on function public.admin_set_interest_status(uuid, public.commercial_status, text, text) to authenticated;

-- Precalificación manual por oportunidad (independiente del pipeline)
create or replace function public.admin_set_qualification(
  p_interest_id uuid,
  p_new_status public.qualification_status,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v_int public.interests%rowtype;
begin
  select * into v_int from public.interests where id = p_interest_id for update;
  if not found then
    raise exception 'INTEREST_NOT_FOUND';
  end if;
  if p_new_status = v_int.qualification_status then
    return jsonb_build_object('id', p_interest_id, 'qualification_status', p_new_status);
  end if;

  update public.interests set qualification_status = p_new_status where id = p_interest_id;

  insert into public.interest_status_history (interest_id, actor_user_id, field, old_value, new_value, reason)
  values (p_interest_id, v_admin, 'qualification_status', v_int.qualification_status::text, p_new_status::text, p_reason);

  perform app_private.log_admin_action(
    v_admin, 'interest', p_interest_id, 'SET_QUALIFICATION', p_reason,
    jsonb_build_object('qualification_status', v_int.qualification_status),
    jsonb_build_object('qualification_status', p_new_status)
  );
  return jsonb_build_object('id', p_interest_id, 'qualification_status', p_new_status);
end;
$$;
grant execute on function public.admin_set_qualification(uuid, public.qualification_status, text) to authenticated;

-- Asignación de responsable
create or replace function public.admin_assign_interest(p_interest_id uuid, p_admin_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v_int public.interests%rowtype;
begin
  select * into v_int from public.interests where id = p_interest_id for update;
  if not found then
    raise exception 'INTEREST_NOT_FOUND';
  end if;
  if p_admin_user_id is not null and not exists (select 1 from public.admin_users where user_id = p_admin_user_id) then
    raise exception 'ASSIGNEE_NOT_ADMIN';
  end if;

  update public.interests set assigned_admin_user_id = p_admin_user_id where id = p_interest_id;

  insert into public.interest_status_history (interest_id, actor_user_id, field, old_value, new_value)
  values (p_interest_id, v_admin, 'assigned_admin_user_id',
          coalesce(v_int.assigned_admin_user_id::text, ''), coalesce(p_admin_user_id::text, ''));

  perform app_private.log_admin_action(
    v_admin, 'interest', p_interest_id, 'ASSIGN_RESPONSIBLE', null,
    jsonb_build_object('assigned_admin_user_id', v_int.assigned_admin_user_id),
    jsonb_build_object('assigned_admin_user_id', p_admin_user_id)
  );
  return jsonb_build_object('id', p_interest_id, 'assigned_admin_user_id', p_admin_user_id);
end;
$$;
grant execute on function public.admin_assign_interest(uuid, uuid) to authenticated;

-- Nota interna mínima (append-only)
create or replace function public.admin_add_interest_note(p_interest_id uuid, p_note text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v_note_id uuid;
begin
  if coalesce(trim(p_note), '') = '' then
    raise exception 'NOTE_REQUIRED';
  end if;
  if not exists (select 1 from public.interests where id = p_interest_id) then
    raise exception 'INTEREST_NOT_FOUND';
  end if;
  insert into public.interest_notes (interest_id, author_user_id, note)
  values (p_interest_id, v_admin, trim(p_note))
  returning id into v_note_id;
  return jsonb_build_object('id', v_note_id);
end;
$$;
grant execute on function public.admin_add_interest_note(uuid, text) to authenticated;

-- Auditoría de exportación CSV (dataset, filtros y nº de filas; nunca el archivo)
create or replace function public.admin_log_csv_export(p_dataset text, p_filters jsonb, p_row_count integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
begin
  if p_dataset not in ('emprendedores', 'propietarios', 'inmuebles', 'intereses') then
    raise exception 'INVALID_DATASET';
  end if;
  perform app_private.log_admin_action(
    v_admin, 'csv_export', null, 'CSV_EXPORT', null, null, null,
    jsonb_build_object('dataset', p_dataset, 'filters', coalesce(p_filters, '{}'::jsonb), 'row_count', p_row_count)
  );
end;
$$;
grant execute on function public.admin_log_csv_export(text, jsonb, integer) to authenticated;

-- Configuración (metas, versiones de textos legales) — auditada
create or replace function public.admin_update_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v_old jsonb;
begin
  select value into v_old from public.app_settings where key = p_key;
  if not found then
    raise exception 'SETTING_NOT_FOUND';
  end if;
  update public.app_settings set value = p_value, updated_at = now() where key = p_key;
  perform app_private.log_admin_action(
    v_admin, 'app_setting', null, 'UPDATE_SETTING', null,
    jsonb_build_object('key', p_key, 'value', v_old),
    jsonb_build_object('key', p_key, 'value', p_value)
  );
end;
$$;
grant execute on function public.admin_update_setting(text, jsonb) to authenticated;

-- Métricas del resumen /admin (KPIs versionados en docs/decisiones/kpi-definitions.md)
create or replace function public.admin_dashboard_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin uuid := app_private.require_admin_aal2();
  v jsonb;
begin
  select jsonb_build_object(
    'goals', (select jsonb_object_agg(key, value) from public.app_settings where key in ('goal_entrepreneurs', 'goal_owners')),
    'entrepreneurs_total', (select count(*) from public.entrepreneur_profiles),
    'entrepreneurs_completed', (select count(*) from public.entrepreneur_profiles where assessment_status = 'COMPLETED'),
    'owners_total', (select count(*) from public.owner_profiles),
    'owners_completed', (select count(*) from public.owner_profiles where assessment_status = 'COMPLETED'),
    'properties_by_status', (
      select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
      from (select status, count(*) as cnt from public.properties group by status) s
    ),
    'interests_total', (select count(*) from public.interests),
    'interests_by_status', (
      select coalesce(jsonb_object_agg(commercial_status, cnt), '{}'::jsonb)
      from (select commercial_status, count(*) as cnt from public.interests group by commercial_status) s
    ),
    'interests_by_qualification', (
      select coalesce(jsonb_object_agg(qualification_status, cnt), '{}'::jsonb)
      from (select qualification_status, count(*) as cnt from public.interests group by qualification_status) s
    ),
    'funnel', jsonb_build_object(
      'property_views', (select count(*) from public.analytics_events where event_name = 'property_view'),
      'interest_cta_clicks', (select count(*) from public.analytics_events where event_name = 'interest_cta_click'),
      'interests_valid', (select count(*) from public.interests),
      'contacted', (select count(*) from public.interests where commercial_status not in ('NEW')),
      'visits_scheduled', (select count(*) from public.interest_status_history where field = 'commercial_status' and new_value = 'VISIT_SCHEDULED'),
      'visits_completed', (select count(*) from public.interest_status_history where field = 'commercial_status' and new_value = 'VISIT_COMPLETED'),
      'won', (select count(*) from public.interests where commercial_status = 'WON')
    ),
    'pending_review_notifications', (select count(*) from public.admin_notifications where reviewed_at is null),
    'stale_availability_published', (
      select count(*) from public.properties
      where status = 'PUBLISHED'
        and (availability_last_confirmed_at is null or availability_last_confirmed_at < now() - interval '30 days')
    )
  ) into v;
  return v;
end;
$$;
grant execute on function public.admin_dashboard_metrics() to authenticated;
