-- ============================================================================
-- MiLocal MVP1 — Migración 0002: RLS deny-by-default, helpers y vistas
-- Principio: ninguna tabla es legible/escribible sin política explícita.
-- Las lecturas ADMIN y las lecturas de intereses propios pasan por vistas
-- controladas (owner = postgres) con predicado de autorización.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers de autorización
-- ----------------------------------------------------------------------------

-- ¿El usuario actual es ADMIN? (tabla admin_users, gestionada solo por script interno)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users au where au.user_id = auth.uid());
$$;

-- ADMIN con sesión MFA (aal2). Toda operación /admin exige este nivel (SEG-12).
create or replace function public.is_admin_aal2()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.is_admin()
     and coalesce(((select auth.jwt()) ->> 'aal'), '') = 'aal2';
$$;

-- ¿Correo verificado? (verificación en servidor, no solo UI)
create or replace function public.email_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;
revoke all on function public.is_admin_aal2() from public;
grant execute on function public.is_admin_aal2() to authenticated, anon;
revoke all on function public.email_verified() from public;
grant execute on function public.email_verified() to authenticated, anon;

-- ----------------------------------------------------------------------------
-- Habilitar RLS en TODAS las tablas (deny-by-default)
-- ----------------------------------------------------------------------------
alter table public.regions enable row level security;
alter table public.communes enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.entrepreneur_profiles enable row level security;
alter table public.active_searches enable row level security;
alter table public.owner_profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_photos enable row level security;
alter table public.interests enable row level security;
alter table public.interest_notes enable row level security;
alter table public.interest_status_history enable row level security;
alter table public.admin_actions enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.consents enable row level security;
alter table public.analytics_events enable row level security;
alter table public.app_settings enable row level security;

-- ----------------------------------------------------------------------------
-- Catálogos: lectura pública, escritura solo por migraciones/service_role
-- ----------------------------------------------------------------------------
create policy regions_read on public.regions for select to anon, authenticated using (true);
create policy communes_read on public.communes for select to anon, authenticated using (true);

-- app_settings: lectura pública (solo contiene metas y versiones de textos legales)
create policy app_settings_read on public.app_settings for select to anon, authenticated using (true);

-- ----------------------------------------------------------------------------
-- profiles: cada titular ve y edita SOLO su fila
-- ----------------------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- admin_users: SIN políticas => invisible e inmutable vía API (solo service_role/SQL).

-- ----------------------------------------------------------------------------
-- entrepreneur_profiles / active_searches / owner_profiles: CRUD del titular
-- ----------------------------------------------------------------------------
create policy ep_select_own on public.entrepreneur_profiles
  for select to authenticated using (user_id = auth.uid());
create policy ep_insert_own on public.entrepreneur_profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy ep_update_own on public.entrepreneur_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy as_select_own on public.active_searches
  for select to authenticated using (user_id = auth.uid());
create policy as_insert_own on public.active_searches
  for insert to authenticated with check (user_id = auth.uid());
create policy as_update_own on public.active_searches
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy as_delete_own on public.active_searches
  for delete to authenticated using (user_id = auth.uid());

create policy op_select_own on public.owner_profiles
  for select to authenticated using (user_id = auth.uid());
create policy op_insert_own on public.owner_profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy op_update_own on public.owner_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- properties: el oferente gestiona SOLO sus inmuebles. Los cambios de estado
-- están protegidos por trigger (solo RPCs). El público NO lee la tabla:
-- lee la vista public_properties.
-- ----------------------------------------------------------------------------
create policy prop_select_own on public.properties
  for select to authenticated using (owner_user_id = auth.uid());

create policy prop_insert_own on public.properties
  for insert to authenticated
  with check (owner_user_id = auth.uid() and status = 'DRAFT');

create policy prop_update_own on public.properties
  for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- property_photos: el oferente ve/reordena fotos de SUS propiedades.
-- La carga/borrado pasa por el pipeline del servidor (service_role) que sanea EXIF/GPS.
create policy photos_select_own on public.property_photos
  for select to authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_id and p.owner_user_id = auth.uid()
  ));

create policy photos_update_own on public.property_photos
  for update to authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_id and p.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.properties p
    where p.id = property_id and p.owner_user_id = auth.uid()
  ));

-- ----------------------------------------------------------------------------
-- interests / notas / historial / auditoría / notificaciones / analytics:
-- SIN políticas de acceso directo. Escrituras vía RPC; lecturas vía vistas.
-- ----------------------------------------------------------------------------

-- consents: el titular registra y consulta sus constancias (append-only)
create policy consents_select_own on public.consents
  for select to authenticated using (user_id = auth.uid());
create policy consents_insert_own on public.consents
  for insert to authenticated with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- PROYECCIÓN PÚBLICA de propiedades: SOLO campos permitidos.
-- (comuna, sector, título, renta, m², atributos, pin aproximado)
-- JAMÁS: address_full, coordenadas exactas, datos del oferente.
-- ----------------------------------------------------------------------------
create view public.public_properties
with (security_invoker = off) as
select
  p.id,
  p.title,
  p.description,
  p.property_type,
  r.name  as region_name,
  r.code  as region_code,
  c.name  as commune_name,
  c.slug  as commune_slug,
  c.id    as commune_id,
  p.sector,
  p.monthly_rent_clp,
  p.rent_is_negotiable,
  p.common_expenses_clp,
  p.guarantee_clp,
  p.surface_m2,
  p.bathrooms,
  p.condition,
  p.available_from,
  p.usage_restrictions,
  p.has_gas_extraction,
  p.has_three_phase_power,
  p.has_accessibility,
  p.parking_spaces,
  p.has_storage,
  p.has_terrace_or_patio,
  p.has_food_service_fitout,
  p.lat_public,
  p.lng_public,
  p.published_at
from public.properties p
join public.communes c on c.id = p.commune_id
join public.regions r on r.id = p.region_id
where p.status = 'PUBLISHED';

grant select on public.public_properties to anon, authenticated;

-- Fotos de propiedades publicadas (solo paths de derivados saneados; las URLs
-- firmadas se generan en el servidor).
create view public.public_property_photos
with (security_invoker = off) as
select ph.id, ph.property_id, ph.storage_path, ph.thumb_path, ph.position, ph.width, ph.height
from public.property_photos ph
join public.properties p on p.id = ph.property_id
where p.status = 'PUBLISHED';

grant select on public.public_property_photos to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Vista del titular: MIS intereses (sin estado comercial ni precalificación,
-- que son datos internos operativos).
-- ----------------------------------------------------------------------------
create view public.my_interests
with (security_invoker = off) as
select
  i.id,
  i.property_id,
  i.intent,
  i.interest_attempt_count,
  i.last_attempt_at,
  i.created_at,
  p.title as property_title,
  p.status as property_status
from public.interests i
join public.properties p on p.id = i.property_id
where i.user_id = auth.uid();

grant select on public.my_interests to authenticated;

-- ----------------------------------------------------------------------------
-- VISTAS ADMIN (requieren is_admin_aal2(); si no, cero filas)
-- ----------------------------------------------------------------------------
create view public.admin_profiles
with (security_invoker = off) as
select
  pr.*,
  (u.email_confirmed_at is not null) as email_verified,
  ep.assessment_status as entrepreneur_assessment_status,
  ep.rubro, ep.subrubro, ep.stage as business_stage, ep.business_name, ep.is_first_location,
  op.assessment_status as owner_assessment_status,
  op.owner_type, op.contact_preference
from public.profiles pr
join auth.users u on u.id = pr.id
left join public.entrepreneur_profiles ep on ep.user_id = pr.id
left join public.owner_profiles op on op.user_id = pr.id
where public.is_admin_aal2();

grant select on public.admin_profiles to authenticated;

create view public.admin_active_searches
with (security_invoker = off) as
select s.*
from public.active_searches s
where public.is_admin_aal2();

grant select on public.admin_active_searches to authenticated;

create view public.admin_properties
with (security_invoker = off) as
select
  p.*,
  c.name as commune_name,
  r.name as region_name,
  pr.full_name as owner_name,
  pr.email as owner_email,
  pr.phone as owner_phone,
  (select count(*) from public.interests i where i.property_id = p.id) as interest_count,
  (select count(*) from public.property_photos ph where ph.property_id = p.id) as photo_count
from public.properties p
left join public.communes c on c.id = p.commune_id
left join public.regions r on r.id = p.region_id
left join public.profiles pr on pr.id = p.owner_user_id
where public.is_admin_aal2();

grant select on public.admin_properties to authenticated;

create view public.admin_interests
with (security_invoker = off) as
select
  i.*,
  pr.full_name as user_name,
  pr.email as user_email,
  pr.phone as user_phone,
  p.title as property_title,
  p.status as property_status,
  p.monthly_rent_clp as current_rent_clp,
  c.name as commune_name,
  apr.full_name as assigned_admin_name
from public.interests i
left join public.profiles pr on pr.id = i.user_id
left join public.properties p on p.id = i.property_id
left join public.communes c on c.id = p.commune_id
left join public.profiles apr on apr.id = i.assigned_admin_user_id
where public.is_admin_aal2();

grant select on public.admin_interests to authenticated;

create view public.admin_interest_notes
with (security_invoker = off) as
select n.*, pr.full_name as author_name
from public.interest_notes n
left join public.profiles pr on pr.id = n.author_user_id
where public.is_admin_aal2();

grant select on public.admin_interest_notes to authenticated;

create view public.admin_interest_history
with (security_invoker = off) as
select h.*, pr.full_name as actor_name
from public.interest_status_history h
left join public.profiles pr on pr.id = h.actor_user_id
where public.is_admin_aal2();

grant select on public.admin_interest_history to authenticated;

create view public.admin_actions_log
with (security_invoker = off) as
select a.*, pr.full_name as actor_name
from public.admin_actions a
left join public.profiles pr on pr.id = a.actor_user_id
where public.is_admin_aal2();

grant select on public.admin_actions_log to authenticated;

create view public.admin_notifications_view
with (security_invoker = off) as
select
  n.*,
  p.title as property_title,
  p.status as property_status
from public.admin_notifications n
left join public.properties p on p.id = n.property_id
where public.is_admin_aal2();

grant select on public.admin_notifications_view to authenticated;

create view public.admin_consents
with (security_invoker = off) as
select cns.*
from public.consents cns
where public.is_admin_aal2();

grant select on public.admin_consents to authenticated;

create view public.admin_analytics_events
with (security_invoker = off) as
select e.*
from public.analytics_events e
where public.is_admin_aal2();

grant select on public.admin_analytics_events to authenticated;

-- ----------------------------------------------------------------------------
-- Endurecer permisos por defecto: revocar acceso directo a tablas sensibles
-- (PostgREST usa GRANTs además de RLS; cinturón y tirantes)
-- ----------------------------------------------------------------------------
revoke all on public.interests from anon, authenticated;
revoke all on public.interest_notes from anon, authenticated;
revoke all on public.interest_status_history from anon, authenticated;
revoke all on public.admin_actions from anon, authenticated;
revoke all on public.admin_notifications from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;
revoke insert, update, delete on public.regions from anon, authenticated;
revoke insert, update, delete on public.communes from anon, authenticated;
revoke insert, update, delete on public.app_settings from anon, authenticated;
revoke delete on public.profiles from anon, authenticated;
revoke delete on public.entrepreneur_profiles from anon, authenticated;
revoke delete on public.owner_profiles from anon, authenticated;
revoke delete on public.properties from anon, authenticated;
revoke insert, delete on public.property_photos from anon, authenticated;
revoke update, delete on public.consents from anon, authenticated;
