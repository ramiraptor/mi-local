"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import { INTEREST_INTENT, LABELS, type InterestIntent } from "@/lib/constants";

type Phase = "loading" | "anonymous" | "unverified" | "ready" | "profile" | "done";

/**
 * «Me interesa» (Flujo B): registro exprés sin assessment, correo verificado
 * obligatorio, Interest único CONTACT/VISIT idempotente con snapshot de renta.
 */
export function InterestCTA({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<InterestIntent>("CONTACT");
  const [existing, setExisting] = useState<{ intent: InterestIntent; attempts: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [doneInfo, setDoneInfo] = useState<{ repeated: boolean } | null>(null);
  // Para completar nombre/teléfono si faltan (Interest válido los exige)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPhase("anonymous");
        return;
      }
      setEmail(user.email ?? "");
      if (!user.email_confirmed_at) {
        setPhase("unverified");
        return;
      }
      const { data: mine } = await supabase
        .from("my_interests")
        .select("intent, interest_attempt_count")
        .eq("property_id", propertyId)
        .maybeSingle();
      if (mine) {
        setExisting({
          intent: mine.intent as InterestIntent,
          attempts: mine.interest_attempt_count as number,
        });
      }
      setPhase("ready");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  function goRegister() {
    track("interest_cta_click", { source: "anonymous" }, propertyId);
    router.push(
      `/registro?contexto=interes&return_to=${encodeURIComponent(`/propiedad/${propertyId}`)}`,
    );
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      track("interest_submitted", { intent }, propertyId);
      const { data, error: rpcError } = await supabase.rpc("create_interest", {
        p_property_id: propertyId,
        p_intent: intent,
        p_source: "EXPLORE_DETAIL",
      });
      if (rpcError) {
        const msg = rpcError.message ?? "";
        if (msg.includes("PROFILE_INCOMPLETE")) {
          setPhase("profile");
          return;
        }
        if (msg.includes("EMAIL_NOT_VERIFIED")) {
          setPhase("unverified");
          return;
        }
        if (msg.includes("PROPERTY_NOT_PUBLISHED")) {
          setError("Esta publicación ya no está disponible para nuevas solicitudes.");
          return;
        }
        if (msg.includes("RATE_LIMITED")) {
          setError("Has enviado demasiadas solicitudes en poco tiempo. Inténtalo más tarde.");
          return;
        }
        setError("No pudimos registrar tu solicitud. Inténtalo nuevamente.");
        return;
      }
      const result = data as { created: boolean; attempt_count: number } | null;
      setDoneInfo({ repeated: result ? !result.created : false });
      setPhase("done");
    } finally {
      setBusy(false);
    }
  }

  async function saveProfileAndRetry() {
    setError(null);
    if (name.trim().length < 3 || !/^\+?[\d\s]{8,15}$/.test(phone.trim())) {
      setError("Ingresa tu nombre completo y un teléfono válido.");
      return;
    }
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("profiles")
        .update({ full_name: name.trim(), phone: phone.trim() })
        .eq("id", user.id);
      setPhase("ready");
      await submit();
    } finally {
      setBusy(false);
    }
  }

  if (phase === "loading") {
    return <div className="mt-4 h-11 animate-pulse rounded-lg bg-slate-100" />;
  }

  if (phase === "anonymous") {
    return (
      <button type="button" className="btn-primary mt-4 w-full py-3 text-base" onClick={goRegister}>
        Me interesa
      </button>
    );
  }

  if (phase === "unverified") {
    return (
      <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Verifica tu correo para enviar la solicitud.</p>
        <p className="mt-1">Te enviamos un enlace a {email}. Al confirmarlo volverás aquí.</p>
        <button
          type="button"
          className="mt-2 font-semibold underline"
          disabled={resent}
          onClick={async () => {
            await supabase.auth.resend({
              type: "signup",
              email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/confirm?return_to=${encodeURIComponent(`/propiedad/${propertyId}`)}`,
              },
            });
            setResent(true);
          }}
        >
          {resent ? "Correo reenviado ✓" : "Reenviar correo"}
        </button>
      </div>
    );
  }

  if (phase === "profile") {
    return (
      <div className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-700">
          Para gestionar tu solicitud necesitamos tu nombre y teléfono:
        </p>
        <input
          className="input"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nombre completo"
        />
        <input
          className="input"
          placeholder="+56 9 1234 5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-label="Teléfono"
        />
        {error && <p className="field-error">{error}</p>}
        <button
          type="button"
          className="btn-primary w-full"
          onClick={saveProfileAndRetry}
          disabled={busy}
        >
          {busy ? "Enviando…" : "Guardar y enviar solicitud"}
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">✓ Solicitud recibida</p>
        <p className="mt-1">
          {doneInfo?.repeated
            ? "Ya tenías una solicitud para este local: registramos tu insistencia sin duplicarla."
            : "El equipo MiLocal te contactará para coordinar los pasos siguientes."}
        </p>
        <p className="mt-1 text-xs">
          Recuerda: esto no es una visita agendada; la coordinación es personalizada.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {existing && (
        <p className="mb-2 rounded-lg bg-sky-50 p-3 text-xs text-sky-800">
          Ya enviaste una solicitud ({LABELS.intent[existing.intent]}
          {existing.attempts > 1 ? `, ${existing.attempts} envíos` : ""}). Puedes reenviarla para
          insistir: no se duplicará.
        </p>
      )}
      <fieldset className="space-y-2">
        <legend className="label">¿Qué te gustaría hacer?</legend>
        {INTEREST_INTENT.map((v) => (
          <label
            key={v}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${
              intent === v ? "border-brand-600 bg-brand-50" : "border-slate-200"
            }`}
          >
            <input
              type="radio"
              name="intent"
              value={v}
              checked={intent === v}
              onChange={() => setIntent(v)}
            />
            {LABELS.intent[v]}
          </label>
        ))}
      </fieldset>
      {error && <p className="field-error mt-2">{error}</p>}
      <button
        type="button"
        className="btn-primary mt-3 w-full py-3 text-base"
        onClick={submit}
        disabled={busy}
      >
        {busy ? "Enviando…" : "Enviar solicitud"}
      </button>
    </div>
  );
}
