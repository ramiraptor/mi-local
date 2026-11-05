import type { Metadata } from "next";
import { OwnerWizard } from "./OwnerWizard";

export const metadata: Metadata = {
  title: "Publica tu local gratis",
  description:
    "Evaluación guiada para propietarios, corredores y representantes: estructura tu inmueble comercial y publícalo gratis en MiLocal.",
};

export default function AssessmentPropietarioPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-slate-900">Tengo un local</h1>
      <p className="mt-1 text-sm text-slate-600">
        Estructura tu inmueble en 6 pasos y publícalo gratis. Puedes avanzar sin cuenta: tu
        borrador se guarda en este navegador por 7 días. La dirección exacta siempre se mantiene
        privada.
      </p>
      <OwnerWizard />
    </div>
  );
}
