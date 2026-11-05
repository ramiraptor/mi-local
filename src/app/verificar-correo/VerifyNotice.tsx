"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { safeReturnTo } from "@/lib/return-to";

export function VerifyNotice() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const estado = params.get("estado");
  const returnTo = safeReturnTo(params.get("return_to")) ?? "/";
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function resend() {
    if (!email) return;
    setSending(true);
    try {
      const supabase = createSupabaseBrowser();
      await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?return_to=${encodeURIComponent(returnTo)}`,
        },
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
        ✉️
      </div>
      {estado === "enlace-invalido" ? (
        <>
          <h1 className="mt-4 text-xl font-bold text-slate-900">El enlace no es válido o expiró</h1>
          <p className="mt-2 text-sm text-slate-600">
            Puede que el enlace ya se haya usado o que lo hayas abierto en otro navegador. Inicia
            sesión o solicita un nuevo correo de verificación.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Revisa tu correo</h1>
          <p className="mt-2 text-sm text-slate-600">
            Te enviamos un enlace de verificación{email ? ` a ${email}` : ""}. Al confirmarlo
            volverás exactamente a donde estabas.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Mientras tanto puedes seguir explorando y guardando borradores; publicar o enviar una
            solicitud requiere el correo verificado.
          </p>
        </>
      )}
      {email && (
        <button type="button" className="btn-secondary mt-4" onClick={resend} disabled={sending || sent}>
          {sent ? "Correo reenviado ✓" : sending ? "Enviando…" : "Reenviar correo"}
        </button>
      )}
    </div>
  );
}
