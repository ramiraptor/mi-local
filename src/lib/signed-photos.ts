import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "property-photos";
const DEFAULT_TTL_SECONDS = 3600;

/**
 * Firma URLs de fotos (bucket privado; solo derivados saneados sin EXIF/GPS).
 * Al despublicar, las páginas dejan de emitir firmas y las vigentes expiran
 * en <= 1 hora (retirada efectiva).
 */
export async function signPhotoUrls(
  paths: string[],
  expiresIn: number = DEFAULT_TTL_SECONDS,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (paths.length === 0) return result;
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrls(paths, expiresIn);
  if (error || !data) return result;
  for (const item of data) {
    if (item.signedUrl && item.path) {
      result.set(item.path, item.signedUrl);
    }
  }
  return result;
}
