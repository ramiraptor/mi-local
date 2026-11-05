"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { safeReturnTo } from "@/lib/return-to";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get("return_to")) ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        // Mensaje genérico: no filtrar existencia de cuentas
        setError("Credenciales inválidas. Revisa tu correo y contraseña.");
        return;
      }
      router.push(returnTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6" noValidate>
      <div>
        <label className="label" htmlFor="login-email">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          className="input"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="login-pass">
          Contraseña
        </label>
        <input
          id="login-pass"
          type="password"
          className="input"
          autoComplete="current-password"
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
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
      <div className="flex items-center justify-between text-sm">
        <Link href="/recuperar" className="text-brand-700 hover:underline">
          Olvidé mi contraseña
        </Link>
        <Link
          href={`/registro?return_to=${encodeURIComponent(returnTo)}`}
          className="font-semibold text-brand-700 hover:underline"
        >
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}
