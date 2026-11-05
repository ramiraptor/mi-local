"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Preferencias SEPARADAS, opcionales y revocables. Cada cambio queda
 * registrado como constancia versionada en `consents` (append-only).
 */
export function PreferencesEditor({
  initialMarketing,
  initialProactive,
}: {
  initialMarketing: boolean;
  initialProactive: boolean;
}) {
  const [marketing, setMarketing] = useState(initialMarketing);
  const [proactive, setProactive] = useState(initialProactive);
  const [status, setStatus] = useState<string | null>(null);

  async function toggle(kind: "marketing" | "proactive", value: boolean) {
    const supabase = createSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (kind === "marketing") setMarketing(value);
    else setProactive(value);

    const column = kind === "marketing" ? "marketing_opt_in" : "proactive_opportunities_opt_in";
    const consentType = kind === "marketing" ? "MARKETING_OPT_IN" : "PROACTIVE_OPPORTUNITIES_OPT_IN";

    const { error } = await supabase
      .from("profiles")
      .update({ [column]: value })
      .eq("id", user.id);
    if (!error) {
      await supabase.from("consents").insert({
        user_id: user.id,
        consent_type: consentType,
        version: "v0",
        granted: value,
        source: "PERFIL",
      });
      setStatus("Preferencia actualizada ✓");
      setTimeout(() => setStatus(null), 2500);
    }
  }

  return (
    <div className="mt-3 space-y-3 text-sm">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={proactive}
          onChange={(e) => void toggle("proactive", e.target.checked)}
        />
        <span>
          <strong>Oportunidades proactivas:</strong> MiLocal puede contactarme si detecta un local
          que calza con mi búsqueda.
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={marketing}
          onChange={(e) => void toggle("marketing", e.target.checked)}
        />
        <span>
          <strong>Marketing:</strong> quiero recibir novedades y comunicaciones generales de
          MiLocal.
        </span>
      </label>
      <p className="text-xs text-slate-500">
        Son opciones independientes y revocables. Los correos operativos (verificación, respuesta a
        tus solicitudes) no dependen de estas casillas.
      </p>
      {status && <p className="text-xs font-medium text-emerald-700">{status}</p>}
    </div>
  );
}
