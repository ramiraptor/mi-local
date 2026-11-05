import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Exportaciones CSV (solo ADMIN con MFA). Cabeceras estables v1.
 * Reglas: UTF-8 + BOM, IDs como texto, fechas ISO 8601 (UTC), anti formula
 * injection, SIN address_full ni notas privadas por defecto. Auditada vía
 * admin_log_csv_export (dataset, filtros, nº de filas; nunca el archivo).
 */

const DATASETS = ["emprendedores", "propietarios", "inmuebles", "intereses"] as const;
type Dataset = (typeof DATASETS)[number];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dataset: string }> },
) {
  const { dataset } = await params;
  if (!DATASETS.includes(dataset as Dataset)) {
    return NextResponse.json({ error: "INVALID_DATASET" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { data: status } = await supabase.rpc("get_my_admin_status");
  const s = (status ?? {}) as { is_admin?: boolean; aal2?: boolean };
  if (!s.is_admin || !s.aal2) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let headers: string[] = [];
  let rows: unknown[][] = [];

  if (dataset === "emprendedores") {
    const [{ data: profiles }, { data: searches }, { data: communes }] = await Promise.all([
      supabase.from("admin_profiles").select("*").eq("entrepreneur_context_active", true),
      supabase.from("admin_active_searches").select("*"),
      supabase.from("communes").select("id, name"),
    ]);
    const communeName = new Map((communes ?? []).map((c) => [c.id as string, c.name as string]));
    const searchByUser = new Map((searches ?? []).map((sr) => [sr.user_id as string, sr]));
    headers = [
      "user_id", "nombre", "email", "telefono", "correo_verificado",
      "assessment_status", "rubro", "subrubro", "etapa", "nombre_comercial", "primer_local",
      "comunas", "sector", "flexibilidad_territorial", "tipo_inmueble",
      "superficie_min_m2", "superficie_max_m2", "max_monthly_rent_clp", "budget_flexibility",
      "gas_extraction", "three_phase_power", "accessibility_required", "parking_required",
      "storage_required", "terrace_required", "gastronomic_fit_required",
      "horizonte", "proactive_opportunities_opt_in", "marketing_opt_in", "creado_at",
    ];
    rows = (profiles ?? []).map((p) => {
      const sr = searchByUser.get(p.id as string) as Record<string, unknown> | undefined;
      const communeNames = Array.isArray(sr?.commune_ids)
        ? (sr.commune_ids as string[]).map((id) => communeName.get(id) ?? id)
        : [];
      return [
        p.id, p.full_name, p.email, p.phone, p.email_verified,
        p.entrepreneur_assessment_status, p.rubro, p.subrubro, p.business_stage, p.business_name,
        p.is_first_location,
        communeNames, sr?.sector ?? null, sr?.territorial_flexibility ?? null, sr?.property_type ?? null,
        sr?.surface_min_m2 ?? null, sr?.surface_max_m2 ?? null, sr?.max_monthly_rent_clp ?? null,
        sr?.budget_flexibility ?? null,
        sr?.gas_extraction ?? null, sr?.three_phase_power ?? null, sr?.accessibility_required ?? null,
        sr?.parking_required ?? null, sr?.storage_required ?? null, sr?.terrace_required ?? null,
        sr?.gastronomic_fit_required ?? null,
        sr?.horizon ?? null, p.proactive_opportunities_opt_in, p.marketing_opt_in, p.created_at,
      ];
    });
  }

  if (dataset === "propietarios") {
    const [{ data: profiles }, { data: props }] = await Promise.all([
      supabase.from("admin_profiles").select("*").eq("owner_context_active", true),
      supabase.from("admin_properties").select("owner_user_id, status"),
    ]);
    const countByOwner = new Map<string, { total: number; published: number }>();
    for (const pr of props ?? []) {
      const key = pr.owner_user_id as string;
      const entry = countByOwner.get(key) ?? { total: 0, published: 0 };
      entry.total += 1;
      if (pr.status === "PUBLISHED") entry.published += 1;
      countByOwner.set(key, entry);
    }
    headers = [
      "user_id", "nombre", "email", "telefono", "correo_verificado",
      "assessment_status", "owner_type", "preferencia_contacto",
      "n_inmuebles", "n_publicados", "marketing_opt_in", "creado_at",
    ];
    rows = (profiles ?? []).map((p) => {
      const c = countByOwner.get(p.id as string) ?? { total: 0, published: 0 };
      return [
        p.id, p.full_name, p.email, p.phone, p.email_verified,
        p.owner_assessment_status, p.owner_type, p.contact_preference,
        c.total, c.published, p.marketing_opt_in, p.created_at,
      ];
    });
  }

  if (dataset === "inmuebles") {
    const { data: props } = await supabase.from("admin_properties").select("*");
    headers = [
      "property_id", "owner_user_id", "estado", "titulo", "tipo",
      "region", "comuna", "sector",
      "monthly_rent_clp", "rent_is_negotiable", "common_expenses_clp", "guarantee_clp",
      "surface_m2", "banos", "condicion",
      "has_gas_extraction", "has_three_phase_power", "has_accessibility", "parking_spaces",
      "has_storage", "has_terrace_or_patio", "has_food_service_fitout",
      "restricciones_uso", "publicada_at", "vigencia_confirmada_at",
      "moderada", "n_fotos", "n_intereses", "creado_at",
      // NOTA: address_full y coordenadas exactas NO se exportan por defecto.
    ];
    rows = (props ?? []).map((p) => [
      p.id, p.owner_user_id, p.status, p.title, p.property_type,
      p.region_name, p.commune_name, p.sector,
      p.monthly_rent_clp, p.rent_is_negotiable, p.common_expenses_clp, p.guarantee_clp,
      p.surface_m2, p.bathrooms, p.condition,
      p.has_gas_extraction, p.has_three_phase_power, p.has_accessibility, p.parking_spaces,
      p.has_storage, p.has_terrace_or_patio, p.has_food_service_fitout,
      p.usage_restrictions, p.published_at, p.availability_last_confirmed_at,
      p.moderation_locked, p.photo_count, p.interest_count, p.created_at,
    ]);
  }

  if (dataset === "intereses") {
    const { data: interests } = await supabase.from("admin_interests").select("*");
    headers = [
      "interest_id", "user_id", "property_id", "intencion",
      "estado_comercial", "precalificacion",
      "rent_snapshot_clp", "renta_vigente_clp",
      "insistencias", "ultima_insistencia_at",
      "responsable_user_id", "origen", "motivo_lost", "cerrado_at", "creado_at",
      // NOTA: las notas privadas NO se exportan por defecto.
    ];
    rows = (interests ?? []).map((i) => [
      i.id, i.user_id, i.property_id, i.intent,
      i.commercial_status, i.qualification_status,
      i.rent_snapshot_clp, i.current_rent_clp,
      i.interest_attempt_count, i.last_attempt_at,
      i.assigned_admin_user_id, i.source, i.lost_reason, i.closed_at, i.created_at,
    ]);
  }

  // Auditoría ANTES de entregar el archivo
  const { error: auditError } = await supabase.rpc("admin_log_csv_export", {
    p_dataset: dataset,
    p_filters: {},
    p_row_count: rows.length,
  });
  if (auditError) {
    // Sin auditoría no hay descarga
    return NextResponse.json({ error: "AUDIT_FAILED" }, { status: 500 });
  }

  const csv = toCsv(headers, rows);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dataset}_${date}_v1.csv"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
