"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function RestablecerPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error: updError } = await supabase.auth.updateUser({ password });
      if (updError) {
        setError("No pudimos actualizar la contraseña. Abre nuevamente el enlace del correo.");
        return;
      }
      router.push("/perfil");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page max-w-md py-10">
      <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="new-pass">
            Contraseña nueva (mínimo 8 caracteres)
          </label>
          <input
            id="new-pass"
            type="password"
            className="input"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
