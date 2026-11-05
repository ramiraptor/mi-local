import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export async function Header() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          {user ? (
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
