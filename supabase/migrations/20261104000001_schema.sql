-- ============================================================================
-- MiLocal MVP1 — Migración 0001: esquema base
-- Zona horaria de referencia del producto: America/Santiago.
-- Todos los timestamps se almacenan como timestamptz (UTC) y se presentan
-- en America/Santiago en UI/CSV. IDs: UUID estables.
-- ============================================================================

create extension if not exists pgcrypto;

-- Esquema privado para helpers no expuestos por PostgREST
create schema if not exists app_private;

-- ----------------------------------------------------------------------------
-- ENUMS (contratos canónicos del PRD Maestro §15 — nunca mezclar máquinas)
-- ----------------------------------------------------------------------------
create type public.assessment_status as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

create type public.property_status as enum ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');

create type public.interest_intent as enum ('CONTACT', 'VISIT');

create type public.commercial_status as enum (
  'NEW', 'CONTACTED', 'VISIT_SCHEDULED', 'VISIT_COMPLETED', 'IN_NEGOTIATION', 'WON', 'LOST'
);

-- Precalificación por oportunidad: Sin revisar / No pertinente / Por validar / Calificado
create type public.qualification_status as enum (
  'SIN_REVISAR', 'NO_PERTINENTE', 'POR_VALIDAR', 'CALIFICADO'
);

create type public.owner_type as enum ('PROPIETARIO', 'CORREDOR', 'REPRESENTANTE');

-- Tipos de inmueble MVP1 (sin Stand/Kiosco)
create type public.property_type as enum ('LOCAL_COMERCIAL', 'OFICINA', 'BODEGA_GALPON', 'OTRO');

-- Triestado demanda: Sí / No / Indiferente
create type public.tri_state_demand as enum ('SI', 'NO', 'INDIFERENTE');

-- Triestado oferta: Sí / No / No sé  (No sé ≠ No; no informado ≠ No)
create type public.tri_state_offer as enum ('SI', 'NO', 'NO_SE');

create type public.budget_flexibility as enum (
  'SIN_FLEXIBILIDAD', 'HASTA_10', 'HASTA_20', 'EVALUA_CASO'
);

create type public.business_stage as enum ('IDEA', 'EN_MARCHA', 'EN_EXPANSION');

create type public.search_horizon as enum (
  'INMEDIATO', 'UNO_TRES_MESES', 'TRES_SEIS_MESES', 'MAS_SEIS_MESES', 'EXPLORANDO'
);

create type public.contact_preference as enum ('TELEFONO', 'EMAIL', 'WHATSAPP');

create type public.property_condition as enum ('EXCELENTE', 'BUENO', 'REGULAR', 'A_REFACCIONAR');

-- ----------------------------------------------------------------------------
-- Trigger genérico updated_at
-- ----------------------------------------------------------------------------
create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- CATÁLOGOS: regiones y comunas (cobertura MVP1: RM + Viña del Mar)
-- ----------------------------------------------------------------------------
create table public.regions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,          -- código oficial ("13", "05")
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.communes (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions (id),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (region_id, name)
);

-- ----------------------------------------------------------------------------
-- PERFIL CANÓNICO (1:1 con auth.users). El rol ADMIN vive en admin_users,
-- provisionado SOLO por script interno (jamás desde frontend).
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,                         -- copia sincronizada desde auth.users (uso interno/export)
  full_name text,
  phone text,
  entrepreneur_context_active boolean not null default false,
  owner_context_active boolean not null default false,
  marketing_opt_in boolean not null default false,              -- opcional, desmarcado, revocable
  proactive_opportunities_opt_in boolean not null default false, -- opcional, desmarcado, revocable
  adult_declaration boolean not null default false,              -- declaración simple 18+
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated before update on public.profiles
for each row execute function app_private.set_updated_at();

-- Tabla de rol privilegiado. Sin políticas RLS => deny-by-default total.
-- Alta/baja solo por script SQL interno (scripts/provision_admin.sql), auditada.
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  note text
);

-- ----------------------------------------------------------------------------
-- CONTEXTO EMPRENDEDOR
-- ----------------------------------------------------------------------------
create table public.entrepreneur_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  assessment_status public.assessment_status not null default 'NOT_STARTED',
  rubro text,
  subrubro text,
  stage public.business_stage,
  business_name text,
  is_first_location boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_entrepreneur_profiles_updated before update on public.entrepreneur_profiles
for each row execute function app_private.set_updated_at();

-- UNA búsqueda activa por usuario (unique user_id).
create table public.active_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  region_id uuid references public.regions (id),
  commune_ids uuid[] not null default '{}',
  sector text,
  territorial_flexibility boolean,
  property_type public.property_type,
  surface_min_m2 integer check (surface_min_m2 is null or surface_min_m2 >= 0),
  surface_max_m2 integer check (surface_max_m2 is null or surface_max_m2 >= 0),
  max_monthly_rent_clp bigint check (max_monthly_rent_clp is null or max_monthly_rent_clp >= 0),
  budget_flexibility public.budget_flexibility,
  -- Catálogo compartido de 7 atributos (demanda): Sí / No / Indiferente
  gas_extraction public.tri_state_demand not null default 'INDIFERENTE',
  three_phase_power public.tri_state_demand not null default 'INDIFERENTE',
  accessibility_required public.tri_state_demand not null default 'INDIFERENTE',
  parking_required public.tri_state_demand not null default 'INDIFERENTE',
  storage_required public.tri_state_demand not null default 'INDIFERENTE',
  terrace_required public.tri_state_demand not null default 'INDIFERENTE',
  gastronomic_fit_required public.tri_state_demand not null default 'INDIFERENTE',
  horizon public.search_horizon,
  install_window_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communes_max_three check (cardinality(commune_ids) <= 3)
);

create trigger trg_active_searches_updated before update on public.active_searches
for each row execute function app_private.set_updated_at();

-- ----------------------------------------------------------------------------
-- CONTEXTO PROPIETARIO / OFERENTE
-- ----------------------------------------------------------------------------
create table public.owner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  assessment_status public.assessment_status not null default 'NOT_STARTED',
  owner_type public.owner_type,
  contact_preference public.contact_preference,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_owner_profiles_updated before update on public.owner_profiles
for each row execute function app_private.set_updated_at();

-- ----------------------------------------------------------------------------
-- PROPIEDADES. address_full y coordenadas exactas son PRIVADAS; la proyección
-- pública expone solo lat/lng aproximadas (vista public_properties).
-- ----------------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  owner_relationship public.owner_type,       -- relación del oferente con ESTE inmueble
  status public.property_status not null default 'DRAFT',
  title text,
  description text,
  property_type public.property_type,
  region_id uuid references public.regions (id),
  commune_id uuid references public.communes (id),
  sector text,
  address_full text,                           -- PRIVADO: jamás en proyección pública
  lat_exact double precision,                  -- PRIVADO
  lng_exact double precision,                  -- PRIVADO
  lat_public double precision,                 -- aproximada determinista (set al publicar)
  lng_public double precision,
  monthly_rent_clp bigint check (monthly_rent_clp is null or monthly_rent_clp >= 0),
  rent_is_negotiable boolean not null default false,
  common_expenses_clp bigint check (common_expenses_clp is null or common_expenses_clp >= 0),
  guarantee_clp bigint check (guarantee_clp is null or guarantee_clp >= 0),
  surface_m2 numeric(10,1) check (surface_m2 is null or surface_m2 > 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  condition public.property_condition,
  available_from date,
  usage_restrictions text,
  -- Catálogo compartido de 7 atributos (oferta): Sí / No / No sé + estacionamientos numéricos
  has_gas_extraction public.tri_state_offer not null default 'NO_SE',
  has_three_phase_power public.tri_state_offer not null default 'NO_SE',
  has_accessibility public.tri_state_offer not null default 'NO_SE',
  parking_spaces integer check (parking_spaces is null or parking_spaces >= 0), -- null = no informado
  has_storage public.tri_state_offer not null default 'NO_SE',
  has_terrace_or_patio public.tri_state_offer not null default 'NO_SE',
  has_food_service_fitout public.tri_state_offer not null default 'NO_SE',
  availability_last_confirmed_at timestamptz,  -- SOLO con confirmación explícita
  published_at timestamptz,
  first_published_at timestamptz,
  unpublished_at timestamptz,
  archived_at timestamptz,
  moderation_locked boolean not null default false, -- true => no puede republicar sin ADMIN
  moderation_reason text,
  admin_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_properties_owner on public.properties (owner_user_id);
create index idx_properties_status_commune on public.properties (status, commune_id);
create index idx_properties_published on public.properties (published_at desc) where status = 'PUBLISHED';

create trigger trg_properties_updated before update on public.properties
for each row execute function app_private.set_updated_at();

-- Guardia de integridad: columnas de estado/moderación/vigencia solo cambian
-- dentro de RPCs autorizadas (que fijan app.allow_guarded_property_change).
create or replace function app_private.guard_property_changes()
returns trigger
language plpgsql
as $$
begin
  if coalesce(current_setting('app.allow_guarded_property_change', true), '') = 'on' then
    return new;
  end if;
  if new.status is distinct from old.status
     or new.published_at is distinct from old.published_at
     or new.first_published_at is distinct from old.first_published_at
     or new.unpublished_at is distinct from old.unpublished_at
     or new.archived_at is distinct from old.archived_at
     or new.moderation_locked is distinct from old.moderation_locked
     or new.moderation_reason is distinct from old.moderation_reason
     or new.admin_reviewed_at is distinct from old.admin_reviewed_at
     or new.availability_last_confirmed_at is distinct from old.availability_last_confirmed_at
     or new.lat_public is distinct from old.lat_public
     or new.lng_public is distinct from old.lng_public
     or new.owner_user_id is distinct from old.owner_user_id
  then
    raise exception 'GUARDED_COLUMN_CHANGE_DENIED'
      using hint = 'Los cambios de estado/moderación/vigencia se realizan mediante funciones autorizadas.';
  end if;
  return new;
end;
$$;

create trigger trg_properties_guard before update on public.properties
for each row execute function app_private.guard_property_changes();

-- ----------------------------------------------------------------------------
-- FOTOS (derivados saneados con sharp; bucket privado + URLs firmadas)
-- ----------------------------------------------------------------------------
create table public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  thumb_path text not null,
  position integer not null default 0,         -- la posición 0 es la portada
  width integer,
  height integer,
  bytes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_property_photos_property on public.property_photos (property_id, position);

create trigger trg_property_photos_updated before update on public.property_photos
for each row execute function app_private.set_updated_at();

-- El dueño solo puede reordenar; paths/medidas son del pipeline del servidor.
create or replace function app_private.guard_photo_changes()
returns trigger
language plpgsql
as $$
begin
  if coalesce(current_setting('app.allow_guarded_property_change', true), '') = 'on' then
    return new;
  end if;
  if new.storage_path is distinct from old.storage_path
     or new.thumb_path is distinct from old.thumb_path
     or new.property_id is distinct from old.property_id
     or new.width is distinct from old.width
     or new.height is distinct from old.height
     or new.bytes is distinct from old.bytes
  then
    raise exception 'GUARDED_COLUMN_CHANGE_DENIED';
  end if;
  return new;
end;
$$;

create trigger trg_property_photos_guard before update on public.property_photos
for each row execute function app_private.guard_photo_changes();

-- ----------------------------------------------------------------------------
-- INTERESES: Interest canónico único por (user_id, property_id)
-- ----------------------------------------------------------------------------
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id),
  intent public.interest_intent not null,
  commercial_status public.commercial_status not null default 'NEW',
  qualification_status public.qualification_status not null default 'SIN_REVISAR',
  rent_snapshot_clp bigint,                    -- congelado al PRIMER interés; nunca se sobrescribe
  interest_attempt_count integer not null default 1,
  last_attempt_at timestamptz not null default now(),
  assigned_admin_user_id uuid references auth.users (id),
  source text,
  lost_reason text,
  won_evidence text,
  closed_at timestamptz,
  created_at timestamptz not null default now(), -- fecha del PRIMER interés; nunca se modifica
  updated_at timestamptz not null default now(),
  constraint interests_unique_pair unique (user_id, property_id)
);

create index idx_interests_property on public.interests (property_id);
create index idx_interests_status on public.interests (commercial_status);
create index idx_interests_assigned on public.interests (assigned_admin_user_id);

create trigger trg_interests_updated before update on public.interests
for each row execute function app_private.set_updated_at();

-- Protección adicional: created_at y rent_snapshot_clp inmutables.
create or replace function app_private.guard_interest_immutables()
returns trigger
language plpgsql
as $$
begin
  if new.created_at is distinct from old.created_at then
    raise exception 'INTEREST_CREATED_AT_IMMUTABLE';
  end if;
  if old.rent_snapshot_clp is not null and new.rent_snapshot_clp is distinct from old.rent_snapshot_clp then
    raise exception 'INTEREST_SNAPSHOT_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger trg_interests_immutable before update on public.interests
for each row execute function app_private.guard_interest_immutables();

-- Notas internas: append-only, visibles solo para ADMIN.
create table public.interest_notes (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references public.interests (id) on delete cascade,
  author_user_id uuid not null references auth.users (id),
  note text not null,
  created_at timestamptz not null default now()
);

create index idx_interest_notes_interest on public.interest_notes (interest_id);

-- Historial de transiciones: append-only.
create table public.interest_status_history (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references public.interests (id) on delete cascade,
  actor_user_id uuid references auth.users (id),
  field text not null check (field in ('commercial_status', 'qualification_status', 'assigned_admin_user_id', 'intent_attempt')),
  old_value text,
  new_value text,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_interest_history_interest on public.interest_status_history (interest_id);

-- ----------------------------------------------------------------------------
-- AUDITORÍA ADMIN (append-only) — SEG-16
-- ----------------------------------------------------------------------------
create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  reason text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb,                              -- p. ej. filtros y nº de filas de un CSV
  created_at timestamptz not null default now()
);

create index idx_admin_actions_entity on public.admin_actions (entity_type, entity_id);
create index idx_admin_actions_actor on public.admin_actions (actor_user_id, created_at desc);

-- Notificaciones internas (revisión posterior no bloqueante)
create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('NEW_PUBLICATION', 'NEW_INTEREST')),
  property_id uuid references public.properties (id) on delete cascade,
  interest_id uuid references public.interests (id) on delete cascade,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id)
);

create index idx_admin_notifications_pending on public.admin_notifications (created_at desc) where reviewed_at is null;

-- ----------------------------------------------------------------------------
-- CONSENTIMIENTOS (versionados, append-only)
-- ----------------------------------------------------------------------------
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null check (consent_type in (
    'TERMS', 'PRIVACY', 'MARKETING_OPT_IN', 'PROACTIVE_OPPORTUNITIES_OPT_IN', 'ADULT_DECLARATION'
  )),
  version text not null,
  granted boolean not null,
  source text,
  created_at timestamptz not null default now()
);

create index idx_consents_user on public.consents (user_id, consent_type, created_at desc);

-- ----------------------------------------------------------------------------
-- ANALÍTICA PROPIA (sin PII; /admin excluido). LEGAL-06: GA4/Clarity NO activos.
-- ----------------------------------------------------------------------------
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in (
    'landing_view', 'cta_busco_local_click', 'cta_tengo_local_click',
    'assessment_entrepreneur_started', 'assessment_entrepreneur_completed',
    'assessment_owner_started', 'assessment_owner_completed',
    'registration_completed', 'property_published',
    'explore_view', 'property_view', 'interest_cta_click', 'interest_submitted'
  )),
  anon_session_id uuid,                        -- id aleatorio de sesión del navegador, sin vínculo a cuenta
  property_id uuid,
  props jsonb not null default '{}'::jsonb,    -- claves whitelisted (sin PII)
  created_at timestamptz not null default now()
);

create index idx_analytics_events_name on public.analytics_events (event_name, created_at desc);

-- ----------------------------------------------------------------------------
-- CONFIGURACIÓN DE APLICACIÓN (metas configurables, versiones legales)
-- ----------------------------------------------------------------------------
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('goal_entrepreneurs', '200'::jsonb),
  ('goal_owners', '50'::jsonb),
  ('terms_version', '"v0-en-revision-legal"'::jsonb),
  ('privacy_version', '"v0-en-revision-legal"'::jsonb),
  ('csv_header_version', '"v1"'::jsonb);

-- ----------------------------------------------------------------------------
-- RATE LIMITING básico (usado por RPCs)
-- ----------------------------------------------------------------------------
create table app_private.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits integer not null default 1
);

create or replace function app_private.hit_rate_limit(p_key text, p_max integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_allowed boolean;
begin
  insert into app_private.rate_limits as rl (key, window_start, hits)
  values (p_key, v_now, 1)
  on conflict (key) do update
    set hits = case when rl.window_start < v_now - p_window then 1 else rl.hits + 1 end,
        window_start = case when rl.window_start < v_now - p_window then v_now else rl.window_start end
  returning hits <= p_max into v_allowed;
  return v_allowed;
end;
$$;

-- ----------------------------------------------------------------------------
-- Sincronización auth.users -> profiles
-- ----------------------------------------------------------------------------
create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

create or replace function app_private.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
after update of email on auth.users
for each row execute function app_private.handle_user_email_change();

-- ----------------------------------------------------------------------------
-- Bucket de Storage para fotos (PRIVADO: solo URLs firmadas de derivados saneados)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', false)
on conflict (id) do nothing;
