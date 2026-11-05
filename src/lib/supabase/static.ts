import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo SIN cookies para contenido público cacheable (ISR).
 * Solo lecturas de vistas públicas; nunca datos de sesión.
 */
export function createSupabaseStatic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
