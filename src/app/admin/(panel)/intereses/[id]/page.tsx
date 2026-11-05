import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatCLP, formatDateTime } from "@/lib/format";
import { LABELS } from "@/lib/constants";
import type { AdminInterest } from "@/lib/types";
import { InterestManager } from "./InterestManager";

export const metadata: Metadata = {
  title: "Admin · Detalle de interés",
  robots: { index: false, follow: false },
};

interface NoteRow {
  id: string;
  note: string;
  author_name: string | null;
  created_at: string;
}

interface HistoryRow {
  id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  actor_name: string | null;
  created_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  commercial_status: "Estado comercial",
  qualification_status: "Precalificación",
  assigned_admin_user_id: "Responsable",
  intent_attempt: "Insistencia",
};

export default async function AdminInterestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const [{ data: interest }, { data: notes }, { data: history }, { data: admins }] =
    await Promise.all([
      supabase.from("admin_interests").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("admin_interest_notes")
        .select("*")
        .eq("interest_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("admin_interest_history")
        .select("*")
        .eq("interest_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("admin_admins").select("user_id, full_name, email"),
    ]);

  if (!interest) notFound();
  const i = interest as AdminInterest;

  return (
    <div className="space-y-6">
      <Link href="/admin/intereses" className="text-sm text-brand-700 hover:underline">
        ← Volver a la bandeja
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Datos de la oportunidad */}
          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{i.user_name ?? "—"}</h1>
                <p className="text-sm text-slate-600">
                  {i.user_phone ?? "—"} · {i.user_email ?? "—"}
                </p>
              </div>
              <span className="badge-blue">{LABELS.intent[i.intent]}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Propiedad</dt>
                <dd className="font-medium">
                  {i.property_id ? (
                    <Link
                      href={`/propiedad/${i.property_id}`}
                      target="_blank"
                      className="text-brand-700 hover:underline"
                    >
                      {i.property_title ?? "Ver ficha"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Comuna</dt>
                <dd className="font-medium">{i.commune_name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Estado ficha</dt>
                <dd className="font-medium">{LABELS.propertyStatus[i.property_status]}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Renta al primer interés (snapshot)</dt>
                <dd className="font-medium">{formatCLP(i.rent_snapshot_clp)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Renta vigente</dt>
                <dd className="font-medium">{formatCLP(i.current_rent_clp)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Insistencias</dt>
                <dd className="font-medium">
                  {i.interest_attempt_count} (última: {formatDateTime(i.last_attempt_at)})
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Primer interés</dt>
                <dd className="font-medium">{formatDateTime(i.created_at)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Origen</dt>
                <dd className="font-medium">{i.source ?? "—"}</dd>
              </div>
              {i.lost_reason && (
                <div>
                  <dt className="text-slate-500">Motivo LOST</dt>
                  <dd className="font-medium text-red-700">{i.lost_reason}</dd>
                </div>
              )}
              {i.won_evidence && (
                <div>
                  <dt className="text-slate-500">Evidencia WON</dt>
                  <dd className="font-medium text-emerald-700">{i.won_evidence}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Notas internas */}
          <section className="card p-6">
            <h2 className="section-title">Notas internas ({(notes ?? []).length})</h2>
            <p className="mt-1 text-xs text-slate-500">
              Solo información pertinente y mínima. Nada de documentos de identidad, antecedentes
              financieros ni datos bancarios (esos se gestionan por canal corporativo seguro, fuera
              de la plataforma).
            </p>
            <ul className="mt-3 space-y-3">
              {((notes ?? []) as NoteRow[]).map((n) => (
                <li key={n.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="whitespace-pre-line">{n.note}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {n.author_name ?? "ADMIN"} · {formatDateTime(n.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Historial append-only */}
          <section className="card p-6">
            <h2 className="section-title">Historial ({(history ?? []).length})</h2>
            <ul className="mt-3 space-y-2">
              {((history ?? []) as HistoryRow[]).map((h) => (
                <li key={h.id} className="border-l-2 border-brand-200 pl-3 text-sm">
                  <p>
                    <strong>{FIELD_LABELS[h.field] ?? h.field}:</strong>{" "}
                    {h.old_value ? `${h.old_value} → ` : ""}
                    {h.new_value ?? "—"}
                  </p>
                  {h.reason && <p className="text-xs text-slate-600">{h.reason}</p>}
                  <p className="text-xs text-slate-400">
                    {h.actor_name ?? "Sistema"} · {formatDateTime(h.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Gestión */}
        <InterestManager
          interestId={i.id}
          currentStatus={i.commercial_status}
          currentQualification={i.qualification_status}
          currentAssignee={i.assigned_admin_user_id}
          admins={(admins ?? []) as Array<{ user_id: string; full_name: string | null; email: string | null }>}
        />
      </div>
    </div>
  );
}
