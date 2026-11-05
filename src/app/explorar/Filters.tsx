"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LABELS, PROPERTY_TYPE } from "@/lib/constants";
import { useCatalogs } from "@/components/forms";

/** Filtros sincronizados con la URL (región, ≤3 comunas, tipo, renta, superficie). */
export function Filters() {
  const router = useRouter();
  const params = useSearchParams();
  const { regions, communes } = useCatalogs();

  const [region, setRegion] = useState(params.get("region") ?? "");
  const [communeSlugs, setCommuneSlugs] = useState<string[]>(
    (params.get("comunas") ?? "").split(",").filter(Boolean).slice(0, 3),
  );
  const [tipo, setTipo] = useState(params.get("tipo") ?? "");
  const [rentaMax, setRentaMax] = useState(params.get("renta_max") ?? "");
  const [supMin, setSupMin] = useState(params.get("sup_min") ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setRegion(params.get("region") ?? "");
    setCommuneSlugs((params.get("comunas") ?? "").split(",").filter(Boolean).slice(0, 3));
    setTipo(params.get("tipo") ?? "");
    setRentaMax(params.get("renta_max") ?? "");
    setSupMin(params.get("sup_min") ?? "");
  }, [params]);

  const selectedRegion = regions.find((r) => r.code === region);
  const regionCommunes = selectedRegion
    ? communes.filter((c) => c.region_id === selectedRegion.id)
    : communes;

  function apply() {
    const q = new URLSearchParams();
    if (region) q.set("region", region);
    if (communeSlugs.length > 0) q.set("comunas", communeSlugs.join(","));
    if (tipo) q.set("tipo", tipo);
    if (rentaMax) q.set("renta_max", rentaMax.replace(/\D/g, ""));
    if (supMin) q.set("sup_min", supMin.replace(/\D/g, ""));
    router.push(`/explorar${q.toString() ? `?${q.toString()}` : ""}`);
    setOpen(false);
  }

  function clearAll() {
    setRegion("");
    setCommuneSlugs([]);
    setTipo("");
    setRentaMax("");
    setSupMin("");
    router.push("/explorar");
    setOpen(false);
  }

  const activeCount = [region, communeSlugs.length > 0, tipo, rentaMax, supMin].filter(
    Boolean,
  ).length;

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-secondary px-3 py-1.5 text-sm"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          Filtros {activeCount > 0 ? `(${activeCount})` : ""} {open ? "▲" : "▼"}
        </button>
        <select
          className="select max-w-56"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          aria-label="Tipo de inmueble"
        >
          <option value="">Todos los tipos</option>
          {PROPERTY_TYPE.map((t) => (
            <option key={t} value={t}>
              {LABELS.propertyType[t]}
            </option>
          ))}
        </select>
        <button type="button" className="btn-primary px-4 py-1.5 text-sm" onClick={apply}>
          Aplicar
        </button>
        {activeCount > 0 && (
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={clearAll}>
            Limpiar
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="f-region">
              Región
            </label>
            <select
              id="f-region"
              className="select"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setCommuneSlugs([]);
              }}
            >
              <option value="">Todas</option>
              {regions.map((r) => (
                <option key={r.id} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">Comunas (hasta 3)</span>
            <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {regionCommunes.map((c) => {
                const checked = communeSlugs.includes(c.slug);
                const disabled = !checked && communeSlugs.length >= 3;
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 px-1 py-0.5 text-sm ${disabled ? "text-slate-400" : "text-slate-700"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={(e) =>
                        setCommuneSlugs((prev) =>
                          e.target.checked ? [...prev, c.slug] : prev.filter((s) => s !== c.slug),
                        )
                      }
                    />
                    {c.name}
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="f-renta">
              Renta máxima (CLP)
            </label>
            <input
              id="f-renta"
              inputMode="numeric"
              className="input"
              placeholder="Ej: 1.500.000"
              value={rentaMax}
              onChange={(e) => setRentaMax(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="f-sup">
              Superficie mínima (m²)
            </label>
            <input
              id="f-sup"
              inputMode="numeric"
              className="input"
              placeholder="Ej: 50"
              value={supMin}
              onChange={(e) => setSupMin(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
