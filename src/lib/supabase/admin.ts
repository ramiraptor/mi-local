import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role: SOLO código de servidor (pipeline de fotos,
 * firmas de URL). JAMÁS importar desde componentes cliente.
 */
export function createSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
