# ADR-0005 · Fotos: bucket privado + URLs firmadas de derivados saneados

**Estado:** Aceptado.

El Anexo permite dos variantes (bucket privado + URLs firmadas, o bucket
público solo con derivados saneados). Se eligió **bucket privado + URLs
firmadas (TTL 1 hora)**:

- El pipeline (`/api/photos`, Node + sharp) valida MIME real y peso (≤8 MB),
  re-encodea a WebP (descarta EXIF/GPS por defecto, aplicando antes la
  orientación), genera thumbnail y sube con `service_role` a un bucket SIN
  acceso público. Los originales nunca se almacenan.
- Las páginas públicas firman URLs al renderizar (server-side). Al
  despublicar/moderar, la ficha desaparece de inmediato de las vistas públicas
  y las firmas vigentes expiran en ≤1 hora → retirada efectiva sin invalidación
  manual de CDN.
- El dueño solo puede reordenar (`position`); paths y metadatos están
  protegidos por trigger para impedir que una fila apunte a objetos ajenos.

Trade-off aceptado: coste de firmar en cada render (mitigado con ISR en la
landing) a cambio de retirada efectiva y cero exposición de originales.
