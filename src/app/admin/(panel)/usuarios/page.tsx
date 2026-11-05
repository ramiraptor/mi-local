import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { LABELS, type AssessmentStatus, type OwnerType } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin · Usuarios",
  robots: { index: false, follow: false },
};

interface AdminProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  email_verified: boolean;
  entrepreneur_context_active: boolean;
  owner_context_active: boolean;
  marketing_opt_in: boolean;
  proactive_opportunities_opt_in: boolean;
  entrepreneur_assessment_status: AssessmentStatus | null;
  owner_assessment_status: AssessmentStatus | null;
  owner_type: OwnerType | null;
  rubro: string | null;
  created_at: string;
}

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; contexto?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (sp.contexto === "emprendedor") query = query.eq("entrepreneur_context_active", true);
  if (sp.contexto === "propietario") query = query.eq("owner_context_active", true);
  if (sp.q) query = query.or(`full_name.ilike.%${sp.q}%,email.ilike.%${sp.q}%`);

  const { data } = await query;
  const users = (data ?? []) as AdminProfileRow[];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="section-title">Usuarios ({users.length})</h2>
        <form className="flex gap-2" action="/admin/usuarios" method="get">
          <input name="q" className="input max-w-60" placeholder="Buscar nombre o correo…" defaultValue={sp.q ?? ""} />
          <select name="contexto" className="select max-w-44" defaultValue={sp.contexto ?? ""}>
            <option value="">Todos</option>
            <option value="emprendedor">Emprendedores</option>
            <option value="propietario">Propietarios</option>
          </select>
          <button type="submit" className="btn-secondary px-3 py-1.5 text-sm">
            Filtrar
          </button>
        </form>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Nombre</th>
              <th className="p-3">Contacto</th>
              <th className="p-3">Correo verif.</th>
              <th className="p-3">Contextos</th>
              <th className="p-3">Assessment E / P</th>
              <th className="p-3">Preferencias</th>
              <th className="p-3">Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 align-top">
                <td className="p-3 font-medium">{u.full_name ?? "—"}</td>
                <td className="p-3 text-slate-600">
                  {u.email}
                  <br />
                  {u.phone ?? "—"}
                </td>
                <td className="p-3">{u.email_verified ? "✓" : "✗"}</td>
                <td className="p-3">
                  {u.entrepreneur_context_active && <span className="badge-blue mr-1">Emprendedor</span>}
                  {u.owner_context_active && <span className="badge-green">Propietario</span>}
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {u.entrepreneur_assessment_status ?? "—"} / {u.owner_assessment_status ?? "—"}
                  {u.rubro && <div className="text-slate-400">{u.rubro}</div>}
                  {u.owner_type && <div className="text-slate-400">{LABELS.ownerType[u.owner_type]}</div>}
                </td>
                <td className="p-3 text-xs">
                  {u.proactive_opportunities_opt_in && <div>Proactivo ✓</div>}
                  {u.marketing_opt_in && <div>Marketing ✓</div>}
                </td>
                <td className="p-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-slate-500">Sin resultados.</p>}
      </div>
    </div>
  );
}
