import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LABELS, type CommercialStatus, type QualificationStatus } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin · Resumen",
  robots: { index: false, follow: false },
};

interface Metrics {
  goals?: { goal_entrepreneurs?: number; goal_owners?: number };
  entrepreneurs_total?: number;
  entrepreneurs_completed?: number;
  owners_total?: number;
  owners_completed?: number;
  properties_by_status?: Record<string, number>;
  interests_total?: number;
  interests_by_status?: Partial<Record<CommercialStatus, number>>;
  interests_by_qualification?: Partial<Record<QualificationStatus, number>>;
  funnel?: Record<string, number>;
  pending_review_notifications?: number;
  stale_availability_published?: number;
}

function Stat({ label, value, goal }: { label: string; value: number; goal?: number }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {new Intl.NumberFormat("es-CL").format(value)}
        {goal !== undefined && (
          <span className="ml-1 text-sm font-normal text-slate-400">/ meta {goal}</span>
        )}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.rpc("admin_dashboard_metrics");
  const m = (data ?? {}) as Metrics;
  const props = m.properties_by_status ?? {};
  const funnel = m.funnel ?? {};

  return (
    <div className="space-y-8">
      {(m.pending_review_notifications ?? 0) > 0 && (
        <Link
          href="/admin/propiedades"
          className="block rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          🔔 {m.pending_review_notifications} notificación(es) interna(s) pendiente(s) de revisión
          posterior →
        </Link>
      )}

      <section>
        <h2 className="section-title mb-3">Captación (metas configurables)</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Emprendedores"
            value={m.entrepreneurs_total ?? 0}
            goal={m.goals?.goal_entrepreneurs}
          />
          <Stat label="Assessments emprendedor completos" value={m.entrepreneurs_completed ?? 0} />
          <Stat label="Propietarios" value={m.owners_total ?? 0} goal={m.goals?.goal_owners} />
          <Stat label="Assessments propietario completos" value={m.owners_completed ?? 0} />
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">Inventario</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Publicadas" value={props.PUBLISHED ?? 0} />
          <Stat label="Borradores" value={props.DRAFT ?? 0} />
          <Stat label="Pausadas" value={props.UNPUBLISHED ?? 0} />
          <Stat label="Vigencia por confirmar (>30d)" value={m.stale_availability_published ?? 0} />
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">Embudo comercial</h2>
        <p className="mb-3 text-xs text-slate-500">
          Definiciones versionadas en docs/decisiones/kpi-definitions.md. Vista de ficha ≠ interés;
          intención VISIT ≠ visita coordinada; WON solo con mediación MiLocal confirmada.
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Vistas de ficha" value={funnel.property_views ?? 0} />
          <Stat label="Clics «Me interesa»" value={funnel.interest_cta_clicks ?? 0} />
          <Stat label="Solicitudes válidas" value={funnel.interests_valid ?? 0} />
          <Stat label="Contactados" value={funnel.contacted ?? 0} />
          <Stat label="Visitas coordinadas" value={funnel.visits_scheduled ?? 0} />
          <Stat label="Visitas realizadas" value={funnel.visits_completed ?? 0} />
          <Stat label="Cierres WON" value={funnel.won ?? 0} />
          <Stat label="Intereses totales" value={m.interests_total ?? 0} />
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">Pipeline por estado</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="p-3">Estado comercial</th>
                <th className="p-3">Oportunidades</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(LABELS.commercialStatus) as CommercialStatus[]).map((st) => (
                <tr key={st} className="border-b border-slate-100">
                  <td className="p-3">{LABELS.commercialStatus[st]}</td>
                  <td className="p-3 font-semibold">{m.interests_by_status?.[st] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
