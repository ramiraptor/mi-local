import type { MetadataRoute } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/explorar`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/terminos`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${siteUrl}/privacidad`, changeFrequency: "monthly", priority: 0.2 },
  ];

  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("public_properties")
      .select("id, published_at")
      .order("published_at", { ascending: false })
      .limit(500);
    for (const p of data ?? []) {
      entries.push({
        url: `${siteUrl}/propiedad/${p.id}`,
        lastModified: p.published_at ? new Date(p.published_at) : undefined,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch {
    // sitemap mínimo si la BD no responde
  }
  return entries;
}
