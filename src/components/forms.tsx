"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { Commune, Region } from "@/lib/types";

/** Píldoras de opción única accesibles (radiogroup). */
export function RadioPills<T extends string>({
  legend,
  options,
  value,
  onChange,
  help,
}: {
  legend: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T | "";
  onChange: (v: T) => void;
  help?: string;
}) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      {help && <p className="mb-2 text-xs text-slate-500">{help}</p>}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={legend}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              value === opt.value
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Input CLP con separador de miles es-CL. */
export function ClpInput({
  id,
  label,
  value,
  onChange,
  required,
  help,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  required?: boolean;
  help?: string;
}) {
  const display = value === null ? "" : new Intl.NumberFormat("es-CL").format(value);
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {help && <p className="mb-1 text-xs text-slate-500">{help}</p>}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
          $
        </span>
        <input
          id={id}
          inputMode="numeric"
          className="input pl-7"
          value={display}
          required={required}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onChange(digits ? Number(digits) : null);
          }}
        />
      </div>
    </div>
  );
}

/** Barra de progreso del wizard. */
export function StepProgress({ step, total, titles }: { step: number; total: number; titles: string[] }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-brand-800">{titles[step - 1]}</span>
        <span className="text-slate-500">
          Paso {step} de {total}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${Math.round((step / total) * 100)}%` }}
        />
      </div>
    </div>
  );
}

/** Catálogos Región → Comuna desde BD. */
export function useCatalogs() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    void (async () => {
      const [{ data: r }, { data: c }] = await Promise.all([
        supabase.from("regions").select("id, code, name").order("code"),
        supabase.from("communes").select("id, region_id, name, slug").order("name"),
      ]);
      setRegions((r ?? []) as Region[]);
      setCommunes((c ?? []) as Commune[]);
      setLoading(false);
    })();
  }, []);

  return { regions, communes, loading };
}
