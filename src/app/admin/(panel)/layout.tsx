import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Guard de servidor del panel (defensa en profundidad, además del middleware y
 * de las vistas/RPCs con is_admin_aal2() en la capa de datos).
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?return_to=%2Fadmin");

  const { data: status } = await supabase.rpc("get_my_admin_status");
  const s = (status ?? {}) as { is_admin?: boolean; aal2?: boolean };
  if (!s.is_admin) redirect("/");
  if (!s.aal2) redirect("/admin/mfa");

  const nav = [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/intereses", label: "Intereses" },
    { href: "/admin/propiedades", label: "Propiedades" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/exportar", label: "Exportar CSV" },
  ];

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">
          Panel MiLocal <span className="badge-blue ml-1 align-middle">ADMIN · MFA</span>
        </h1>
        <nav className="flex flex-wrap gap-1 text-sm" aria-label="Secciones de administración">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="btn-ghost px-3 py-1.5">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
