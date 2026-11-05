"use client";

// Capa PROPIA de analítica (adapter interno). LEGAL-06: GA4/Clarity NO activos.
// Reglas: diccionario permitido, sin PII, /admin totalmente excluido,
// jamás romper el flujo del usuario por un fallo de medición.

import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { AnalyticsEvent } from "@/lib/constants";

type AllowedProps = Partial<{
  property_type: string;
  commune_slug: string;
  region_code: string;
  intent: string;
  source: string;
  path: string;
  results_count: number;
}>;

function getAnonSessionId(): string | null {
  try {
    const KEY = "ml_sid";
    let sid = sessionStorage.getItem(KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

export function track(event: AnalyticsEvent, props: AllowedProps = {}, propertyId?: string): void {
  try {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return; // exclusión total
    const supabase = createSupabaseBrowser();
    void supabase
      .rpc("track_event", {
        p_event_name: event,
        p_anon_session_id: getAnonSessionId(),
        p_property_id: propertyId ?? null,
        p_props: props,
      })
      .then(() => undefined);
  } catch {
    // silencioso por diseño
  }
}
