import { createSupabaseStatic } from "@/lib/supabase/static";
import { signPhotoUrls } from "@/lib/signed-photos";
import { PropertyCard } from "@/components/PropertyCard";
import { TrackedLink } from "@/components/TrackedLink";
import { PageViewTracker } from "@/components/PageViewTracker";
import type { PublicProperty } from "@/lib/types";
import Link from "next/link";

// ISR servida por CDN; 60s para que una moderación salga rápido de destacados
export const revalidate = 60;

async function getFeatured(): Promise<{ properties: PublicProperty[]; thumbs: Map<string, string> }> {
  const supabase = createSupabaseStatic();
  const { data: properties } = await supabase
    .from("public_properties")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(6);

  const list = (properties ?? []) as PublicProperty[];
  const thumbs = new Map<string, string>();
  if (list.length > 0) {
    const { data: photos } = await supabase
      .from("public_property_photos")
      .select("property_id, thumb_path, position")
      .in(
        "property_id",
        list.map((p) => p.id),
      )
      .order("position", { ascending: true });

    const coverByProperty = new Map<string, string>();
    for (const ph of photos ?? []) {
      if (!coverByProperty.has(ph.property_id as string)) {
        coverByProperty.set(ph.property_id as string, ph.thumb_path as string);
      }
    }
    const signed = await signPhotoUrls([...coverByProperty.values()]);
    for (const [propertyId, path] of coverByProperty) {
      const url = signed.get(path);
      if (url) thumbs.set(propertyId, url);
    }
  }
  return { properties: list, thumbs };
}

const steps = [
  {
    title: "Cuéntanos qué necesitas",
    body: "Responde una evaluación guiada sobre tu negocio o tu propiedad. Sin costo y sin compromiso.",
  },
  {
    title: "Publica o explora",
    body: "Los locales se publican gratis y quedan visibles de inmediato. Los emprendedores exploran con filtros y mapa.",
  },
  {
    title: "Nosotros intermediamos",
    body: "Cuando hay interés, el equipo MiLocal contacta a las partes y acompaña el proceso. Sin chats ni spam.",
  },
];

export default async function LandingPage() {
  const { properties, thumbs } = await getFeatured();

  return (
    <div>
      <PageViewTracker event="landing_view" />

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-900 to-brand-700 text-white">
        <div className="container-page py-16 text-center sm:py-24">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            El punto de encuentro entre tu negocio y su próximo local
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-100 sm:text-lg">
            Publicación gratuita de locales comerciales y búsqueda guiada para emprendedores,
            con acompañamiento humano de MiLocal en cada paso.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedLink
              href="/evaluacion/emprendedor"
              event="cta_busco_local_click"
              className="btn-accent w-full px-6 py-3 text-base sm:w-auto"
            >
              Busco un local
            </TrackedLink>
            <TrackedLink
              href="/evaluacion/propietario"
              event="cta_tengo_local_click"
              className="btn w-full border border-white/60 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20 sm:w-auto"
            >
              Tengo un local
            </TrackedLink>
          </div>
          <p className="mt-6 text-sm text-brand-200">
            Cobertura inicial: Región Metropolitana y Viña del Mar
          </p>
        </div>
      </section>

      {/* Fichas destacadas */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Locales disponibles</h2>
          <Link href="/explorar" className="text-sm font-semibold text-brand-700 hover:underline">
            Ver todos →
          </Link>
        </div>
        {properties.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            <p className="font-medium">Muy pronto verás locales publicados aquí.</p>
            <p className="mt-2 text-sm">
              ¿Tienes un local comercial?{" "}
              <Link href="/evaluacion/propietario" className="font-semibold text-brand-700 hover:underline">
                Publícalo gratis
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} thumbUrl={thumbs.get(p.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Cómo funciona */}
      <section className="bg-white py-12">
        <div className="container-page">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
            ¿Cómo funciona MiLocal?
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="card p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-500">
            MiLocal recibe tu solicitud de contacto o visita y la gestiona personalmente: tus datos
            nunca se entregan automáticamente a terceros.
          </p>
        </div>
      </section>
    </div>
  );
}
