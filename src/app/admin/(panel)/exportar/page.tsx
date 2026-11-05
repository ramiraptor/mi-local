import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Exportaciones CSV",
  robots: { index: false, follow: false },
};

const DATASETS = [
  {
    id: "emprendedores",
    name: "emprendedores.csv",
    desc: "Perfiles de demanda: negocio, presupuesto, comunas, necesidades y preferencias permitidas.",
  },
  {
    id: "propietarios",
    name: "propietarios.csv",
    desc: "Oferentes: tipo, contacto permitido y resumen de inmuebles.",
  },
  {
    id: "inmuebles",
    name: "inmuebles.csv",
    desc: "Inventario: comuna/sector, atributos, renta, estado y vigencia. Sin dirección exacta.",
  },
  {
    id: "intereses",
    name: "intereses.csv",
    desc: "Oportunidades: intención, pipeline, precalificación, snapshot de renta e insistencias. Sin notas privadas.",
  },
] as const;

export default function AdminExportarPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="section-title">Exportaciones CSV</h2>
      <p className="mt-1 text-sm text-slate-500">
        UTF-8 · cabeceras estables v1 · fechas ISO 8601 (UTC) · IDs como texto · protección
        anti-inyección de fórmulas. Cada descarga queda auditada (dataset, filtros y nº de filas).
        Uso exclusivamente interno de MiLocal: prohibido ceder, vender o compartir estos datos.
      </p>
      <ul className="mt-6 space-y-3">
        {DATASETS.map((d) => (
          <li key={d.id} className="card flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold text-slate-900">{d.name}</p>
              <p className="text-sm text-slate-600">{d.desc}</p>
            </div>
            <a href={`/api/admin/export/${d.id}`} className="btn-primary shrink-0" download>
              Descargar
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
