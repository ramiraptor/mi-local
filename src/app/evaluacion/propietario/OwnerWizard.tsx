"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { ownerDraft } from "@/lib/draft";
import { track } from "@/lib/analytics";
import { EMPTY_OWNER_DRAFT, type OwnerDraftData } from "@/lib/draft-types";
import {
  CONTACT_PREFERENCE,
  LABELS,
  OWNER_TYPE,
  PROPERTY_CONDITION,
  PROPERTY_TYPE,
  SHARED_ATTRIBUTES,
  TRI_STATE_OFFER,
  type TriStateOffer,
} from "@/lib/constants";
import { ClpInput, RadioPills, StepProgress, useCatalogs } from "@/components/forms";

const STEP_TITLES = [
  "Sobre ti",
  "El inmueble",
  "Ubicación",
  "Condiciones comerciales",
  "Disponibilidad",
  "Atributos",
];

const OFFER_KEYS = [
  "has_gas_extraction",
  "has_three_phase_power",
  "has_accessibility",
  null, // parking_spaces es numérico
  "has_storage",
  "has_terrace_or_patio",
  "has_food_service_fitout",
] as const;

/** Mapea el borrador a columnas de properties. */
function draftToPropertyRow(d: OwnerDraftData) {
  return {
    owner_relationship: d.owner_relationship || d.owner_type || null,
    title: d.title || null,
    description: d.description || null,
    property_type: d.property_type || null,
    region_id: d.region_id || null,
    commune_id: d.commune_id || null,
    sector: d.sector || null,
    address_full: d.address_full || null,
    monthly_rent_clp: d.monthly_rent_clp,
    rent_is_negotiable: d.rent_is_negotiable,
    common_expenses_clp: d.common_expenses_clp,
    guarantee_clp: d.guarantee_clp,
    surface_m2: d.surface_m2,
    bathrooms: d.bathrooms,
    condition: d.condition || null,
    available_from: d.available_from || null,
    usage_restrictions: d.usage_restrictions || null,
    has_gas_extraction: d.has_gas_extraction,
    has_three_phase_power: d.has_three_phase_power,
    has_accessibility: d.has_accessibility,
    parking_spaces: d.parking_spaces,
    has_storage: d.has_storage,
    has_terrace_or_patio: d.has_terrace_or_patio,
    has_food_service_fitout: d.has_food_service_fitout,
  };
}

export function OwnerWizard() {
  const router = useRouter();
  const { regions, communes } = useCatalogs();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OwnerDraftData>(EMPTY_OWNER_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [finishedAnon, setFinishedAnon] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const trackedStart = useRef(false);

  useEffect(() => {
    const draft = ownerDraft.load<OwnerDraftData>();
    if (draft) setData({ ...EMPTY_OWNER_DRAFT, ...draft });
    const supabase = createSupabaseBrowser();
    void supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
    if (!trackedStart.current) {
      trackedStart.current = true;
      track("assessment_owner_started");
    }
  }, []);

  function update(patch: Partial<OwnerDraftData>) {
    setData((prev) => {
      const next = { ...prev, ...patch };
      ownerDraft.save(next);
      return next;
    });
  }

  const regionCommunes = useMemo(
    () => communes.filter((c) => c.region_id === data.region_id),
    [communes, data.region_id],
  );

  function validateStep(s: number): string | null {
    switch (s) {
      case 1:
        if (!data.owner_type) return "Indica tu relación general con los inmuebles.";
        if (!data.owner_relationship) return "Indica tu relación con ESTE inmueble.";
        if (!data.contact_preference) return "¿Cómo prefieres que te contactemos?";
        return null;
      case 2:
        if (!data.property_type) return "Selecciona el tipo de inmueble.";
        if (!data.title.trim()) return "Escribe un título para la publicación.";
        if (!data.surface_m2 || data.surface_m2 <= 0) return "Indica la superficie en m².";
        return null;
      case 3:
        if (!data.region_id) return "Selecciona la región.";
        if (!data.commune_id) return "Selecciona la comuna.";
        if (!data.address_full.trim())
          return "Ingresa la dirección exacta (es privada: nunca se publica).";
        return null;
      case 4:
        if (!data.monthly_rent_clp || data.monthly_rent_clp <= 0)
          return "Indica la renta mensual en CLP.";
        return null;
      default:
        return null;
    }
  }

  /** Crea/actualiza el property DRAFT para usuarios autenticados (ID estable). */
  async function persistDraftRow(current: OwnerDraftData): Promise<string | null> {
    if (!userId) return null;
    const supabase = createSupabaseBrowser();
    if (!propertyId) {
      const { data: inserted } = await supabase
        .from("properties")
        .insert({ owner_user_id: userId, status: "DRAFT", ...draftToPropertyRow(current) })
        .select("id")
        .single();
      const id = (inserted?.id as string) ?? null;
      setPropertyId(id);
      return id;
    }
    await supabase.from("properties").update(draftToPropertyRow(current)).eq("id", propertyId);
    return propertyId;
  }

  async function next() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await persistDraftRow(data);
      setStep((s) => Math.min(s + 1, 6));
      window.scrollTo({ top: 0 });
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    for (const s of [1, 2, 3, 4]) {
      const err = validateStep(s);
      if (err) {
        setError(err);
        setStep(s);
        return;
      }
    }
    setError(null);
    const completed = { ...data, completed: true };
    ownerDraft.save(completed);
    setData(completed);
    track("assessment_owner_completed");

    if (!userId) {
      setFinishedAnon(true);
      window.scrollTo({ top: 0 });
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowser();
      const id = await persistDraftRow(completed);
      await supabase.from("owner_profiles").upsert(
        {
          user_id: userId,
          assessment_status: "COMPLETED",
          owner_type: completed.owner_type || null,
          contact_preference: completed.contact_preference || null,
        },
        { onConflict: "user_id" },
      );
      await supabase.from("profiles").update({ owner_context_active: true }).eq("id", userId);
      ownerDraft.clear();
      router.push(id ? `/mis-locales/${id}` : "/mis-locales");
    } finally {
      setSaving(false);
    }
  }

  if (finishedAnon) {
    return (
      <div className="card mt-6 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">¡Tu inmueble está casi listo!</h2>
        <p className="mt-2 text-sm text-slate-600">
          Guardamos un borrador en este navegador por 7 días. Crea tu cuenta para continuar: subir
          fotografías y publicar gratis (necesitarás verificar tu correo).
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/registro?contexto=propietario&return_to=%2Fmis-locales"
            className="btn-primary"
          >
            Crear cuenta y continuar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-6 p-6">
      <StepProgress step={step} total={6} titles={STEP_TITLES} />

      {step === 1 && (
        <div className="space-y-4">
          <RadioPills
            legend="¿Cuál es tu rol?"
            options={OWNER_TYPE.map((v) => ({ value: v, label: LABELS.ownerType[v] }))}
            value={data.owner_type}
            onChange={(v) => update({ owner_type: v, owner_relationship: data.owner_relationship || v })}
          />
          <RadioPills
            legend="¿Y tu relación con ESTE inmueble?"
            help="Una misma cuenta puede administrar varios inmuebles con relaciones distintas."
            options={OWNER_TYPE.map((v) => ({ value: v, label: LABELS.ownerType[v] }))}
            value={data.owner_relationship}
            onChange={(v) => update({ owner_relationship: v })}
          />
          <RadioPills
            legend="¿Cómo prefieres que MiLocal te contacte?"
            options={CONTACT_PREFERENCE.map((v) => ({ value: v, label: LABELS.contactPreference[v] }))}
            value={data.contact_preference}
            onChange={(v) => update({ contact_preference: v })}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <RadioPills
            legend="Tipo de inmueble"
            options={PROPERTY_TYPE.map((v) => ({ value: v, label: LABELS.propertyType[v] }))}
            value={data.property_type}
            onChange={(v) => update({ property_type: v })}
          />
          <div>
            <label className="label" htmlFor="ptitle">
              Título de la publicación
            </label>
            <input
              id="ptitle"
              className="input"
              placeholder="Ej: Local a pasos del metro, ideal cafetería"
              value={data.title}
              maxLength={90}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="pdesc">
              Descripción (opcional)
            </label>
            <textarea
              id="pdesc"
              className="input"
              rows={3}
              placeholder="Describe el espacio sin incluir dirección exacta ni datos de contacto."
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="psup">
                Superficie (m²)
              </label>
              <input
                id="psup"
                inputMode="decimal"
                className="input"
                value={data.surface_m2 ?? ""}
                onChange={(e) => {
                  const v = e.target.value.replace(",", ".").replace(/[^\d.]/g, "");
                  update({ surface_m2: v ? Number(v) : null });
                }}
              />
            </div>
            <div>
              <label className="label" htmlFor="pbath">
                Baños
              </label>
              <input
                id="pbath"
                inputMode="numeric"
                className="input"
                value={data.bathrooms ?? ""}
                onChange={(e) =>
                  update({ bathrooms: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })
                }
              />
            </div>
          </div>
          <RadioPills
            legend="Condición física"
            options={PROPERTY_CONDITION.map((v) => ({ value: v, label: LABELS.condition[v] }))}
            value={data.condition}
            onChange={(v) => update({ condition: v })}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="pregion">
              Región
            </label>
            <select
              id="pregion"
              className="select"
              value={data.region_id}
              onChange={(e) => update({ region_id: e.target.value, commune_id: "" })}
            >
              <option value="">Selecciona una región…</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pcomuna">
              Comuna
            </label>
            <select
              id="pcomuna"
              className="select"
              value={data.commune_id}
              onChange={(e) => update({ commune_id: e.target.value })}
              disabled={!data.region_id}
            >
              <option value="">Selecciona una comuna…</option>
              {regionCommunes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="psector">
              Sector o barrio referencial (opcional, este sí es público)
            </label>
            <input
              id="psector"
              className="input"
              placeholder="Ej: Barrio Italia"
              value={data.sector}
              onChange={(e) => update({ sector: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="paddr">
              Dirección exacta (privada)
            </label>
            <p className="mb-1 text-xs text-slate-500">
              🔒 Nunca se muestra públicamente. En el mapa solo aparece una ubicación aproximada.
            </p>
            <input
              id="paddr"
              className="input"
              placeholder="Calle, número, comuna"
              value={data.address_full}
              onChange={(e) => update({ address_full: e.target.value })}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <ClpInput
            id="prent"
            label="Renta mensual (CLP)"
            value={data.monthly_rent_clp}
            onChange={(v) => update({ monthly_rent_clp: v })}
            required
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.rent_is_negotiable}
              onChange={(e) => update({ rent_is_negotiable: e.target.checked })}
            />
            La renta es negociable
          </label>
          <ClpInput
            id="pgc"
            label="Gastos comunes (CLP, opcional)"
            help="Se muestran aparte de la renta."
            value={data.common_expenses_clp}
            onChange={(v) => update({ common_expenses_clp: v })}
          />
          <ClpInput
            id="pgar"
            label="Garantía (CLP, opcional)"
            value={data.guarantee_clp}
            onChange={(v) => update({ guarantee_clp: v })}
          />
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="pavail">
              ¿Desde cuándo está disponible? (opcional)
            </label>
            <input
              id="pavail"
              type="date"
              className="input"
              value={data.available_from}
              onChange={(e) => update({ available_from: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="prestr">
              Restricciones de uso declaradas (opcional)
            </label>
            <p className="mb-1 text-xs text-slate-500">
              Ej: no apto para gastronomía, sin venta de alcohol. Es una declaración, no una
              certificación legal.
            </p>
            <textarea
              id="prestr"
              className="input"
              rows={2}
              value={data.usage_restrictions}
              onChange={(e) => update({ usage_restrictions: e.target.value })}
            />
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Declara los atributos del inmueble. «No sé» es válido y <strong>no</strong> significa
            «No».
          </p>
          {SHARED_ATTRIBUTES.map((attr, i) => {
            const key = OFFER_KEYS[i] ?? null;
            if (key === null) {
              return (
                <div key="parking">
                  <label className="label" htmlFor="ppark">
                    Estacionamientos (cantidad; deja vacío si no sabes)
                  </label>
                  <input
                    id="ppark"
                    inputMode="numeric"
                    className="input max-w-40"
                    value={data.parking_spaces ?? ""}
                    onChange={(e) =>
                      update({
                        parking_spaces: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null,
                      })
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
                value={data[key] as TriStateOffer}
                onChange={(v) => update({ [key]: v } as Partial<OwnerDraftData>)}
              />
            );
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setError(null);
            setStep((s) => Math.max(1, s - 1));
          }}
          disabled={step === 1}
        >
          ← Volver
        </button>
        {step < 6 ? (
          <button type="button" className="btn-primary" onClick={next} disabled={saving}>
            {saving ? "Guardando…" : "Continuar →"}
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={finish} disabled={saving}>
            {saving ? "Guardando…" : userId ? "Guardar y continuar a fotos" : "Finalizar"}
          </button>
        )}
      </div>
    </div>
  );
}
