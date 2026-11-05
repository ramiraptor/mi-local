"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/confirm?flow=recovery`,
      });
      // Mensaje idéntico exista o no la cuenta (no filtrar existencia)
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page max-w-md py-10">
      <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
      {done ? (
        <div className="card mt-6 p-6 text-sm text-slate-700">
          Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu
          contraseña.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label" htmlFor="rec-email">
              Correo electrónico
            </label>
            <input
              id="rec-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
    </div>
  );
}
