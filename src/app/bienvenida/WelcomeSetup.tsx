"use client";

// Vinculación post-verificación: consentimientos versionados, contextos y
// borradores anónimos -> cuenta (sin duplicación). Luego retorna a la
// intención original (return_to seguro).

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { safeReturnTo } from "@/lib/return-to";
import { entrepreneurDraft, ownerDraft } from "@/lib/draft";
import type { EntrepreneurDraftData, OwnerDraftData } from "@/lib/draft-types";

interface PendingSetup {
  asEntrepreneur: boolean;
  asOwner: boolean;
  marketing: boolean;
  proactive: boolean;
}

function readPendingSetup(): PendingSetup {
  try {
    const raw = localStorage.getItem("ml_pending_setup");
    if (raw) return JSON.parse(raw) as PendingSetup;
  } catch {
    /* defaults */
  }
  return { asEntrepreneur: true, asOwner: false, marketing: false, proactive: false };
}

export function WelcomeSetup() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get("return_to")) ?? "/";
  const [message, setMessage] = useState("Preparando tu cuenta…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/login?return_to=${encodeURIComponent(returnTo)}`);
        return;
      }
      try {

      const setup = readPendingSetup();
      const eDraft = entrepreneurDraft.load<EntrepreneurDraftData>();
      const oDraft = ownerDraft.load<OwnerDraftData>();

      // Versiones de textos legales vigentes
      const { data: settings } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["terms_version", "privacy_version"]);
      const versions = new Map((settings ?? []).map((s) => [s.key as string, String(s.value).replaceAll('"', "")]));
      const termsV = versions.get("terms_version") ?? "v0";
      const privacyV = versions.get("privacy_version") ?? "v0";

      const proactive = setup.proactive || eDraft?.proactive_opt_in === true;

      // 1) Perfil: contextos + preferencias (separadas y revocables)
      await supabase
        .from("profiles")
        .update({
          entrepreneur_context_active: setup.asEntrepreneur || !!eDraft,
          owner_context_active: setup.asOwner || !!oDraft,
          marketing_opt_in: setup.marketing,
          proactive_opportunities_opt_in: proactive,
          adult_declaration: true,
        })
        .eq("id", user.id);

      // 2) Constancias de consentimiento versionadas (append-only)
      await supabase.from("consents").insert([
        { user_id: user.id, consent_type: "TERMS", version: termsV, granted: true, source: "REGISTRO" },
        { user_id: user.id, consent_type: "PRIVACY", version: privacyV, granted: true, source: "REGISTRO" },
        { user_id: user.id, consent_type: "ADULT_DECLARATION", version: termsV, granted: true, source: "REGISTRO" },
        { user_id: user.id, consent_type: "MARKETING_OPT_IN", version: termsV, granted: setup.marketing, source: "REGISTRO" },
        { user_id: user.id, consent_type: "PROACTIVE_OPPORTUNITIES_OPT_IN", version: termsV, granted: proactive, source: "REGISTRO" },
      ]);

      // 3) Contexto Emprendedor + vinculación del borrador (sin duplicar)
      if (setup.asEntrepreneur || eDraft) {
        setMessage("Vinculando tu búsqueda…");
        await supabase.from("entrepreneur_profiles").upsert(
          {
            user_id: user.id,
            assessment_status: eDraft ? (eDraft.completed ? "COMPLETED" : "IN_PROGRESS") : "NOT_STARTED",
            rubro: eDraft?.rubro || null,
            subrubro: eDraft?.subrubro || null,
            stage: eDraft?.stage || null,
            business_name: eDraft?.business_name || null,
            is_first_location: eDraft?.is_first_location ?? null,
          },
          { onConflict: "user_id" },
        );
        if (eDraft) {
          await supabase.from("active_searches").upsert(
            {
              user_id: user.id,
              region_id: eDraft.region_id || null,
              commune_ids: eDraft.commune_ids.slice(0, 3),
              sector: eDraft.sector || null,
              territorial_flexibility: eDraft.territorial_flexibility,
              property_type: eDraft.property_type || null,
              surface_min_m2: eDraft.surface_min_m2,
              surface_max_m2: eDraft.surface_max_m2,
              max_monthly_rent_clp: eDraft.max_monthly_rent_clp,
              budget_flexibility: eDraft.budget_flexibility || null,
              gas_extraction: eDraft.gas_extraction,
              three_phase_power: eDraft.three_phase_power,
              accessibility_required: eDraft.accessibility_required,
              parking_required: eDraft.parking_required,
              storage_required: eDraft.storage_required,
              terrace_required: eDraft.terrace_required,
              gastronomic_fit_required: eDraft.gastronomic_fit_required,
              horizon: eDraft.horizon || null,
              install_window_note: eDraft.install_window_note || null,
            },
            { onConflict: "user_id" },
          );
          entrepreneurDraft.clear();
        }
      }

      // 4) Contexto Propietario + property_id DRAFT estable desde el inicio
      if (setup.asOwner || oDraft) {
        setMessage("Creando tu borrador de propiedad…");
        await supabase.from("owner_profiles").upsert(
          {
            user_id: user.id,
            assessment_status: oDraft ? (oDraft.completed ? "COMPLETED" : "IN_PROGRESS") : "NOT_STARTED",
            owner_type: oDraft?.owner_type || null,
            contact_preference: oDraft?.contact_preference || null,
          },
          { onConflict: "user_id" },
        );
        if (oDraft) {
          await supabase.from("properties").insert({
            owner_user_id: user.id,
            owner_relationship: oDraft.owner_relationship || oDraft.owner_type || null,
            status: "DRAFT",
            title: oDraft.title || null,
            description: oDraft.description || null,
            property_type: oDraft.property_type || null,
            region_id: oDraft.region_id || null,
            commune_id: oDraft.commune_id || null,
            sector: oDraft.sector || null,
            address_full: oDraft.address_full || null,
            monthly_rent_clp: oDraft.monthly_rent_clp,
            rent_is_negotiable: oDraft.rent_is_negotiable,
            common_expenses_clp: oDraft.common_expenses_clp,
            guarantee_clp: oDraft.guarantee_clp,
            surface_m2: oDraft.surface_m2,
            bathrooms: oDraft.bathrooms,
            condition: oDraft.condition || null,
            available_from: oDraft.available_from || null,
            usage_restrictions: oDraft.usage_restrictions || null,
            has_gas_extraction: oDraft.has_gas_extraction,
            has_three_phase_power: oDraft.has_three_phase_power,
            has_accessibility: oDraft.has_accessibility,
            parking_spaces: oDraft.parking_spaces,
            has_storage: oDraft.has_storage,
            has_terrace_or_patio: oDraft.has_terrace_or_patio,
            has_food_service_fitout: oDraft.has_food_service_fitout,
          });
          ownerDraft.clear();
        }
      }

        try {
          localStorage.removeItem("ml_pending_setup");
        } catch {
          /* noop */
        }
      } finally {
        // Pase lo que pase, retornar a la intención original: el perfil y
        // Mis locales permiten completar cualquier dato que haya fallado.
        router.replace(returnTo);
        router.refresh();
      }
    })();
  }, [router, returnTo]);

  return (
    <div className="card p-8">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      <p className="mt-4 font-medium text-slate-700">{message}</p>
    </div>
  );
}
