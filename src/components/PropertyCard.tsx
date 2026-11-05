import Link from "next/link";
import type { PublicProperty } from "@/lib/types";
import { LABELS } from "@/lib/constants";
import { formatCLP, formatM2 } from "@/lib/format";

export function PropertyCard({
  property,
  thumbUrl,
}: {
  property: PublicProperty;
  thumbUrl?: string;
}) {
  return (
    <Link
      href={`/propiedad/${property.id}`}
      className="card group block overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={property.title ?? "Fotografía del local"}
            className="h-full w-full object-cover"
            loading="lazy"
            width={640}
            height={480}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin fotografía
          </div>
        )}
        <span className="badge-blue absolute left-2 top-2 bg-white/90">
          {LABELS.propertyType[property.property_type]}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <p className="truncate font-semibold text-slate-900 group-hover:text-brand-700">
          {property.title ?? "Local disponible"}
        </p>
        <p className="text-sm text-slate-500">
          {property.commune_name}
          {property.sector ? ` · ${property.sector}` : ""}
        </p>
        <p className="text-base font-bold text-brand-800">
          {formatCLP(property.monthly_rent_clp)}
          <span className="text-xs font-normal text-slate-500"> /mes</span>
          {property.rent_is_negotiable && (
            <span className="ml-2 text-xs font-medium text-emerald-700">Negociable</span>
          )}
        </p>
        <p className="text-sm text-slate-600">{formatM2(property.surface_m2)}</p>
      </div>
    </Link>
  );
}
