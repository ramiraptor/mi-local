import type { Metadata } from "next";
import { EntrepreneurWizard } from "./EntrepreneurWizard";

export const metadata: Metadata = {
  title: "Cuéntanos qué local buscas",
  description:
    "Evaluación guiada para emprendedores: estructura tu búsqueda de local comercial y recibe acompañamiento de MiLocal.",
};

export default function AssessmentEmprendedorPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-slate-900">Busco un local</h1>
      <p className="mt-1 text-sm text-slate-600">
        Responde estas preguntas para estructurar tu búsqueda. Puedes avanzar sin cuenta: tu
        borrador se guarda en este navegador por 7 días.
      </p>
      <EntrepreneurWizard />
    </div>
  );
}
