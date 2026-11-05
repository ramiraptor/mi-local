"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="card mt-6 flex h-[420px] items-center justify-center text-sm text-slate-400">
      Cargando mapa…
    </div>
  ),
});

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  rent: number | null;
}

/** Alternancia lista/mapa (mobile-first). La lista llega server-rendered como children. */
export function ViewToggle({ pins, children }: { pins: MapPin[]; children: React.ReactNode }) {
  const [view, setView] = useState<"lista" | "mapa">("lista");

  return (
    <div>
      <div className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white p-0.5" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "lista"}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${view === "lista" ? "bg-brand-700 text-white" : "text-slate-600"}`}
          onClick={() => setView("lista")}
        >
          Lista
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "mapa"}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${view === "mapa" ? "bg-brand-700 text-white" : "text-slate-600"}`}
          onClick={() => setView("mapa")}
        >
          Mapa
        </button>
      </div>
      {view === "lista" ? (
        children
      ) : (
        <div className="mt-2">
          <p className="my-2 text-xs text-slate-500">
            📍 Ubicaciones aproximadas para proteger la privacidad. La dirección exacta se coordina
            con MiLocal.
          </p>
          <MapView pins={pins} />
        </div>
      )}
    </div>
  );
}
