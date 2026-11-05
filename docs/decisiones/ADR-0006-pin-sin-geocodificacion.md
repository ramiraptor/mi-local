# ADR-0006 · Pin aproximado sin geocodificación externa

**Estado:** Aceptado.

**Problema:** el assessment no captura coordenadas y no hay proveedor de
geocodificación aprobado. Sin coordenadas no habría pines en el mapa.

**Opciones:**
1. Geocodificar `address_full` con un servicio externo (p. ej. Nominatim):
   implica transferir la dirección EXACTA (dato privado) a un tercero no
   validado (LEGAL-05 abierto). Descartada por precedencia del Anexo.
2. Centroide de la comuna + jitter determinista por property_id. Sin salida de
   datos privados; precisión a nivel comuna, coherente con el requisito de
   «pin aproximado».

**Decisión:** opción 2 (migración 0006). `publish_property` usa
`coalesce(lat_exact, centroide_comuna)` + jitter. Si en el futuro se aprueba un
geocodificador (contrato/DPA revisado), basta poblar `lat_exact/lng_exact`
antes de publicar; la proyección pública no cambia.
