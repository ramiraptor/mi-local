import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false },
};

export default function RegistroPage() {
  return (
    <div className="container-page max-w-lg py-10">
      <h1 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
      <p className="mt-2 text-sm text-slate-600">
        Un solo paso. Después podrás activar los contextos Emprendedor y Propietario con la misma
        cuenta.
      </p>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
