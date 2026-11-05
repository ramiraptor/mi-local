"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Mode = "loading" | "enroll" | "challenge";

export function MfaSetup() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.find((f) => f.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setMode("challenge");
        return;
      }
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `milocal-admin-${Date.now()}`,
      });
      if (enrollError || !enrollData) {
        setError("No pudimos iniciar el enrolamiento MFA. Recarga la página.");
        return;
      }
      setFactorId(enrollData.id);
      setQr(enrollData.totp.qr_code);
      setSecret(enrollData.totp.secret);
      setMode("enroll");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify() {
    if (!factorId || code.length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId });
      if (chError || !challenge) {
        setError("No pudimos iniciar el desafío MFA.");
        return;
      }
      const { error: vError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (vError) {
        setError("Código incorrecto o expirado. Inténtalo nuevamente.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return <div className="card mt-6 h-40 animate-pulse" />;
  }

  return (
    <div className="card mt-6 space-y-4 p-6">
      {mode === "enroll" && (
        <>
          <h2 className="font-semibold text-slate-900">1 · Escanea el código QR</h2>
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Código QR para la app autenticadora" className="mx-auto h-44 w-44" />
          )}
          {secret && (
            <p className="text-center text-xs text-slate-500">
              O ingresa manualmente: <code className="rounded bg-slate-100 px-1">{secret}</code>
            </p>
          )}
          <h2 className="font-semibold text-slate-900">2 · Ingresa el código de 6 dígitos</h2>
        </>
      )}
      {mode === "challenge" && (
        <h2 className="font-semibold text-slate-900">
          Ingresa el código de tu app autenticadora
        </h2>
      )}
      <input
        className="input text-center text-2xl tracking-[0.5em]"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        aria-label="Código MFA de 6 dígitos"
        autoComplete="one-time-code"
      />
      {error && <p className="field-error">{error}</p>}
      <button type="button" className="btn-primary w-full" onClick={verify} disabled={busy}>
        {busy ? "Verificando…" : "Verificar e ingresar"}
      </button>
      <p className="text-xs text-slate-500">
        ¿Perdiste tu dispositivo? Sigue el procedimiento institucional de recuperación con otro
        responsable autorizado (docs/runbooks). No existen cuentas invulnerables.
      </p>
    </div>
  );
}
