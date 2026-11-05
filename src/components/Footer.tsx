import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} MiLocal · Región Metropolitana y Viña del Mar</p>
        <nav className="flex flex-wrap gap-4" aria-label="Legal">
          <Link href="/terminos" className="hover:text-brand-700">
            Términos y Condiciones
          </Link>
          <Link href="/privacidad" className="hover:text-brand-700">
            Política de Privacidad
          </Link>
          <a href="mailto:privacidad@milocal.cl" className="hover:text-brand-700">
            Canal de privacidad
          </a>
        </nav>
      </div>
    </footer>
  );
}
