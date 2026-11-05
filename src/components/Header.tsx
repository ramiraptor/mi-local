"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { SignOutButton } from "./SignOutButton";

/**
 * Header con sesión resuelta en el cliente: evita cookies() en el layout y
 * permite que las páginas públicas (landing) se sirvan como ISR desde CDN.
 */
export function Header() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    void supabase.auth.getUser().then(({ data: { user } }) => setSignedIn(Boolean(user)));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <span aria-hidden className="inline-block h-6 w-6 rounded bg-brand-700 text-center text-sm leading-6 text-white">
            M
          </span>
          MiLocal
        </Link>
        <nav className="flex items-center gap-1 text-sm" aria-label="Navegación principal">
          <Link href="/explorar" className="btn-ghost px-3 py-2">
            Explorar locales
          </Link>
          {signedIn ? (
            <>
              <Link href="/mis-locales" className="btn-ghost hidden px-3 py-2 sm:inline-flex">
                Mis locales
              </Link>
              <Link href="/perfil" className="btn-ghost px-3 py-2">
                Mi perfil
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-3 py-2">
                Ingresar
              </Link>
              <Link href="/registro" className="btn-primary px-3 py-2">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
