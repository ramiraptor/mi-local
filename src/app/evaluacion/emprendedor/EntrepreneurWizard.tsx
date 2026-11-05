"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { entrepreneurDraft } from "@/lib/draft";
import { track } from "@/lib/analytics";
import {
  EMPTY_ENTREPRENEUR_DRAFT,
  type EntrepreneurDraftData,
} from "@/lib/draft-types";
import {
  BUDGET_FLEXIBILITY,
  BUSINESS_STAGE,
  LABELS,
  MAX_COMMUNES_PER_SEARCH,
  PROPERTY_TYPE,
  SEARCH_HORIZON,
  SHARED_ATTRIBUTES,
  TRI_STATE_DEMAND,
  type TriStateDemand,
} from "@/lib/constants";
import { ClpInput, RadioPills, StepProgress, useCatalogs } from "@/components/forms";

const STEP_TITLES = [
  "Tu negocio",
  "Ubicación",
  "Presupuesto",
  "Tipo y superficie",
  "Necesidades técnicas",
  "Horizonte",
  "Contacto y resumen",
];

const DEMAND_KEYS = [
  "gas_extraction",
  "three_phase_power",
  "accessibility_required",
  "parking_required",
  "storage_required",
  "terrace_required",
  "gastronomic_fit_required",
] as const;

export function EntrepreneurWizard() {
  const router = useRouter();
  const { regions, communes } = useCatalogs();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EntrepreneurDraftData>(EMPTY_ENTREPRENEUR_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [finishedAnon, setFinishedAnon] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const trackedStart = useRef(false);

  // Cargar borrador + sesión
  useEffect(() => {
    const draft = entrepreneurDraft.load<EntrepreneurDraftData>();
    if (draft) setData({ ...EMPTY_ENTREPRENEUR_DRAFT, ...draft });
    const supabase = createSupabaseBrowser();
    void supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
    if (!trackedStart.current) {
      trackedStart.current = true;
      track("assessment_entrepreneur_started");
    }
  }, []);

  function update(patch: Partial<EntrepreneurDraftData>) {
    setData((prev) => {
      const next = { ...prev, ...patch };
      entrepreneurDraft.save(next);
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
        if (!data.rubro.trim()) return "Cuéntanos el rubro de tu negocio.";
        if (!data.stage) return "Selecciona la etapa de tu negocio.";
        return null;
      case 2:
        if (!data.region_id) return "Selecciona una región.";
        if (data.commune_ids.length < 1) return "Selecciona al menos una comuna (máximo 3).";
        return null;
      case 3:
        if (!data.max_monthly_rent_clp || data.max_monthly_rent_clp <= 0)
          return "Indica tu presupuesto máximo de arriendo mensual en CLP.";
        if (!data.budget_flexibility) return "Indica tu flexibilidad de presupuesto.";
        return null;
      case 4:
        if (!data.property_type) return "Selecciona el tipo de espacio que buscas.";
        if (
          data.surface_min_m2 !== null &&
          data.surface_max_m2 !== null &&
          data.surface_min_m2 > data.surface_max_m2
        )
          return "La superficie mínima no puede superar la máxima.";
        return null;
      case 6:
        if (!data.horizon) return "Selecciona tu horizonte de búsqueda.";
        return null;
      default:
        return null;
    }
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 7));
    window.scrollTo({ top: 0 });
  }

  async function finish() {
    const err = validateStep(6);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const completed = { ...data, completed: true };
    entrepreneurDraft.save(completed);
    setData(completed);
    track("assessment_entrepreneur_completed");

    if (!userId) {
      setFinishedAnon(true);
      window.scrollTo({ top: 0 });
      return;
    }

    // Autenticado: persistir directamente (una búsqueda activa por usuario)
    setSaving(true);
    try {
      const supabase = createSupabaseBrowser();
      await supabase.from("entrepreneur_profiles").upsert(
        {
          user_id: userId,
          assessment_status: "COMPLETED",
          rubro: completed.rubro || null,
          subrubro: completed.subrubro || null,
          stage: completed.stage || null,
          business_name: completed.business_name || null,
          is_first_location: completed.is_first_location,
        },
        { onConflict: "user_id" },
      );
      await supabase.from("active_searches").upsert(
        {
          user_id: userId,
          region_id: completed.region_id || null,
          commune_ids: completed.commune_ids.slice(0, MAX_COMMUNES_PER_SEARCH),
          sector: completed.sector || null,
          territorial_flexibility: completed.territorial_flexibility,
          property_type: completed.property_type || null,
          surface_min_m2: completed.surface_min_m2,
          surface_max_m2: completed.surface_max_m2,
          max_monthly_rent_clp: completed.max_monthly_rent_clp,
          budget_flexibility: completed.budget_flexibility || null,
          gas_extraction: completed.gas_extraction,
          three_phase_power: completed.three_phase_power,
          accessibility_required: completed.accessibility_required,
          parking_required: completed.parking_required,
          storage_required: completed.storage_required,
          terrace_required: completed.terrace_required,
          gastronomic_fit_required: completed.gastronomic_fit_required,
          horizon: completed.horizon || null,
          install_window_note: completed.install_window_note || null,
        },
        { onConflict: "user_id" },
      );
      await supabase
        .from("profiles")
        .update({ entrepreneur_context_active: true })
        .eq("id", userId);
      if (completed.proactive_opt_in) {
        await supabase
          .from("profiles")
          .update({ proactive_opportunities_opt_in: true })
          .eq("id", userId);
        await supabase.from("consents").insert({
          user_id: userId,
          consent_type: "PROACTIVE_OPPORTUNITIES_OPT_IN",
          version: "v0",
          granted: true,
          source: "ASSESSMENT",
        });
      }
      entrepreneurDraft.clear();
      router.push("/perfil?guardado=busqueda");
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
        <h2 className="mt-4 text-xl font-bold text-slate-900">¡Tu búsqueda está lista!</h2>
        <p className="mt-2 text-sm text-slate-600">
          Guardamos un borrador en este navegador por 7 días. Crea tu cuenta para guardarla de
          forma permanente y que el equipo MiLocal pueda acompañarte.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/registro?contexto=emprendedor&return_to=%2Fperfil" className="btn-primary">
            Crear cuenta y guardar
          </Link>
          <Link href="/explorar" className="btn-secondary">
            Explorar locales
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-6 p-6">
      <StepProgress step={step} total={7} titles={STEP_TITLES} />

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="rubro">
              ¿Cuál es el rubro de tu negocio?
            </label>
            <input
              id="rubro"
              className="input"
              placeholder="Ej: gastronomía, retail, servicios…"
              value={data.rubro}
              onChange={(e) => update({ rubro: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="subrubro">
              Subrubro (opcional)
            </label>
            <input
              id="subrubro"
              className="input"
              placeholder="Ej: cafetería de especialidad"
              value={data.subrubro}
              onChange={(e) => update({ subrubro: e.target.value })}
            />
          </div>
          <RadioPills
            legend="¿En qué etapa está tu negocio?"
            options={BUSINESS_STAGE.map((v) => ({ value: v, label: LABELS.businessStage[v] }))}
            value={data.stage}
            onChange={(v) => update({ stage: v })}
          />
          <div>
            <label className="label" htmlFor="bname">
              Nombre comercial (si corresponde)
            </label>
            <input
              id="bname"
              className="input"
              value={data.business_name}
              onChange={(e) => update({ business_name: e.target.value })}
            />
          </div>
          <RadioPills
            legend="¿Sería tu primer local?"
            options={[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ]}
            value={data.is_first_location === null ? "" : data.is_first_location ? "si" : "no"}
            onChange={(v) => update({ is_first_location: v === "si" })}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="region">
              Región
            </label>
            <select
              id="region"
              className="select"
              value={data.region_id}
              onChange={(e) => update({ region_id: e.target.value, commune_ids: [] })}
            >
              <option value="">Selecciona una región…</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          {data.region_id && (
            <fieldset>
              <legend className="label">Comunas de preferencia (elige hasta 3)</legend>
              <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
                {regionCommunes.map((c) => {
                  const checked = data.commune_ids.includes(c.id);
                  const disabled = !checked && data.commune_ids.length >= MAX_COMMUNES_PER_SEARCH;
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${disabled ? "text-slate-400" : "text-slate-700"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={(e) =>
                          update({
                            commune_ids: e.target.checked
                              ? [...data.commune_ids, c.id]
                              : data.commune_ids.filter((id) => id !== c.id),
                          })
                        }
                      />
                      {c.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
          <div>
            <label className="label" htmlFor="sector">
              Sector o barrio de referencia (opcional)
            </label>
            <input
              id="sector"
              className="input"
              placeholder="Ej: Barrio Italia"
              value={data.sector}
              onChange={(e) => update({ sector: e.target.value })}
            />
          </div>
          <RadioPills
            legend="¿Tienes flexibilidad territorial?"
            help="¿Considerarías otras comunas si aparece una buena oportunidad?"
            options={[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ]}
            value={
              data.territorial_flexibility === null ? "" : data.territorial_flexibility ? "si" : "no"
            }
            onChange={(v) => update({ territorial_flexibility: v === "si" })}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <ClpInput
            id="budget"
            label="Presupuesto máximo de arriendo mensual (CLP)"
            help="Monto exacto, sin gastos comunes."
            value={data.max_monthly_rent_clp}
            onChange={(v) => update({ max_monthly_rent_clp: v })}
            required
          />
          <RadioPills
            legend="Si aparece el local ideal, ¿podrías estirar ese presupuesto?"
            options={BUDGET_FLEXIBILITY.map((v) => ({
              value: v,
              label: LABELS.budgetFlexibility[v],
            }))}
            value={data.budget_flexibility}
            onChange={(v) => update({ budget_flexibility: v })}
          />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <RadioPills
            legend="¿Qué tipo de espacio buscas?"
            options={PROPERTY_TYPE.map((v) => ({ value: v, label: LABELS.propertyType[v] }))}
            value={data.property_type}
            onChange={(v) => update({ property_type: v })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="smin">
                Superficie mínima (m²)
              </label>
              <input
                id="smin"
                inputMode="numeric"
                className="input"
                value={data.surface_min_m2 ?? ""}
                onChange={(e) =>
                  update({ surface_min_m2: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="smax">
                Superficie máxima (m²)
              </label>
              <input
                id="smax"
                inputMode="numeric"
                className="input"
                value={data.surface_max_m2 ?? ""}
                onChange={(e) =>
                  update({ surface_max_m2: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })
                }
              />
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Marca lo que tu negocio necesita. «Indiferente» significa que no es determinante.
          </p>
          {SHARED_ATTRIBUTES.map((attr, i) => {
            const key = DEMAND_KEYS[i]!;
            return (
              <RadioPills
                key={key}
                legend={attr.label}
                options={TRI_STATE_DEMAND.map((v) => ({ value: v, label: LABELS.triDemand[v] }))}
                value={data[key] as TriStateDemand}
                onChange={(v) => update({ [key]: v } as Partial<EntrepreneurDraftData>)}
              />
            );
          })}
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <RadioPills
            legend="¿Para cuándo necesitas instalarte?"
            options={SEARCH_HORIZON.map((v) => ({ value: v, label: LABELS.horizon[v] }))}
            value={data.horizon}
            onChange={(v) => update({ horizon: v })}
          />
          <div>
            <label className="label" htmlFor="note">
              ¿Algo más sobre tus plazos? (opcional)
            </label>
            <textarea
              id="note"
              className="input"
              rows={2}
              value={data.install_window_note}
              onChange={(e) => update({ install_window_note: e.target.value })}
            />
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-4">
          <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={data.proactive_opt_in}
              onChange={(e) => update({ proactive_opt_in: e.target.checked })}
            />
            <span>
              (Opcional) Autorizo a MiLocal a contactarme proactivamente si aparece un local que
              calce con esta búsqueda. Puedes revocarlo cuando quieras desde tu perfil.
            </span>
          </label>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <h3 className="font-semibold text-slate-900">Resumen de tu búsqueda</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <strong>Negocio:</strong> {data.rubro || "—"}
                {data.stage ? ` · ${LABELS.businessStage[data.stage]}` : ""}
              </li>
              <li>
                <strong>Comunas:</strong>{" "}
                {data.commune_ids
                  .map((id) => communes.find((c) => c.id === id)?.name)
                  .filter(Boolean)
                  .join(", ") || "—"}
              </li>
              <li>
                <strong>Presupuesto:</strong>{" "}
                {data.max_monthly_rent_clp
                  ? `$${new Intl.NumberFormat("es-CL").format(data.max_monthly_rent_clp)}`
                  : "—"}
                {data.budget_flexibility
                  ? ` (${LABELS.budgetFlexibility[data.budget_flexibility]})`
                  : ""}
              </li>
              <li>
                <strong>Tipo:</strong>{" "}
                {data.property_type ? LABELS.propertyType[data.property_type] : "—"}
              </li>
              <li>
                <strong>Horizonte:</strong> {data.horizon ? LABELS.horizon[data.horizon] : "—"}
              </li>
            </ul>
          </div>
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
        {step < 7 ? (
          <button type="button" className="btn-primary" onClick={next}>
            Continuar →
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={finish} disabled={saving}>
            {saving ? "Guardando…" : userId ? "Guardar mi búsqueda" : "Finalizar"}
          </button>
        )}
      </div>
    </div>
  );
}
