import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { MAX_PHOTOS } from "@/lib/constants";

export const runtime = "nodejs";

const BUCKET = "property-photos";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB por archivo
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

/**
 * POST /api/photos — sube una fotografía saneada.
 * Pipeline obligatorio (Anexo §06): MIME real + peso, re-encode con sharp
 * (elimina EXIF/GPS), compresión y thumbnail. Bucket privado; el cliente
 * recibe URLs firmadas de corta duración.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const propertyId = form.get("property_id");
  if (!(file instanceof File) || typeof propertyId !== "string") {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE", maxBytes: MAX_BYTES }, { status: 413 });
  }

  // Propiedad del recurso: la consulta pasa por RLS (solo dueño ve su fila)
  const { data: property } = await supabase
    .from("properties")
    .select("id, status, owner_user_id")
    .eq("id", propertyId)
    .maybeSingle();
  if (!property) {
    return NextResponse.json({ error: "PROPERTY_NOT_FOUND" }, { status: 404 });
  }
  if (property.status === "ARCHIVED") {
    return NextResponse.json({ error: "PROPERTY_ARCHIVED" }, { status: 409 });
  }

  const { count } = await supabase
    .from("property_photos")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);
  if ((count ?? 0) >= MAX_PHOTOS) {
    return NextResponse.json({ error: "TOO_MANY_PHOTOS", max: MAX_PHOTOS }, { status: 409 });
  }

  // Validación de MIME REAL: sharp debe poder decodificar el archivo
  const input = Buffer.from(await file.arrayBuffer());
  let meta: sharp.Metadata;
  try {
    meta = await sharp(input, { failOn: "error" }).metadata();
  } catch {
    return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 415 });
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    return NextResponse.json({ error: "UNSUPPORTED_FORMAT" }, { status: 415 });
  }

  // Re-encode (elimina EXIF/GPS por defecto) + thumbnail
  const [main, thumb] = await Promise.all([
    sharp(input)
      .rotate() // aplica orientación EXIF antes de descartar metadatos
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true }),
    sharp(input)
      .rotate()
      .resize(640, 480, { fit: "cover" })
      .webp({ quality: 72 })
      .toBuffer(),
  ]);

  const photoId = crypto.randomUUID();
  const mainPath = `${propertyId}/${photoId}.webp`;
  const thumbPath = `${propertyId}/${photoId}_thumb.webp`;

  const admin = createSupabaseAdmin();
  const up1 = await admin.storage.from(BUCKET).upload(mainPath, main.data, {
    contentType: "image/webp",
    cacheControl: "3600",
  });
  const up2 = await admin.storage.from(BUCKET).upload(thumbPath, thumb, {
    contentType: "image/webp",
    cacheControl: "3600",
  });
  if (up1.error || up2.error) {
    return NextResponse.json({ error: "STORAGE_ERROR" }, { status: 500 });
  }

  const { data: maxPos } = await supabase
    .from("property_photos")
    .select("position")
    .eq("property_id", propertyId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: row, error: insertError } = await admin
    .from("property_photos")
    .insert({
      id: photoId,
      property_id: propertyId,
      storage_path: mainPath,
      thumb_path: thumbPath,
      position: (maxPos?.position ?? -1) + 1,
      width: main.info.width,
      height: main.info.height,
      bytes: main.info.size,
    })
    .select()
    .single();
  if (insertError) {
    await admin.storage.from(BUCKET).remove([mainPath, thumbPath]);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }

  const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(thumbPath, 3600);
  return NextResponse.json({ photo: row, thumbUrl: signed?.signedUrl ?? null });
}

/** DELETE /api/photos — elimina foto (fila + objetos de Storage). */
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { photo_id: photoId } = (await request.json().catch(() => ({}))) as { photo_id?: string };
  if (!photoId) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  // RLS: solo el dueño de la propiedad ve esta fila
  const { data: photo } = await supabase
    .from("property_photos")
    .select("id, property_id, storage_path, thumb_path")
    .eq("id", photoId)
    .maybeSingle();
  if (!photo) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const admin = createSupabaseAdmin();
  await admin.storage.from(BUCKET).remove([photo.storage_path, photo.thumb_path]);
  await admin.from("property_photos").delete().eq("id", photoId);
  return NextResponse.json({ ok: true });
}
