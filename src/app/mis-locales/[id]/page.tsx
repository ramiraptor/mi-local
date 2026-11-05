import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/signed-photos";
import type { PropertyPhoto, PropertyRow } from "@/lib/types";
import { PropertyEditor } from "./PropertyEditor";

export const metadata: Metadata = {
  title: "Editar inmueble",
  robots: { index: false, follow: false },
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?return_to=%2Fmis-locales");

  // RLS: solo el dueño obtiene la fila
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!property) notFound();

  const { data: photos } = await supabase
    .from("property_photos")
    .select("*")
    .eq("property_id", id)
    .order("position", { ascending: true });

  const photoRows = (photos ?? []) as PropertyPhoto[];
  const signed = await signPhotoUrls(photoRows.map((p) => p.thumb_path));
  const photosWithUrls = photoRows.map((p) => ({
    ...p,
    thumbUrl: signed.get(p.thumb_path) ?? null,
  }));

  return (
    <div className="container-page max-w-3xl py-8">
      <PropertyEditor
        property={property as PropertyRow}
        photos={photosWithUrls}
        emailVerified={Boolean(user.email_confirmed_at)}
      />
    </div>
  );
}
