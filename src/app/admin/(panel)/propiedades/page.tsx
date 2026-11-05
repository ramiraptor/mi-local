import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { daysSince, formatCLP, formatDate } from "@/lib/format";
import { LABELS, type PropertyStatus, type PropertyType } from "@/lib/constants";
import { ModerationActions, NotificationReviewButton } from "./ModerationActions";

export const metadata: Metadata = {
  title: "Admin · Propiedades",
  robots: { index: false, follow: false },
};

interface AdminPropertyRow {
  id: string;
  title: string | null;
  status: PropertyStatus;
  property_type: PropertyType | null;
  commune_name: string | null;
  monthly_rent_clp: number | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  moderation_locked: boolean;
  moderation_reason: string | null;
  availability_last_confirmed_at: string | null;
  published_at: string | null;
  admin_reviewed_at: string | null;
  interest_count: number;
  photo_count: number;
  created_at: string;
}

interface NotificationRow {
  id: string;
  type: string;
  property_id: string | null;
  property_title: string | null;
  created_at: string;
}

export default async function AdminPropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("admin_properties")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (sp.estado && ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"].includes(sp.estado)) {
    query = query.eq("status", sp.estado);
  }

  const [{ data: props }, { data: notifications }] = await Promise.all([
    query,
    supabase
      .from("admin_notifications_view")
      .select("*")
      .is("reviewed_at", null)
      .eq("type", "NEW_PUBLICATION")
      .order("created_at", { ascending: true }),
  ]);
  const properties = (props ?? []) as AdminPropertyRow[];
  const pending = (notifications ?? []) as NotificationRow[];

  return (
    <div className="space-y-8">
      {/* Revisión posterior no bloqueante */}
      <section>
        <h2 className="section-title mb-3">
          Publicaciones nuevas por revisar ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">Sin pendientes. 🎉</p>
        ) : (
          <ul className="card divide-y divide-slate-100">
            {pending.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium">{n.property_title ?? "Propiedad"}</p>
                  <p className="text-xs text-slate-500">Publicada el {formatDate(n.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {n.property_id && (
                    <Link href={`/propiedad/${n.property_id}`} target="_blank" className="btn-ghost px-3 py-1.5 text-xs">
                      Ver ficha pública
                    </Link>
                  )}
                  <NotificationReviewButton notificationId={n.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="section-title">Inventario ({properties.length})</h2>
          <form action="/admin/propiedades" method="get">
            <select
              name="estado"
              className="select max-w-44"
              defaultValue={sp.estado ?? ""}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="PUBLISHED">Publicadas</option>
              <option value="DRAFT">Borradores</option>
              <option value="UNPUBLISHED">Pausadas/retiradas</option>
              <option value="ARCHIVED">Archivadas</option>
            </select>
            <button type="submit" className="btn-secondary ml-2 px-3 py-1.5 text-sm">
              Filtrar
            </button>
          </form>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="p-3">Propiedad</th>
                <th className="p-3">Oferente (interno)</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Vigencia</th>
                <th className="p-3">Intereses</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const stale = daysSince(p.availability_last_confirmed_at);
                return (
                  <tr key={p.id} className="border-b border-slate-100 align-top">
                    <td className="p-3">
                      <p className="font-medium">{p.title ?? "Sin título"}</p>
                      <p className="text-xs text-slate-500">
                        {p.property_type ? LABELS.propertyType[p.property_type] : "—"} ·{" "}
                        {p.commune_name ?? "—"} · {formatCLP(p.monthly_rent_clp)} · {p.photo_count}{" "}
                        foto(s)
                      </p>
                      {p.moderation_locked && (
                        <p className="mt-1 text-xs text-red-600">
                          Retirada por ADMIN: {p.moderation_reason}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {p.owner_name ?? "—"}
                      <br />
                      {p.owner_email}
                      <br />
                      {p.owner_phone}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          p.status === "PUBLISHED"
                            ? "badge-green"
                            : p.status === "UNPUBLISHED"
                              ? "badge-amber"
                              : "badge-gray"
                        }
                      >
                        {LABELS.propertyStatus[p.status]}
                      </span>
                      {p.admin_reviewed_at === null && p.status === "PUBLISHED" && (
                        <div className="mt-1 text-[11px] text-amber-700">Revisión pendiente</div>
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      {p.status === "PUBLISHED" ? (
                        stale === null ? (
                          <span className="text-slate-400">Sin confirmación</span>
                        ) : stale >= 30 ? (
                          <span className="font-medium text-amber-700">hace {stale} días ⚠️</span>
                        ) : (
                          <span className="text-slate-600">hace {stale} días</span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-center font-semibold">{p.interest_count}</td>
                    <td className="p-3">
                      <ModerationActions
                        propertyId={p.id}
                        status={p.status}
                        moderationLocked={p.moderation_locked}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {properties.length === 0 && (
            <p className="p-6 text-center text-slate-500">Sin propiedades.</p>
          )}
        </div>
      </section>
    </div>
  );
}
