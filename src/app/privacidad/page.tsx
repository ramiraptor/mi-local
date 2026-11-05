import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de Privacidad de MiLocal.",
};

export default function PrivacidadPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <div className="badge-amber mb-4">Versión provisional v0 — en revisión legal</div>
      <h1 className="text-2xl font-bold text-slate-900">Política de Privacidad</h1>
      <div className="prose-sm mt-6 space-y-4 text-slate-700">
        <p>
          <strong>Documento provisional.</strong> Esta versión preliminar (v0) está en revisión por
          la asesoría legal de MiLocal, incluyendo la identificación formal del responsable del
          tratamiento, las bases jurídicas por finalidad y los plazos de conservación. Será
          reemplazada por la versión definitiva antes de su cierre legal.
        </p>
        <h2 className="section-title">1. Qué datos tratamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Datos de cuenta: nombre, correo, teléfono y contraseña (gestionada por el proveedor de autenticación).</li>
          <li>Datos de tu búsqueda o negocio: rubro, presupuesto, comunas de interés y necesidades técnicas.</li>
          <li>Datos de tu inmueble: características, renta, fotografías y dirección (la dirección exacta y tus datos de contacto nunca se muestran públicamente).</li>
          <li>Solicitudes de contacto o visita y su gestión interna.</li>
          <li>Eventos de uso del sitio sin identificación personal (medición propia, sin herramientas externas de analítica).</li>
        </ul>
        <h2 className="section-title">2. Para qué los usamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Operar tu cuenta y mostrar tus publicaciones.</li>
          <li>Gestionar manualmente tus solicitudes de contacto o visita: MiLocal recibe la solicitud y jamás entrega tus datos automáticamente al propietario ni a terceros.</li>
          <li>Enviarte oportunidades relacionadas con tu búsqueda, solo si marcaste esa opción (revocable en tu perfil).</li>
          <li>Enviarte comunicaciones de marketing, solo si marcaste esa opción separada (revocable en tu perfil).</li>
          <li>Medir el uso del producto con eventos internos sin datos personales.</li>
        </ul>
        <h2 className="section-title">3. Qué es público y qué es privado</h2>
        <p>
          De un inmueble publicado solo se muestran: comuna, sector referencial, título,
          descripción, renta, superficie, atributos y fotografías procesadas (sin metadatos de
          ubicación), con una ubicación aproximada en el mapa. La dirección exacta, tus datos de
          contacto y toda la gestión comercial interna permanecen privados.
        </p>
        <h2 className="section-title">4. Tus derechos</h2>
        <p>
          Puedes acceder, rectificar y actualizar tus datos desde tu perfil, revocar tus
          preferencias de comunicación y solicitar la eliminación de tu cuenta escribiendo a{" "}
          <a href="mailto:privacidad@milocal.cl" className="font-semibold text-brand-700 hover:underline">
            privacidad@milocal.cl
          </a>
          . Responderemos dentro de los plazos legales aplicables en Chile (Ley 19.628 y Ley
          21.719 según su vigencia).
        </p>
        <h2 className="section-title">5. Proveedores</h2>
        <p>
          Usamos proveedores de infraestructura (base de datos, autenticación, hosting y correo
          transaccional) que procesan datos por encargo nuestro. El detalle de proveedores,
          regiones de alojamiento y transferencias internacionales está en proceso de
          formalización legal.
        </p>
        <h2 className="section-title">6. Seguridad y conservación</h2>
        <p>
          Aplicamos controles de acceso por rol, autenticación reforzada para el personal
          administrativo, auditoría de acciones privilegiadas y respaldo de la información. Los
          plazos definitivos de conservación están en revisión legal; mientras tanto conservamos
          los datos solo para las finalidades descritas.
        </p>
      </div>
    </div>
  );
}
