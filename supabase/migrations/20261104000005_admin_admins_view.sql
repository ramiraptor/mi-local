-- Lista de administradores (para asignación de responsables en la bandeja).
-- Solo visible con rol ADMIN + MFA (aal2).
create view public.admin_admins
with (security_invoker = off) as
select au.user_id, pr.full_name, pr.email
from public.admin_users au
left join public.profiles pr on pr.id = au.user_id
where public.is_admin_aal2();

grant select on public.admin_admins to authenticated;
