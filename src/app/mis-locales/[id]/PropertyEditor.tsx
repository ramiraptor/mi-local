"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import {
  LABELS,
  MAX_PHOTOS,
  OWNER_TYPE,
  PROPERTY_CONDITION,
  PROPERTY_TYPE,
  SHARED_ATTRIBUTES,
  TRI_STATE_OFFER,
  type TriStateOffer,
} from "@/lib/constants";
import type { PropertyPhoto, PropertyRow } from "@/lib/types";
import { ClpInput, RadioPills, useCatalogs } from "@/components/forms";
import { PropertyActions } from "../PropertyActions";

type PhotoWithUrl = PropertyPhoto & { thumbUrl: string | null };

const OFFER_KEYS = [
  "has_gas_extraction",
  "has_three_phase_power",
  "has_accessibility",
  null,
  "has_storage",
  "has_terrace_or_patio",
  "has_food_service_fitout",
] as const;

export function PropertyEditor({
  property,
  photos: initialPhotos,
  emailVerified,
}: {
  property: PropertyRow;
  photos: PhotoWithUrl[];
  emailVerified: boolean;
}) {
  const router = useRouter();
  const { regions, communes } = useCatalogs();
  const [form, setForm] = useState({ ...property });
  const [photos, setPhotos] = useState<PhotoWithUrl[]>(initialPhotos);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createSupabaseBrowser();

  const regionCommunes = communes.filter((c) => c.region_id === form.region_id);

  function set<K extends keyof PropertyRow>(key: K, value: PropertyRow[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          title: form.title,
          description: form.description,
          property_type: form.property_type,
          owner_relationship: form.owner_relationship,
          region_id: form.region_id,
          commune_id: form.commune_id,
          sector: form.sector,
          address_full: form.address_full,
          monthly_rent_clp: form.monthly_rent_clp,
          rent_is_negotiable: form.rent_is_negotiable,
          common_expenses_clp: form.common_expenses_clp,
          guarantee_clp: form.guarantee_clp,
          surface_m2: form.surface_m2,
          bathrooms: form.bathrooms,
          condition: form.condition,
          available_from: form.available_from || null,
          usage_restrictions: form.usage_restrictions,
          has_gas_extraction: form.has_gas_extraction,
          has_three_phase_power: form.has_three_phase_power,
          has_accessibility: form.has_accessibility,
          parking_spaces: form.parking_spaces,
          has_storage: form.has_storage,
          has_terrace_or_patio: form.has_terrace_or_patio,
          has_food_service_fitout: form.has_food_service_fitout,
        })
        .eq("id", property.id);
      if (!error) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (photos.length >= MAX_PHOTOS) {
          setUploadError(`Máximo ${MAX_PHOTOS} fotografías.`);
          break;
        }
        const fd = new FormData();
        fd.set("file", file);
        fd.set("property_id", property.id);
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setUploadError(
            body.error === "FILE_TOO_LARGE"
              ? "El archivo supera los 8 MB."
              : body.error === "INVALID_IMAGE" || body.error === "UNSUPPORTED_FORMAT"
                ? "El archivo no es una imagen válida (usa JPG, PNG o WebP)."
                : body.error === "TOO_MANY_PHOTOS"
                  ? `Máximo ${MAX_PHOTOS} fotografías.`
                  : "No pudimos subir la imagen. Inténtalo nuevamente.",
          );
          continue;
        }
        const body = (await res.json()) as { photo: PropertyPhoto; thumbUrl: string | null };
        setPhotos((ps) => [...ps, { ...body.photo, thumbUrl: body.thumbUrl }]);
      }
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photoId: string) {
    if (!window.confirm("¿Eliminar esta fotografía?")) return;
    const res = await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_id: photoId }),
    });
    if (res.ok) setPhotos((ps) => ps.filter((p) => p.id !== photoId));
  }

  async function movePhoto(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const reordered = [...photos];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item!);
    setPhotos(reordered);
    await Promise.all(
      reordered.map((p, i) =>
        supabase.from("property_photos").update({ position: i }).eq("id", p.id),
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {form.title || "Inmueble sin título"}
          </h1>
          <p className="text-sm text-slate-500">
            Estado: {LABELS.propertyStatus[property.status]}
            {property.moderation_locked ? " · Retirada por MiLocal (no republicable)" : ""}
          </p>
        </div>
        <PropertyActions property={property} emailVerified={emailVerified} />
      </div>

      {property.moderation_locked && property.moderation_reason && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <strong>Publicación retirada por el equipo MiLocal.</strong> Motivo:{" "}
          {property.moderation_reason}. Para revisarla escribe a contacto@milocal.cl; no es posible
          republicar por tu cuenta.
        </div>
      )}

      {/* Fotos */}
      <section className="card p-6">
        <h2 className="section-title">Fotografías ({photos.length}/{MAX_PHOTOS})</h2>
        <p className="mt-1 text-xs text-slate-500">
          La primera es la portada. Procesamos cada imagen para eliminar metadatos de ubicación
          (EXIF/GPS). Recomendación: 6–8 fotos. Revisa que ninguna muestre información sensible.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((p, i) => (
            <figure key={p.id} className="relative overflow-hidden rounded-lg border border-slate-200">
              {p.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbUrl} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-xs text-slate-400">
                  Procesada
                </div>
              )}
              {i === 0 && (
                <span className="badge-blue absolute left-1 top-1 bg-white/90">Portada</span>
              )}
              <figcaption className="flex items-center justify-between gap-1 p-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded px-1.5 py-0.5 text-xs hover:bg-slate-100"
                    onClick={() => void movePhoto(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover antes"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="rounded px-1.5 py-0.5 text-xs hover:bg-slate-100"
                    onClick={() => void movePhoto(i, 1)}
                    disabled={i === photos.length - 1}
                    aria-label="Mover después"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => void removePhoto(p.id)}
                >
                  Eliminar
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
        {photos.length < MAX_PHOTOS && (
          <label className="btn-secondary mt-4 cursor-pointer">
            {uploading ? "Subiendo…" : "Subir fotografías"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => void uploadFiles(e.target.files)}
            />
          </label>
        )}
        {uploadError && <p className="field-error">{uploadError}</p>}
      </section>

      {/* Datos del inmueble */}
      <section className="card space-y-4 p-6">
        <h2 className="section-title">Ficha del inmueble</h2>
        <div>
          <label className="label" htmlFor="ed-title">
            Título
          </label>
          <input
            id="ed-title"
            className="input"
            maxLength={90}
            value={form.title ?? ""}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ed-desc">
            Descripción
          </label>
          <textarea
            id="ed-desc"
            className="input"
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <RadioPills
          legend="Tipo de inmueble"
          options={PROPERTY_TYPE.map((v) => ({ value: v, label: LABELS.propertyType[v] }))}
          value={form.property_type ?? ""}
          onChange={(v) => set("property_type", v)}
        />
        <RadioPills
          legend="Tu relación con este inmueble"
          options={OWNER_TYPE.map((v) => ({ value: v, label: LABELS.ownerType[v] }))}
          value={form.owner_relationship ?? ""}
          onChange={(v) => set("owner_relationship", v)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ed-region">
              Región
            </label>
            <select
              id="ed-region"
              className="select"
              value={form.region_id ?? ""}
              onChange={(e) => {
                set("region_id", e.target.value || null);
                set("commune_id", null);
              }}
            >
              <option value="">Selecciona…</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-comuna">
              Comuna
            </label>
            <select
              id="ed-comuna"
              className="select"
              value={form.commune_id ?? ""}
              onChange={(e) => set("commune_id", e.target.value || null)}
            >
              <option value="">Selecciona…</option>
              {regionCommunes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-sector">
              Sector (público)
            </label>
            <input
              id="ed-sector"
              className="input"
              value={form.sector ?? ""}
              onChange={(e) => set("sector", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="ed-addr">
              Dirección exacta 🔒 (privada, nunca se publica)
            </label>
            <input
              id="ed-addr"
              className="input"
              value={form.address_full ?? ""}
              onChange={(e) => set("address_full", e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ClpInput
            id="ed-rent"
            label="Renta mensual (CLP)"
            value={form.monthly_rent_clp}
            onChange={(v) => set("monthly_rent_clp", v)}
          />
          <ClpInput
            id="ed-gc"
            label="Gastos comunes (CLP)"
            value={form.common_expenses_clp}
            onChange={(v) => set("common_expenses_clp", v)}
          />
          <ClpInput
            id="ed-gar"
            label="Garantía (CLP)"
            value={form.guarantee_clp}
            onChange={(v) => set("guarantee_clp", v)}
          />
          <div>
            <label className="label" htmlFor="ed-sup">
              Superficie (m²)
            </label>
            <input
              id="ed-sup"
              inputMode="decimal"
              className="input"
              value={form.surface_m2 ?? ""}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".").replace(/[^\d.]/g, "");
                set("surface_m2", v ? Number(v) : null);
              }}
            />
          </div>
          <div>
            <label className="label" htmlFor="ed-bath">
              Baños
            </label>
            <input
              id="ed-bath"
              inputMode="numeric"
              className="input"
              value={form.bathrooms ?? ""}
              onChange={(e) =>
                set("bathrooms", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="ed-avail">
              Disponible desde
            </label>
            <input
              id="ed-avail"
              type="date"
              className="input"
              value={form.available_from ?? ""}
              onChange={(e) => set("available_from", e.target.value || null)}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.rent_is_negotiable}
            onChange={(e) => set("rent_is_negotiable", e.target.checked)}
          />
          La renta es negociable
        </label>
        <RadioPills
          legend="Condición física"
          options={PROPERTY_CONDITION.map((v) => ({ value: v, label: LABELS.condition[v] }))}
          value={form.condition ?? ""}
          onChange={(v) => set("condition", v)}
        />
        <div>
          <label className="label" htmlFor="ed-restr">
            Restricciones de uso declaradas
          </label>
          <textarea
            id="ed-restr"
            className="input"
            rows={2}
            value={form.usage_restrictions ?? ""}
            onChange={(e) => set("usage_restrictions", e.target.value)}
          />
        </div>

        <h3 className="pt-2 font-semibold text-slate-900">Atributos</h3>
        <p className="text-xs text-slate-500">«No sé» es válido y no significa «No».</p>
        {SHARED_ATTRIBUTES.map((attr, i) => {
          const key = OFFER_KEYS[i] ?? null;
          if (key === null) {
            return (
              <div key="ed-park">
                <label className="label" htmlFor="ed-park">
                  Estacionamientos (cantidad)
                </label>
                <input
                  id="ed-park"
                  inputMode="numeric"
                  className="input max-w-40"
                  value={form.parking_spaces ?? ""}
                  onChange={(e) =>
                    set(
                      "parking_spaces",
                      e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null,
                    )
                  }
                />
              </div>
            );
          }
          return (
            <RadioPills
              key={key}
              legend={attr.label}
              options={TRI_STATE_OFFER.map((v) => ({ value: v, label: LABELS.triOffer[v] }))}
              value={form[key] as TriStateOffer}
              onChange={(v) => set(key, v)}
            />
          );
        })}

        <div className="flex items-center gap-3 pt-2">
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar cambios"}
          </button>
          {property.status === "PUBLISHED" && (
            <span className="text-xs text-slate-500">
              Los cambios se reflejan de inmediato en la ficha pública.
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
