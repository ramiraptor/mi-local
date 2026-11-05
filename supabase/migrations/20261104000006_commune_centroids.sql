-- ============================================================================
-- Migración 0006: centroides referenciales por comuna + fallback de pin
-- Decisión (ADR-0006): sin geocodificación externa en MVP1 (no se envía
-- address_full a terceros). El pin público usa lat/lng exacta si el equipo la
-- carga, o el centroide de la comuna; siempre con jitter determinista.
-- ============================================================================

alter table public.communes
  add column if not exists lat double precision,
  add column if not exists lng double precision;

update public.communes as c set lat = v.lat, lng = v.lng
from (values
  ('santiago', -33.4489, -70.6693),
  ('cerrillos', -33.4989, -70.7096),
  ('cerro-navia', -33.4228, -70.7405),
  ('conchali', -33.3800, -70.6750),
  ('el-bosque', -33.5611, -70.6750),
  ('estacion-central', -33.4598, -70.6983),
  ('huechuraba', -33.3690, -70.6350),
  ('independencia', -33.4167, -70.6667),
  ('la-cisterna', -33.5289, -70.6620),
  ('la-florida', -33.5226, -70.5985),
  ('la-granja', -33.5386, -70.6250),
  ('la-pintana', -33.5833, -70.6340),
  ('la-reina', -33.4450, -70.5400),
  ('las-condes', -33.4089, -70.5674),
  ('lo-barnechea', -33.3500, -70.5180),
  ('lo-espejo', -33.5220, -70.6880),
  ('lo-prado', -33.4440, -70.7250),
  ('macul', -33.4870, -70.5980),
  ('maipu', -33.5110, -70.7580),
  ('nunoa', -33.4569, -70.5975),
  ('pedro-aguirre-cerda', -33.4900, -70.6740),
  ('penalolen', -33.4890, -70.5400),
  ('providencia', -33.4314, -70.6093),
  ('pudahuel', -33.4420, -70.7650),
  ('quilicura', -33.3670, -70.7290),
  ('quinta-normal', -33.4290, -70.6980),
  ('recoleta', -33.4060, -70.6390),
  ('renca', -33.4040, -70.7290),
  ('san-joaquin', -33.4930, -70.6280),
  ('san-miguel', -33.4970, -70.6510),
  ('san-ramon', -33.5360, -70.6420),
  ('vitacura', -33.3900, -70.5720),
  ('puente-alto', -33.6110, -70.5760),
  ('pirque', -33.6380, -70.5450),
  ('san-jose-de-maipo', -33.6410, -70.3520),
  ('colina', -33.2040, -70.6750),
  ('lampa', -33.2860, -70.8760),
  ('tiltil', -33.0860, -70.9280),
  ('san-bernardo', -33.5920, -70.6990),
  ('buin', -33.7330, -70.7420),
  ('calera-de-tango', -33.6280, -70.7650),
  ('paine', -33.8080, -70.7410),
  ('melipilla', -33.6890, -71.2130),
  ('alhue', -34.0280, -71.1000),
  ('curacavi', -33.4010, -71.1440),
  ('maria-pinto', -33.5160, -71.1240),
  ('san-pedro', -33.8940, -71.4550),
  ('talagante', -33.6640, -70.9280),
  ('el-monte', -33.6810, -70.9840),
  ('isla-de-maipo', -33.7500, -70.9000),
  ('padre-hurtado', -33.5740, -70.8100),
  ('penaflor', -33.6060, -70.8760),
  ('vina-del-mar', -33.0245, -71.5518)
) as v(slug, lat, lng)
where c.slug = v.slug;

-- publish_property: pin aproximado con fallback al centroide de la comuna
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
  v_base_lat double precision;
  v_base_lng double precision;
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

  -- Base del pin público: coordenada exacta (privada) si existe; si no,
  -- centroide de la comuna. Jamás se publica la exacta.
  select coalesce(v_prop.lat_exact, c.lat), coalesce(v_prop.lng_exact, c.lng)
  into v_base_lat, v_base_lng
  from public.communes c where c.id = v_prop.commune_id;

  perform pg_catalog.set_config('app.allow_guarded_property_change', 'on', true);

  update public.properties
  set status = 'PUBLISHED',
      published_at = now(),
      first_published_at = coalesce(first_published_at, now()),
      unpublished_at = null,
      lat_public = app_private.approx_coord(id::text || ':lat', v_base_lat),
      lng_public = app_private.approx_coord(id::text || ':lng', v_base_lng),
      availability_last_confirmed_at = now()
  where id = p_property_id;

  insert into public.admin_notifications (type, property_id) values ('NEW_PUBLICATION', p_property_id);

  return jsonb_build_object('id', p_property_id, 'status', 'PUBLISHED');
end;
$$;
grant execute on function public.publish_property(uuid) to authenticated;
