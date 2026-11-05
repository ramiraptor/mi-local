import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y Condiciones de uso de MiLocal.",
};

export default function TerminosPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <div className="badge-amber mb-4">Versión provisional v0 — en revisión legal</div>
      <h1 className="text-2xl font-bold text-slate-900">Términos y Condiciones</h1>
      <div className="prose-sm mt-6 space-y-4 text-slate-700">
        <p>
          <strong>Documento provisional.</strong> Este texto es una versión preliminar (v0) en
          revisión por la asesoría legal de MiLocal y será reemplazado por la versión definitiva
          aprobada. Resume de buena fe las condiciones de uso del servicio durante el período
          inicial.
        </p>
        <h2 className="section-title">1. El servicio</h2>
        <p>
          MiLocal es una plataforma que permite a propietarios, corredores y representantes
          autorizados publicar inmuebles comerciales de forma gratuita, y a emprendedores explorar
          esas publicaciones y solicitar contacto o visita. MiLocal gestiona las solicitudes de
          forma manual y personalizada: no es parte del contrato de arriendo que pueda celebrarse
          entre las partes.
        </p>
        <h2 className="section-title">2. Cuentas y veracidad</h2>
        <p>
          El servicio está destinado a personas mayores de 18 años. Al registrarte declaras que la
          información entregada es veraz y que estás autorizado para publicar los inmuebles que
          ingreses. La publicación es inmediata y el equipo MiLocal puede revisar y retirar
          publicaciones que incumplan estas condiciones, dejando registro del motivo.
        </p>
        <h2 className="section-title">3. Uso aceptable</h2>
        <p>
          No está permitido publicar información falsa o de terceros sin autorización, incluir
          datos de contacto en los textos públicos para eludir la intermediación, ni usar la
          plataforma con fines distintos a la búsqueda o publicación de inmuebles comerciales.
        </p>
        <h2 className="section-title">4. Intermediación</h2>
        <p>
          Enviar una solicitud de contacto o visita no constituye una visita agendada ni una
          reserva. MiLocal se comunica con las partes y coordina los pasos siguientes por canales
          directos. MiLocal no garantiza resultados comerciales.
        </p>
        <h2 className="section-title">5. Datos personales</h2>
        <p>
          El tratamiento de datos personales se rige por nuestra{" "}
          <a href="/privacidad" className="font-semibold text-brand-700 hover:underline">
            Política de Privacidad
          </a>
          . Nunca entregamos automáticamente tus datos de contacto a otros usuarios.
        </p>
        <h2 className="section-title">6. Contacto</h2>
        <p>
          Ante dudas sobre estos términos escribe a{" "}
          <a href="mailto:contacto@milocal.cl" className="font-semibold text-brand-700 hover:underline">
            contacto@milocal.cl
          </a>
          .
        </p>
      </div>
    </div>
  );
}
