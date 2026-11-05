# ADR-0003 · Borrador anónimo (7 días) y continuidad de property_id

**Estado:** Aceptado.

## Borrador anónimo

- Los assessments anónimos se guardan SOLO en `localStorage` del navegador
  (`ml_draft_entrepreneur_v1`, `ml_draft_owner_v1`) con caducidad efectiva de
  7 días verificada al leer (se elimina si expiró).
- Ventaja de privacidad: sin cuenta no existe ningún dato personal en el
  servidor (minimización del Anexo §07). La "limpieza" es local y automática.
- Al registrarse, `/bienvenida` vincula el borrador a la cuenta en una sola
  pasada (sin duplicar) y lo elimina del navegador.

## Continuidad del property_id

El PRD 03 exige `property_id` DRAFT estable desde el inicio. Implementación:

- **Usuario autenticado:** el wizard crea la fila `properties` (status DRAFT)
  al avanzar del primer paso y reutiliza ese UUID en todo el ciclo (assessment,
  fotos, publicación, pausa, archivo).
- **Usuario anónimo:** no puede existir fila en BD sin identidad; el borrador
  vive en localStorage y el UUID definitivo se crea en la vinculación de
  `/bienvenida`. Desde ese momento es estable para siempre.

Esta asimetría es deliberada y más conservadora en privacidad (precedencia del
Anexo sobre la literalidad del PRD).
