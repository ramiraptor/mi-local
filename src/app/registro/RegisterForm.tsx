"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { safeReturnTo } from "@/lib/return-to";
import { track } from "@/lib/analytics";

/**
 * Registro en un paso: nombre, correo, teléfono y contraseña.
 * Consentimientos: declaración 18+ y aceptación de T&C/Privacidad (requeridas,
 * con enlaces visibles); marketing y oportunidades proactivas SEPARADAS,
 * opcionales y desmarcadas (revocables desde el perfil).
 * La vinculación de borradores/consentimientos ocurre en /bienvenida tras
 * verificar el correo (ml_pending_setup).
 */
export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get("return_to")) ?? "/";
  const contexto = params.get("contexto"); // emprendedor | propietario | interes

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [asEntrepreneur, setAsEntrepreneur] = useState(
    contexto === "emprendedor" || contexto === "interes" || !contexto,
  );
  const [asOwner, setAsOwner] = useState(contexto === "propietario");
  const [adult, setAdult] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [proactive, setProactive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 3) return setError("Ingresa tu nombre completo.");
    if (!/^\+?[\d\s]{8,15}$/.test(phone.trim()))
      return setError("Ingresa un teléfono válido (ej: +56 9 1234 5678).");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (!adult)
      return setError(
        "Debes declarar que eres mayor de 18 años y aceptar los Términos y la Política de Privacidad.",
      );
    if (!asEntrepreneur && !asOwner)
      return setError("Elige al menos un contexto: buscar un local o publicar uno.");

    setLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      // Setup pendiente que /bienvenida ejecuta tras verificar el correo
      try {
        localStorage.setItem(
          "ml_pending_setup",
          JSON.stringify({
            asEntrepreneur,
            asOwner,
            marketing,
            proactive,
            savedAt: Date.now(),
          }),
        );
      } catch {
        /* sin storage: /bienvenida usa valores por defecto */
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
          emailRedirectTo: `${window.location.origin}/auth/confirm?return_to=${encodeURIComponent(returnTo)}`,
        },
      });

      if (signUpError) {
        setError("No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.");
        return;
      }

      track("registration_completed", { source: contexto ?? "direct" });

      // Si el proyecto no exige confirmación (p. ej. entorno local), hay sesión:
      if (data.session) {
        router.push(`/bienvenida?return_to=${encodeURIComponent(returnTo)}`);
        return;
      }
      router.push(
        `/verificar-correo?email=${encodeURIComponent(email.trim())}&return_to=${encodeURIComponent(returnTo)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6" noValidate>
      <div>
        <label className="label" htmlFor="reg-name">
          Nombre completo
        </label>
        <input
          id="reg-name"
          className="input"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="reg-email">
          Correo electrónico
        </label>
        <input
          id="reg-email"
          type="email"
          className="input"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="reg-phone">
          Teléfono
        </label>
        <input
          id="reg-phone"
          type="tel"
          className="input"
          placeholder="+56 9 1234 5678"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="reg-pass">
          Contraseña (mínimo 8 caracteres)
        </label>
        <input
          id="reg-pass"
          type="password"
          className="input"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">¿Qué quieres hacer?</legend>
        <label className="flex items-start gap-2 py-1 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={asEntrepreneur}
            onChange={(e) => setAsEntrepreneur(e.target.checked)}
          />
          Busco un local para mi negocio (Emprendedor)
        </label>
        <label className="flex items-start gap-2 py-1 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={asOwner}
            onChange={(e) => setAsOwner(e.target.checked)}
          />
          Tengo locales para arrendar (Propietario)
        </label>
      </fieldset>

      <div className="space-y-2 text-sm">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={adult}
            onChange={(e) => setAdult(e.target.checked)}
            required
          />
          <span>
            Declaro ser mayor de 18 años y acepto los{" "}
            <Link href="/terminos" target="_blank" className="font-semibold text-brand-700 hover:underline">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" target="_blank" className="font-semibold text-brand-700 hover:underline">
              Política de Privacidad
            </Link>
            .
          </span>
        </label>
        <label className="flex items-start gap-2 text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={proactive}
            onChange={(e) => setProactive(e.target.checked)}
          />
          <span>
            (Opcional) Autorizo a MiLocal a contactarme proactivamente con oportunidades
            relacionadas con mi búsqueda.
          </span>
        </label>
        <label className="flex items-start gap-2 text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
          <span>(Opcional) Quiero recibir novedades y comunicaciones de marketing de MiLocal.</span>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/login?return_to=${encodeURIComponent(returnTo)}`}
          className="font-semibold text-brand-700 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
