import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="container-page max-w-md py-10">
      <h1 className="text-2xl font-bold text-slate-900">Inicia sesión</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
