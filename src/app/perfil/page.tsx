import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LABELS } from "@/lib/constants";
import { formatCLP, formatDate } from "@/lib/format";
import type { ActiveSearch, EntrepreneurProfile, MyInterest, OwnerProfile, Profile } from "@/lib/types";
import { ProfileEditor } from "./ProfileEditor";
import { PreferencesEditor } from "./PreferencesEditor";
import { ResendVerification } from "./ResendVerification";

export const metadata: Metadata = {
  title: "Mi perfil",
  robots: { index: false, follow: false },
};

type Completeness = "Pendiente" | "Por completar" | "Completado";

function entrepreneurCompleteness(ep: EntrepreneurProfile | null, search: ActiveSearch | null): Completeness {
  if (!ep || ep.assessment_status === "NOT_STARTED") return "Pendiente";
  if (
    ep.assessment_status === "COMPLETED" &&
    search &&
    search.commune_ids.length > 0 &&
    search.max_monthly_rent_clp !== null &&
    search.property_type !== null
  )
    return "Completado";
  return "Por completar";
}

function ownerCompleteness(op: OwnerProfile | null): Completeness {
  if (!op || op.assessment_status === "NOT_STARTED") return "Pendiente";
  if (op.assessment_status === "COMPLETED" && op.owner_type && op.contact_preference)
    return "Completado";
  return "Por completar";
}

function CompletenessBadge({ value }: { value: Completeness }) {
  const cls =
    value === "Completado" ? "badge-green" : value === "Por completar" ? "badge-amber" : "badge-gray";
  return <span className={cls}>{value}</span>;
}

export default async function PerfilPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?return_to=%2Fperfil");

  const [{ data: profile }, { data: ep }, { data: op }, { data: search }, { data: interests }, { data: props }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("entrepreneur_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("owner_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("active_searches").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("my_interests").select("*").order("created_at", { ascending: false }),
      supabase.from("properties").select("id, status").eq("owner_user_id", user.id),
    ]);

  const p = profile as Profile | null;
  const emailVerified = Boolean(user.email_confirmed_at);
  const eComp = entrepreneurCompleteness(ep as EntrepreneurProfile | null, search as ActiveSearch | null);
  const oComp = ownerCompleteness(op as OwnerProfile | null);
  const myProps = (props ?? []) as Array<{ id: string; status: string }>;
  const myInterests = (interests ?? []) as MyInterest[];
  const s = search as ActiveSearch | null;

  return (
    <div className="container-page max-w-3xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>

      {/* Cuenta */}
      <section className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="section-title">Mi cuenta</h2>
          {emailVerified ? (
            <span className="badge-green">Correo verificado</span>
          ) : (
            <span className="badge-amber">Correo pendiente de verificación</span>
          )}
        </div>
        {!emailVerified && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Para publicar un local o enviar solicitudes necesitas verificar tu correo.{" "}
            <ResendVerification email={user.email ?? ""} />
          </div>
        )}
        <ProfileEditor
          initialName={p?.full_name ?? ""}
          initialPhone={p?.phone ?? ""}
          email={user.email ?? ""}
        />
      </section>

      {/* Contexto Emprendedor */}
      <section className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="section-title">Mi búsqueda (Emprendedor)</h2>
          <CompletenessBadge value={eComp} />
        </div>
        {s ? (
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            <p>
              <strong>Tipo:</strong> {s.property_type ? LABELS.propertyType[s.property_type] : "—"} ·{" "}
              <strong>Presupuesto:</strong> {formatCLP(s.max_monthly_rent_clp)}
              {s.budget_flexibility ? ` (${LABELS.budgetFlexibility[s.budget_flexibility]})` : ""}
            </p>
            <p>
              <strong>Horizonte:</strong> {s.horizon ? LABELS.horizon[s.horizon] : "—"}
            </p>
            <p className="text-xs text-slate-500">
              Mantienes UNA búsqueda activa editable; al editarla se actualiza, no se duplica.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Aún no estructuras tu búsqueda. Te toma ~3 minutos.
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <Link href="/evaluacion/emprendedor" className="btn-secondary">
            {s ? "Editar mi búsqueda" : "Comenzar evaluación"}
          </Link>
          <Link href="/explorar" className="btn-ghost">
            Explorar locales
          </Link>
        </div>
      </section>

      {/* Contexto Propietario */}
      <section className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="section-title">Mis locales (Propietario)</h2>
          <CompletenessBadge value={oComp} />
        </div>
        <p className="mt-3 text-sm text-slate-700">
          {myProps.length === 0
            ? "Aún no registras inmuebles."
            : `${myProps.length} inmueble(s): ${myProps.filter((x) => x.status === "PUBLISHED").length} publicado(s), ${myProps.filter((x) => x.status === "DRAFT").length} en borrador.`}
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/mis-locales" className="btn-secondary">
            Ir a Mis locales
          </Link>
          <Link href="/evaluacion/propietario" className="btn-ghost">
            Agregar otro inmueble
          </Link>
        </div>
      </section>

      {/* Mis solicitudes */}
      <section className="card p-6">
        <h2 className="section-title">Mis solicitudes</h2>
        {myInterests.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Cuando envíes una solicitud de contacto o visita aparecerá aquí.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {myInterests.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <Link
                    href={`/propiedad/${i.property_id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {i.property_title ?? "Propiedad"}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {LABELS.intent[i.intent]} · enviada el {formatDate(i.created_at)}
                    {i.interest_attempt_count > 1 ? ` · ${i.interest_attempt_count} envíos` : ""}
                  </p>
                </div>
                <span className="badge-blue">Recibida</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-500">
          «Solicitud recibida» no es una visita agendada: el equipo MiLocal te contactará para
          coordinar los pasos siguientes.
        </p>
      </section>

      {/* Preferencias de comunicación */}
      <section className="card p-6">
        <h2 className="section-title">Preferencias de comunicación</h2>
        <PreferencesEditor
          initialMarketing={p?.marketing_opt_in ?? false}
          initialProactive={p?.proactive_opportunities_opt_in ?? false}
        />
      </section>

      {/* Privacidad */}
      <section className="card p-6">
        <h2 className="section-title">Privacidad y eliminación</h2>
        <p className="mt-2 text-sm text-slate-600">
          Puedes solicitar la eliminación de tu cuenta y tus datos escribiendo a{" "}
          <a href="mailto:privacidad@milocal.cl" className="font-semibold text-brand-700 hover:underline">
            privacidad@milocal.cl
          </a>
          . Despublicar un inmueble no elimina tus datos: la supresión definitiva sigue un
          procedimiento verificado conforme a la{" "}
          <Link href="/privacidad" className="font-semibold text-brand-700 hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
