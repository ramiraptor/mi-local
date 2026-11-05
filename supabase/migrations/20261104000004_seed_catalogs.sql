-- ============================================================================
-- MiLocal MVP1 — Migración 0004: catálogo Región → Comuna
-- Cobertura MVP1: Región Metropolitana completa + Viña del Mar (Valparaíso).
-- ============================================================================

insert into public.regions (code, name) values
  ('13', 'Región Metropolitana de Santiago'),
  ('05', 'Región de Valparaíso');

with rm as (select id from public.regions where code = '13')
insert into public.communes (region_id, name, slug)
select rm.id, c.name, c.slug from rm, (values
  ('Santiago', 'santiago'),
  ('Cerrillos', 'cerrillos'),
  ('Cerro Navia', 'cerro-navia'),
  ('Conchalí', 'conchali'),
  ('El Bosque', 'el-bosque'),
  ('Estación Central', 'estacion-central'),
  ('Huechuraba', 'huechuraba'),
  ('Independencia', 'independencia'),
  ('La Cisterna', 'la-cisterna'),
  ('La Florida', 'la-florida'),
  ('La Granja', 'la-granja'),
  ('La Pintana', 'la-pintana'),
  ('La Reina', 'la-reina'),
  ('Las Condes', 'las-condes'),
  ('Lo Barnechea', 'lo-barnechea'),
  ('Lo Espejo', 'lo-espejo'),
  ('Lo Prado', 'lo-prado'),
  ('Macul', 'macul'),
  ('Maipú', 'maipu'),
  ('Ñuñoa', 'nunoa'),
  ('Pedro Aguirre Cerda', 'pedro-aguirre-cerda'),
  ('Peñalolén', 'penalolen'),
  ('Providencia', 'providencia'),
  ('Pudahuel', 'pudahuel'),
  ('Quilicura', 'quilicura'),
  ('Quinta Normal', 'quinta-normal'),
  ('Recoleta', 'recoleta'),
  ('Renca', 'renca'),
  ('San Joaquín', 'san-joaquin'),
  ('San Miguel', 'san-miguel'),
  ('San Ramón', 'san-ramon'),
  ('Vitacura', 'vitacura'),
  ('Puente Alto', 'puente-alto'),
  ('Pirque', 'pirque'),
  ('San José de Maipo', 'san-jose-de-maipo'),
  ('Colina', 'colina'),
  ('Lampa', 'lampa'),
  ('Tiltil', 'tiltil'),
  ('San Bernardo', 'san-bernardo'),
  ('Buin', 'buin'),
  ('Calera de Tango', 'calera-de-tango'),
  ('Paine', 'paine'),
  ('Melipilla', 'melipilla'),
  ('Alhué', 'alhue'),
  ('Curacaví', 'curacavi'),
  ('María Pinto', 'maria-pinto'),
  ('San Pedro', 'san-pedro'),
  ('Talagante', 'talagante'),
  ('El Monte', 'el-monte'),
  ('Isla de Maipo', 'isla-de-maipo'),
  ('Padre Hurtado', 'padre-hurtado'),
  ('Peñaflor', 'penaflor')
) as c(name, slug);

with vr as (select id from public.regions where code = '05')
insert into public.communes (region_id, name, slug)
select vr.id, 'Viña del Mar', 'vina-del-mar' from vr;
