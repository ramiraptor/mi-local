"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type BrowserClient = SupabaseClient;

let singleton: BrowserClient | undefined;

/**
 * Cliente Supabase para componentes de navegador (anon key; RLS protege).
 * SINGLETON: múltiples instancias de GoTrueClient en la misma pestaña compiten
 * por el navigator lock y pueden bloquearse entre sí.
 */
export function createSupabaseBrowser(): BrowserClient {
  if (!singleton) {
    singleton = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return singleton;
}
