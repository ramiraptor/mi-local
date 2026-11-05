-- ============================================================================
-- Provisión de rol ADMIN — SOLO por circuito interno (SQL Editor de Supabase
-- o psql con service_role). JAMÁS desde el frontend ni por registro público.
--
-- Requisito previo: la persona ya creó su cuenta normal (email verificado) y
-- enrolará MFA TOTP en /admin/mfa en su primer acceso (aal2 obligatorio).
--
-- Uso: reemplazar el correo y ejecutar. Queda auditado en admin_actions.
-- ============================================================================

do $$
declare
  v_email text := 'CAMBIAR-ESTE-CORREO@milocal.cl';
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = v_email;
  if v_user_id is null then
    raise exception 'No existe usuario con correo %. Debe registrarse primero.', v_email;
  end if;

  insert into public.admin_users (user_id, note)
  values (v_user_id, 'Provisionado por script interno ' || now()::date)
  on conflict (user_id) do nothing;

  insert into public.admin_actions (actor_user_id, entity_type, entity_id, action, reason)
  values (null, 'admin_user', v_user_id, 'PRIVILEGE_GRANT',
          'Alta ADMIN por script interno (scripts/provision_admin.sql)');

  raise notice 'ADMIN provisionado: % (%)', v_email, v_user_id;
end $$;

-- Para REVOCAR (baja controlada, también auditada):
-- do $$
-- declare
--   v_email text := 'CORREO-A-REVOCAR@milocal.cl';
--   v_user_id uuid;
-- begin
--   select id into v_user_id from auth.users where email = v_email;
--   delete from public.admin_users where user_id = v_user_id;
--   insert into public.admin_actions (actor_user_id, entity_type, entity_id, action, reason)
--   values (null, 'admin_user', v_user_id, 'PRIVILEGE_REVOKE', 'Baja ADMIN por script interno');
-- end $$;
