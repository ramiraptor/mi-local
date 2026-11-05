import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/signed-photos";
import type { PublicProperty } from "@/lib/types";
import { LABELS, SHARED_ATTRIBUTES, type TriStateOffer } from "@/lib/constants";
import { formatCLP, formatDate, formatM2 } from "@/lib/format";
import { PageViewTracker } from "@/components/PageViewTracker";
import { Gallery } from "./Gallery";
import { InterestCTA } from "./InterestCTA";
import { PropertyMiniMap } from "./PropertyMiniMap";

export const revalidate = 60;

async function getProperty(id: string): Promise<PublicProperty | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("public_properties").select("*").eq("id", id).maybeSingle();
  return (data as PublicProperty | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) {
    // Ficha inexistente o retirada: no indexar
    return { title: "Publicación no disponible", robots: { index: false, follow: false } };
  }
  // SOLO campos de la proyección pública (sin dirección ni datos del oferente)
  const title = property.title ?? "Local comercial disponible";
  const description = `${LABELS.propertyType[property.property_type]} en ${property.commune_name} · ${formatCLP(
    property.monthly_rent_clp,
  )}/mes · ${formatM2(property.surface_m2)}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

const OFFER_KEYS = [
  "has_gas_extraction",
  "has_three_phase_power",
  "has_accessibility",
  null,
  "has_storage",
  "has_terrace_or_patio",
  "has_food_service_fitout",
] as const;

function AttributeValue({ value }: { value: TriStateOffer }) {
  if (value === "SI") return <span className="font-semibold text-emerald-700">Sí</span>;
  if (value === "NO") return <span className="text-slate-500">No</span>;
  return <span className="text-slate-400">No informado</span>;
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const supabase = await createSupabaseServer();
  const { data: photoRows } = await supabase
    .from("public_property_photos")
    .select("*")
    .eq("property_id", id)
    .order("position", { ascending: true });

  const photos = photoRows ?? [];
  const signed = await signPhotoUrls([
    ...photos.map((p) => p.storage_path as string),
    ...photos.map((p) => p.thumb_path as string),
  ]);
  const gallery = photos
    .map((p) => ({
      id: p.id as string,
      url: signed.get(p.storage_path as string) ?? null,
      thumbUrl: signed.get(p.thumb_path as string) ?? null,
    }))
    .filter((p) => p.url !== null) as Array<{ id: string; url: string; thumbUrl: string | null }>;

  return (
    <div className="container-page max-w-5xl py-8">
      <PageViewTracker
        event="property_view"
        propertyId={property.id}
        props={{ property_type: property.property_type, commune_slug: property.commune_slug }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <Gallery photos={gallery} title={property.title ?? "Local"} />

          <div className="mt-6">
            <span className="badge-blue">{LABELS.propertyType[property.property_type]}</span>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {property.title ?? "Local disponible"}
            </h1>
            <p className="text-slate-600">
              {property.commune_name}, {property.region_name}
              {property.sector ? ` · Sector ${property.sector}` : ""}
            </p>
          </div>

          {property.description && (
            <p className="mt-4 whitespace-pre-line text-slate-700">{property.description}</p>
          )}

          <h2 className="section-title mt-8">Características</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Superficie</dt>
              <dd className="font-medium">{formatM2(property.surface_m2)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Baños</dt>
              <dd className="font-medium">{property.bathrooms ?? "No informado"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Condición</dt>
              <dd className="font-medium">
                {property.condition ? LABELS.condition[property.condition] : "No informada"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Disponible desde</dt>
              <dd className="font-medium">
                {property.available_from ? formatDate(property.available_from) : "A convenir"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Estacionamientos</dt>
              <dd className="font-medium">
                {property.parking_spaces === null ? "No informado" : property.parking_spaces}
              </dd>
            </div>
          </dl>

          <h2 className="section-title mt-8">Atributos técnicos declarados</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {SHARED_ATTRIBUTES.map((attr, i) => {
              const key = OFFER_KEYS[i] ?? null;
              return (
                <li key={attr.label} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                  <span>{attr.label}</span>
                  {key === null ? (
                    <span className="font-semibold">
                      {property.parking_spaces === null
                        ? "No informado"
                        : property.parking_spaces > 0
                          ? `${property.parking_spaces}`
                          : "No"}
                    </span>
                  ) : (
                    <AttributeValue value={property[key]} />
                  )}
                </li>
              );
            })}
          </ul>
          {property.usage_restrictions && (
            <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
              <strong>Restricciones declaradas por el oferente:</strong> {property.usage_restrictions}
            </p>
          )}

          {property.lat_public !== null && property.lng_public !== null && (
            <>
              <h2 className="section-title mt-8">Ubicación aproximada</h2>
              <p className="mb-2 mt-1 text-xs text-slate-500">
                📍 Por privacidad mostramos solo una zona referencial. La dirección exacta se
                coordina a través de MiLocal.
              </p>
              <PropertyMiniMap
                pin={{
                  id: property.id,
                  lat: property.lat_public,
                  lng: property.lng_public,
                  title: property.title ?? "Local",
                  rent: property.monthly_rent_clp,
                }}
              />
            </>
          )}
        </div>

        {/* Panel de acción */}
        <aside className="h-fit lg:sticky lg:top-20">
          <div className="card p-6">
            <p className="text-3xl font-bold text-brand-800">
              {formatCLP(property.monthly_rent_clp)}
              <span className="text-sm font-normal text-slate-500"> /mes</span>
            </p>
            {property.rent_is_negotiable && (
              <p className="text-sm font-medium text-emerald-700">Renta negociable</p>
            )}
            <dl className="mt-3 space-y-1 text-sm text-slate-600">
              {property.common_expenses_clp !== null && (
                <div className="flex justify-between">
                  <dt>Gastos comunes</dt>
                  <dd className="font-medium">{formatCLP(property.common_expenses_clp)}</dd>
                </div>
              )}
              {property.guarantee_clp !== null && (
                <div className="flex justify-between">
                  <dt>Garantía</dt>
                  <dd className="font-medium">{formatCLP(property.guarantee_clp)}</dd>
                </div>
              )}
            </dl>
            <InterestCTA propertyId={property.id} />
            <p className="mt-4 text-xs text-slate-500">
              MiLocal recibe tu solicitud y te contacta personalmente. Enviar una solicitud no es
              una visita agendada y tus datos no se entregan automáticamente al oferente.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
