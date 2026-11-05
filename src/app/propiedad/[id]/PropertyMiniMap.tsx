"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/app/explorar/ViewToggle";

const MapView = dynamic(() => import("@/app/explorar/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="card flex h-[280px] items-center justify-center text-sm text-slate-400">
      Cargando mapa…
    </div>
  ),
});

export function PropertyMiniMap({ pin }: { pin: MapPin }) {
  return <MapView pins={[pin]} height={280} />;
}
