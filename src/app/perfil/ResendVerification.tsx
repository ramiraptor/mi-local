"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function ResendVerification({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  return (
    <button
      type="button"
      className="font-semibold underline"
      disabled={sent}
      onClick={async () => {
        const supabase = createSupabaseBrowser();
        await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?return_to=%2Fperfil`,
          },
        });
        setSent(true);
      }}
    >
      {sent ? "Correo reenviado ✓" : "Reenviar correo de verificación"}
    </button>
  );
}
