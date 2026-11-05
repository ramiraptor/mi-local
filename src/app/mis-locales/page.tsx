import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LABELS } from "@/lib/constants";
import { daysSince, formatCLP, formatDate } from "@/lib/format";
import type { PropertyRow } from "@/lib/types";
import { PropertyActions } from "./PropertyActions";

export const metadata: Metadata = {
  title: "Mis locales",
  robots: { index: false, follow: false },
};

function StatusBadge({ p }: { p: PropertyRow }) {
  if (p.moderation_locked) return <span className="badge-red">Retirada por MiLocal</span>;
  switch (p.status) {
    case "PUBLISHED":
      return <span className="badge-green">Publicada</span>;
    case "DRAFT":
      return <span className="badge-gray">Borrador incompleto</span>;
    case "UNPUBLISHED":
      return <span className="badge-amber">Pausada</span>;
    case "ARCHIVED":
      return <span className="badge-gray">Archivada</span>;
  }
}

export default async function MisLocalesPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?return_to=%2Fmis-locales");

  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  const properties = (data ?? []) as PropertyRow[];
  const emailVerified = Boolean(user.email_confirmed_at);

  return (
    <div className="container-page max-w-4xl py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Mis locales</h1>
        <Link href="/evaluacion/propietario" className="btn-primary">
          + Agregar inmueble
        </Link>
      </div>

      {!emailVerified && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Tu correo aún no está verificado: puedes editar borradores, pero no publicar. Revisa tu
          bandeja de entrada o reenvía el correo desde{" "}
          <Link href="/perfil" className="font-semibold underline">
            tu perfil
          </Link>
          .
        </div>
      )}

      {properties.length === 0 ? (
        <div className="card mt-6 p-8 text-center text-slate-600">
          <p className="font-medium">Aún no registras inmuebles.</p>
          <p className="mt-2 text-sm">
            Completa la evaluación guiada y publica gratis en minutos.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {properties.map((p) => {
            const staleDays = daysSince(p.availability_last_confirmed_at);
            return (
              <li key={p.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge p={p} />
                      <span className="text-xs text-slate-500">
                        {p.property_type ? LABELS.propertyType[p.property_type] : "Sin tipo"}
                      </span>
                    </div>
                    <Link
                      href={`/mis-locales/${p.id}`}
                      className="mt-1 block font-semibold text-slate-900 hover:text-brand-700"
                    >
                      {p.title ?? "Inmueble sin título"}
                    </Link>
                    <p className="text-sm text-slate-600">
                      {formatCLP(p.monthly_rent_clp)}/mes · creado el {formatDate(p.created_at)}
                    </p>
                    {p.moderation_locked && p.moderation_reason && (
                      <p className="mt-1 text-sm text-red-700">
                        Motivo del retiro: {p.moderation_reason}. Contacta a MiLocal para
                        revisarlo; no es posible republicar por tu cuenta.
                      </p>
                    )}
                    {p.status === "PUBLISHED" && staleDays !== null && staleDays >= 30 && (
                      <p className="mt-1 text-sm text-amber-700">
                        Han pasado {staleDays} días desde tu última confirmación de disponibilidad.
                      </p>
                    )}
                  </div>
                  <PropertyActions property={p} emailVerified={emailVerified} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
