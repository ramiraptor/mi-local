import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/signed-photos";
import type { PublicProperty } from "@/lib/types";
import { PROPERTY_TYPE, type PropertyType } from "@/lib/constants";
import { PropertyCard } from "@/components/PropertyCard";
import { PageViewTracker } from "@/components/PageViewTracker";
import { Filters } from "./Filters";
import { ViewToggle } from "./ViewToggle";

export const metadata: Metadata = {
  title: "Explorar locales comerciales",
  description:
    "Locales comerciales, oficinas y bodegas en arriendo en la Región Metropolitana y Viña del Mar. Filtra por comuna, tipo, renta y superficie.",
};

const PAGE_SIZE = 24;

interface SearchParams {
  region?: string;
  comunas?: string;
  tipo?: string;
  renta_min?: string;
  renta_max?: string;
  sup_min?: string;
  sup_max?: string;
  pagina?: string;
}

function parseIntOrNull(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();

  const communeSlugs = (sp.comunas ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const tipo = PROPERTY_TYPE.includes(sp.tipo as PropertyType) ? (sp.tipo as PropertyType) : null;
  const rentaMin = parseIntOrNull(sp.renta_min);
  const rentaMax = parseIntOrNull(sp.renta_max);
  const supMin = parseIntOrNull(sp.sup_min);
  const supMax = parseIntOrNull(sp.sup_max);
  const page = Math.max(1, Number(sp.pagina ?? "1") || 1);

  let query = supabase
    .from("public_properties")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (sp.region === "13" || sp.region === "05") query = query.eq("region_code", sp.region);
  if (communeSlugs.length > 0) query = query.in("commune_slug", communeSlugs);
  if (tipo) query = query.eq("property_type", tipo);
  if (rentaMin !== null) query = query.gte("monthly_rent_clp", rentaMin);
  if (rentaMax !== null) query = query.lte("monthly_rent_clp", rentaMax);
  if (supMin !== null) query = query.gte("surface_m2", supMin);
  if (supMax !== null) query = query.lte("surface_m2", supMax);

  const { data, count } = await query;
  const properties = (data ?? []) as PublicProperty[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Portadas firmadas
  const thumbs = new Map<string, string>();
  if (properties.length > 0) {
    const { data: photos } = await supabase
      .from("public_property_photos")
      .select("property_id, thumb_path, position")
      .in(
        "property_id",
        properties.map((p) => p.id),
      )
      .order("position", { ascending: true });
    const coverByProperty = new Map<string, string>();
    for (const ph of photos ?? []) {
      if (!coverByProperty.has(ph.property_id as string)) {
        coverByProperty.set(ph.property_id as string, ph.thumb_path as string);
      }
    }
    const signed = await signPhotoUrls([...coverByProperty.values()]);
    for (const [pid, path] of coverByProperty) {
      const url = signed.get(path);
      if (url) thumbs.set(pid, url);
    }
  }

  const pins = properties
    .filter((p) => p.lat_public !== null && p.lng_public !== null)
    .map((p) => ({
      id: p.id,
      lat: p.lat_public as number,
      lng: p.lng_public as number,
      title: p.title ?? "Local",
      rent: p.monthly_rent_clp,
    }));

  function pageHref(target: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v && k !== "pagina") params.set(k, v);
    }
    if (target > 1) params.set("pagina", String(target));
    const qs = params.toString();
    return `/explorar${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="container-page py-8">
      <PageViewTracker event="explore_view" props={{ results_count: String(total) }} />
      <h1 className="text-2xl font-bold text-slate-900">Explorar locales</h1>
      <p className="mt-1 text-sm text-slate-600">
        {total} publicación(es) disponible(s). Las ubicaciones del mapa son aproximadas.
      </p>

      <div className="mt-4">
        <Filters />
      </div>

      <ViewToggle pins={pins}>
        {properties.length === 0 ? (
          <div className="card mt-6 p-10 text-center text-slate-500">
            <p className="font-medium">No encontramos locales con esos filtros.</p>
            <p className="mt-1 text-sm">Prueba ampliando comunas, renta o superficie.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} thumbUrl={thumbs.get(p.id)} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-3 text-sm" aria-label="Paginación">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="btn-secondary px-3 py-1.5">
                    ← Anterior
                  </Link>
                )}
                <span className="text-slate-500">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={pageHref(page + 1)} className="btn-secondary px-3 py-1.5">
                    Siguiente →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </ViewToggle>
    </div>
  );
}
