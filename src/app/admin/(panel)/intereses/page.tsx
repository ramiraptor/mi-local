import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatCLP, formatDate } from "@/lib/format";
import {
  COMMERCIAL_STATUS,
  LABELS,
  QUALIFICATION_STATUS,
  type CommercialStatus,
  type QualificationStatus,
} from "@/lib/constants";
import type { AdminInterest } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin · Intereses",
  robots: { index: false, follow: false },
};

export default async function AdminInteresesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; precalificacion?: string; sin_asignar?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("admin_interests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (sp.estado && COMMERCIAL_STATUS.includes(sp.estado as CommercialStatus)) {
    query = query.eq("commercial_status", sp.estado);
  }
  if (
    sp.precalificacion &&
    QUALIFICATION_STATUS.includes(sp.precalificacion as QualificationStatus)
  ) {
    query = query.eq("qualification_status", sp.precalificacion);
  }
  if (sp.sin_asignar === "1") query = query.is("assigned_admin_user_id", null);

  const { data } = await query;
  const interests = (data ?? []) as AdminInterest[];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="section-title">Bandeja de intereses ({interests.length})</h2>
        <form className="flex flex-wrap gap-2" action="/admin/intereses" method="get">
          <select name="estado" className="select max-w-44" defaultValue={sp.estado ?? ""}>
            <option value="">Todos los estados</option>
            {COMMERCIAL_STATUS.map((s) => (
              <option key={s} value={s}>
                {LABELS.commercialStatus[s]}
              </option>
            ))}
          </select>
          <select
            name="precalificacion"
            className="select max-w-44"
            defaultValue={sp.precalificacion ?? ""}
          >
            <option value="">Toda precalificación</option>
            {QUALIFICATION_STATUS.map((s) => (
              <option key={s} value={s}>
                {LABELS.qualification[s]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-sm text-slate-600">
            <input type="checkbox" name="sin_asignar" value="1" defaultChecked={sp.sin_asignar === "1"} />
            Sin asignar
          </label>
          <button type="submit" className="btn-secondary px-3 py-1.5 text-sm">
            Filtrar
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Emprendedor</th>
              <th className="p-3">Propiedad</th>
              <th className="p-3">Intención</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Precalificación</th>
              <th className="p-3">Renta snapshot / vigente</th>
              <th className="p-3">Responsable</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {interests.map((i) => (
              <tr key={i.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/intereses/${i.id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {i.user_name ?? "—"}
                  </Link>
                  <p className="text-xs text-slate-500">{i.user_phone ?? i.user_email}</p>
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {i.property_title ?? "—"}
                  <br />
                  {i.commune_name ?? ""}
                </td>
                <td className="p-3">
                  <span className="badge-blue">{i.intent}</span>
                  {i.interest_attempt_count > 1 && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      {i.interest_attempt_count} envíos
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={
                      i.commercial_status === "WON"
                        ? "badge-green"
                        : i.commercial_status === "LOST"
                          ? "badge-red"
                          : i.commercial_status === "NEW"
                            ? "badge-amber"
                            : "badge-blue"
                    }
                  >
                    {LABELS.commercialStatus[i.commercial_status]}
                  </span>
                </td>
                <td className="p-3 text-xs">{LABELS.qualification[i.qualification_status]}</td>
                <td className="p-3 text-xs">
                  {formatCLP(i.rent_snapshot_clp)}
                  <br />
                  <span className="text-slate-400">{formatCLP(i.current_rent_clp)}</span>
                </td>
                <td className="p-3 text-xs">{i.assigned_admin_name ?? <em className="text-amber-700">Sin asignar</em>}</td>
                <td className="p-3 text-xs text-slate-500">{formatDate(i.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {interests.length === 0 && (
          <p className="p-6 text-center text-slate-500">No hay intereses con esos filtros.</p>
        )}
      </div>
    </div>
  );
}
