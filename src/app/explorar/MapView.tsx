"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { formatCLP } from "@/lib/format";
import type { MapPin } from "./ViewToggle";

// Centro por defecto: Santiago de Chile
const DEFAULT_CENTER: [number, number] = [-33.45, -70.66];

export function MapView({ pins, height = 420 }: { pins: MapPin[]; height?: number }) {
  const center: [number, number] =
    pins.length > 0 ? [pins[0]!.lat, pins[0]!.lng] : DEFAULT_CENTER;

  return (
    <div className="card overflow-hidden" style={{ height }}>
      <MapContainer
        center={center}
        zoom={pins.length === 1 ? 14 : 11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {pins.map((pin) => (
          <CircleMarker
            key={pin.id}
            center={[pin.lat, pin.lng]}
            radius={10}
            pathOptions={{ color: "#0f766e", fillColor: "#14b8a6", fillOpacity: 0.6, weight: 2 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{pin.title}</p>
                <p>{formatCLP(pin.rent)}/mes</p>
                <Link href={`/propiedad/${pin.id}`} className="font-semibold text-brand-700">
                  Ver ficha →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
