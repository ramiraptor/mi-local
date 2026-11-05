**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 



###### **<mark>PRODUCT REQUIREMENTS DOCUMENT</mark>** 

# **MiLocal MVP 1** 

### **PRD Maestro · Producto, UX, datos y desarrollo** 

###### **PROPÓSITO DEL MAESTRO** 

Establecer una visión funcional, operativa y técnica común para implementar el MVP1 de MiLocal. Este documento coordina ocho PRD especializados y un Anexo Transversal; no sustituye su detalle ni modifica las decisiones aprobadas. 

Base documental: PRD 01–08 v1.0 + Anexo Transversal de Seguridad, Privacidad y Datos v1.0. Especificación consolidada para founders, producto, 

diseño, desarrollo, QA y operación. 

|**Versión**|**Estado**|**Fecha**|**Responsable**|
|---|---|---|---|
|**1.0**|Especificación funcional consolidada|Octubre 2026|Equipo MiLocal|



Principio rector: validar captación, publicación, exploración e intermediación comercial real con información estructurada; el motor automático de compatibilidad pertenece a una evolución posterior. 

Documento rector · Octubre 2026     |     Página 1 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

00 / GOBIERNO DOCUMENTAL 

## **Cómo utilizar este documento** 

El Maestro define decisiones compartidas, límites de alcance y contratos entre módulos; cada PRD individual especifica pantallas, campos, eventos, integraciones y casos de prueba en mayor profundidad. 

|**Fuente**|**Responsabilidad**|**Jerarquía de uso**|
|---|---|---|
|**PRD Maestro v1.0**|Visión integral, flujos, estados, reglas comunes, roadmap y<br>aceptación E2E.|Entrada inicial para todos los equipos.|
|**PRD 01–08 v1.0**|Especificación detallada de cada módulo: UX, inputs, datos,<br>requisitos y QA.|Fuente específica para implementar cada pilar.|
|**Anexo Transversal v1.0**|Privacidad, seguridad, consentimientos, retención,<br>auditoría, respaldos y gates.|Reglas obligatorias en todos los módulos.|
|**Diccionarios y contratos técnicos**|Nombres exactos de campos, enums, IDs, eventos e<br>interfaces de implementación.|Se versionan y contrastan antes de construir.|



###### **REGLA DE PRECEDENCIA** 

No reinterpretar o ampliar unilateralmente el alcance. Para detalles de un componente, consultar su PRD; para seguridad o privacidad, el Anexo. Si aparece una incompatibilidad genuina entre documentos, documentarla y resolverla con los responsables de producto y tecnología antes de implementar. 

#### **Criterios de consolidación v1.0** 

- Se respetan las decisiones funcionales aprobadas, incluidos los flujos operativos y ejemplos cualitativos. 

- Los ejemplos numéricos de KPI son ilustrativos; no representan resultados reales ni SLA externos. 

- Las elecciones de proveedores, bases legales definitivas y RPO/RTO permanecen abiertas donde el Anexo las identifica. 

- Una estimación de presupuesto, sprint o stack sugerido no constituye compromiso comercial o tecnológico. 

Documento rector · Octubre 2026     |     Página 2 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

01 / FUNDAMENTOS 

## **Visión de producto y validación** 

MiLocal es una plataforma de inteligencia comercial inmobiliaria orientada a facilitar decisiones de ubicación y arriendo de inmuebles comerciales. El MVP1 valida una experiencia guiada y una intermediación humana apoyada por datos estructurados. 

|**Problema**|**Respuesta MVP1**|**Evidencia que queremos producir**|
|---|---|---|
|**Demanda fragmentada**|Assessment del emprendedor con necesidad<br>estructurada y búsqueda editable.|Perfiles, preferencias, presupuesto, zona, atributos y<br>horizonte.|
|**Oferta inmobiliaria**<br>**inconsistente**|Captura guiada para oferentes, fichas comparables y<br>publicación gratuita.|Cantidad/calidad de propiedades PUBLISHED y<br>vigencia confirmada.|
|**Dificultad para conectar a las**<br>**partes**|Exploración pública + solicitud CONTACT/VISIT +<br>gestión interna por MiLocal.|Intereses válidos, candidatos calificados, visitas y<br>negociaciones reales.|
|**Poca visibilidad comercial**|Backoffice, mini-CRM, indicadores y cuatro CSV<br>auditados.|Funnel medible y aprendizaje del piloto con datos<br>portables.|



#### **Metas de validación y señales de éxito** 

|**Meta inicial**|**Definición/alcance**|**Precisión**|
|---|---|---|
|**200 emprendedores**|Referencia de captación del piloto/CORFO; dashboard con objetivo<br>configurable.|No significa 200 candidatos<br>automáticamente calificados.|
|**50 propietarios**|Referencia de captación del piloto/CORFO; objetivo configurable.|No equivale necesariamente a 50<br>propiedades publicadas.|
|**Tracción efectiva**|Perfiles completos, propiedades publicadas, solicitudes válidas y resultado<br>comercial.|No confundir visitas a la web con<br>oportunidades reales.|



###### **NORTH STAR** 

Construir una base verificable de emprendedores, oferentes, inmuebles e intereses reales, junto con un proceso operativo que MiLocal pueda gestionar sin depender de SQL ni de un equipo técnico para las tareas habituales. 

Documento rector · Octubre 2026     |     Página 3 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

02 / LÍMITES DE PRODUCTO 

## **Alcance y exclusiones del MVP1** 

|**Incluido en MVP1**|**Excluido de MVP1**|
|---|---|
|**Landing con dos recorridos, conversión y SEO básico.**|Cálculo automático de match, scoring o ranking de compatibilidad.|
|**Assessments guiados; borradores anónimos y perfiles editables.**|KYC documental integrado o verificación financiera automatizada.|
|**Una cuenta con contextos Emprendedor y Propietario.**|Conversaciones directas usuario–propietario o chat interno.|
|**Publicación gratuita y automática; moderación posterior.**|Reserva/agenda automática de visitas y contratos digitales.|
|**Exploración pública, filtros y mapa básico aproximado.**|GIS comercial avanzado, clustering y capas analíticas.|
|**Solicitud única CONTACT/VISIT y mediación manual.**|Marketing automation complejo y CRM empresarial.|
|**ADMIN, mini-CRM, precalificación manual, KPIs y CSV.**|BI avanzado y comercialización/divulgación de bases a terceros.|



#### **Criterios de inversión y complejidad** 

- La plataforma permite validar valor comercial antes de implementar el motor propietario de compatibilidad. 

- No agregar integraciones de datos, score crediticio, verificación documental ni módulos de pagos/arriendo que no estén definidos. 

- Documentar como roadmap futuro lo que requiere proveedores, información regulatoria o automatización adicional. 

- Capturar datos que permitan evolucionar, pero sin mostrar porcentajes ficticios de compatibilidad en MVP1. 

Documento rector · Octubre 2026     |     Página 4 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

03 / ACTORES 

## **Roles, acceso y modelo de experiencia** 

|**Actor**|**Capacidad MVP1**|**Restricción central**|
|---|---|---|
|**Visitante**|Ver landing, comenzar assessment anónimo, buscar y abrir<br>propiedades publicadas.|No puede publicar ni crear un Interest válido<br>sin cuenta/correo verificado.|
|**Emprendedor**|Completar/editar assessment y búsqueda, explorar, enviar<br>CONTACT/VISIT.|No accede a datos del propietario ni a<br>intereses de terceros.|
|**Propietario / corredor /**<br>**representante**|Completar assessment, gestionar varios inmuebles,<br>publicar/pausar fichas propias.|No lee PII del interesado automáticamente ni<br>revierte moderación ADMIN.|
|**ADMIN MiLocal**|Operar usuarios, inventario, intereses, preclasificación<br>manual, métricas y CSV.|MFA obligatorio, permisos backend y<br>auditoría.|
|**Personal técnico autorizado**|Operar hosting, despliegues, recuperación y base de datos<br>por procedimientos restringidos.|No obtiene rol ADMIN automáticamente;<br>cuentas nominales, MFA, mínimo privilegio.|



#### **Dos perfiles bajo una identidad** 

Una misma cuenta puede activar los contextos Emprendedor y Propietario. El rol de administración se provisiona únicamente mediante un procedimiento interno; nunca se obtiene mediante registro público ni mediante edición de perfil. La verificación de correo es un control de determinadas acciones, no un sustituto del MFA privilegiado. 

Documento rector · Octubre 2026     |     Página 5 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

04 / INTEGRACIÓN MODULAR 

## **Arquitectura funcional y dependencias** 

###### **RECORRIDO DE VALOR** 

Landing → Assessment (según necesidad) → Registro/roles → Perfil → Publicación y/o exploración → Solicitud CONTACT/VISIT → Gestión ADMIN → Resultado comercial. La navegación puede incorporar rutas alternativas; por ejemplo, «Me interesa» permite registro exprés sin assessment completo. 

|**Pilar**|**Entrada/salida principal**|**Depende de**|
|---|---|---|
|**01 Landing**|CTA por rol, inicio assessment, acceso explorar; eventos de funnel.|02 / 03 / 04 / 07|
|**02 Assessment**<br>**emprendedor**|Borrador de demanda → búsqueda activa de un perfil.|04 / 05 / catálogos comunes|
|**03 Assessment propietario**|Borrador de inmueble/relación del oferente → property_id.|04 / 06 / catálogos comunes|
|**04 Registro y roles**|Cuenta, correo verificado, contexto y retorno a intención.|02 / 03 / 05 / 06 / 07|
|**05 Perfiles editables**|Datos canónicos, una búsqueda activa, preferencias y «Mis<br>locales».|02 / 03 / 04 / 06|
|**06 Publicación gratuita**|DRAFT → PUBLISHED; inventario y notificación ADMIN.|03 / 04 / 05 / 07 / 08|
|**07 Explorar locales**|Fichas públicas, filtros, mapa, Interest único.|02 / 04 / 05 / 06 / 08|
|**08 Administración**|Mini-CRM, revisión posterior, precalificación, KPI y CSV.|Todos + Anexo|



##### **Principio de contratos** 

No duplicar la fuente de verdad de identidad, assessment o propiedad en pantallas distintas. Utilizar IDs estables, enums documentados, permisos por recurso y un diccionario versionado compartido. 

Documento rector · Octubre 2026     |     Página 6 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

05 / EXPERIENCIA 

## **Principios de UX y geografía** 

- Referencia de experiencia: claridad, acompañamiento y fluidez al estilo de Houm, sin copiar diseños ni perder identidad MiLocal. 

- Diseñar mobile-first con pregunta principal o grupo relacionado por paso, ayudas contextuales, validación amigable y progreso recuperable. 

- La Landing deja visibles ambos recorridos; el explorador y las fichas públicas permiten conocer la propuesta antes de registrarse. 

- Cobertura inicial: comunas de la Región Metropolitana y Viña del Mar (Región de Valparaíso). Catálogo Región → Comuna; sector contextual, no catálogo rígido. 

- Máximo tres comunas de preferencia por búsqueda activa; en móvil, alternancia lista/mapa básica. 

- La dirección completa no aparece en fichas, tarjetas, mapas, analytics ni rutas públicas. 

|**Patrón UX**|**Regla de consistencia**|**PRD**|
|---|---|---|
|**Borrador anónimo**|Persistencia temporal local 7 días; vinculación segura al crear cuenta.|01/02/03/04|
|**Return-to-intent**|Después de cuenta/verificación, retornar a ficha y acción original.|04/07|
|**Indicador de completitud**|Pendiente / Por completar / Completado; sin ponderaciones de perfil.|05|
|**Progreso de publicación**|DRAFT canónico; etiquetas como «Borrador incompleto» son derivadas.|03/05/06|
|**Comunicación honesta**|«Solicitud recibida» no es «visita agendada».|07/08|



Documento rector · Octubre 2026     |     Página 7 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

06 / PILAR 01 

## **PRD 01 — Landing** 

La Landing convierte tráfico en assessments, registro o exploración de inmuebles, comunicando de forma clara los dos públicos de MiLocal. 

|**Bloque/acción**|**Comportamiento aprobado**|**Prueba crítica**|
|---|---|---|
|**Hero + CTA**|Dos opciones: «Busco un local» y «Tengo un local». Inicio claro,<br>mobile-first.|En móvil y escritorio ambos caminos<br>visibles.|
|**Selector de rol**|«Comenzar» conduce a seleccionar el contexto; mantiene<br>continuidad.|La selección apunta al flujo correcto.|
|**Inventario destacado**|Hasta seis inmuebles PUBLISHED; ficha pública sin login.|No renderiza DRAFT o UNPUBLISHED.|
|**Tráfico y SEO**|Metadatos, social preview, páginas indexables permitidas.|No indexar contenido privado ni fichas<br>retiradas.|
|**Captura analítica**|Distinguir visita, CTA, assessment iniciado/completado, registro e<br>interés válido.|No confundir clic con lead ni enviar PII.|



###### **SALIDA DEL PILAR** 

El visitante entiende la propuesta y avanza al recorrido adecuado; la medición de conversión distingue navegación, captura y transacción comercial real. 

Documento rector · Octubre 2026     |     Página 8 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

07 / PILAR 02 

## **PRD 02 — Assessment Emprendedor** 

Capturar una única necesidad comercial activa y editable mediante siete bloques estructurados, sin exigir autenticación antes de demostrar valor. 

|**Bloque estructurado**|**Información esencial**|
|---|---|
|**Negocio**|Rubro, subrubro, etapa, nombre comercial según corresponda y si es el primer local.|
|**Ubicación**|Región → 1 a 3 comunas, sector opcional, flexibilidad territorial.|
|**Presupuesto**|max_monthly_rent_clp exacto en CLP + budget_flexibility independiente.|
|**Tipo y superficie**|Local comercial / Oficina / Bodega-Galpón / Otro; rangos m².|
|**Necesidades técnicas**|Siete atributos compartidos, respuesta Sí/No/Indiferente.|
|**Horizonte**|Ventana de búsqueda/instalación; estado de necesidad para gestión manual.|
|**Contacto proactivo**|Autorización voluntaria, no premarcada, separada de marketing y revocable.|



#### **Reglas y excepciones** 

- Los siete bloques no obligan a siete pantallas; UX puede organizar condicionales sin perder datos estructurados. 

- Borrador anónimo temporal de siete días; tras registro se vincula sin duplicación. 

- Estados assessment: NOT_STARTED, IN_PROGRESS, COMPLETED; registro y correo verificado son procesos diferentes. 

- Presupuesto insuficiente no descalifica automáticamente si existe flexibilidad declarada; cualquier pertinencia se evalúa manualmente por Interest. 

- Un usuario que comienza desde «Me interesa» puede enviar una solicitud válida sin completar este assessment. 

Documento rector · Octubre 2026     |     Página 9 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

08 / PILAR 03 

## **PRD 03 — Assessment Propietario** 

El oferente estructura un inmueble mediante seis bloques y continúa hacia su publicación conservando un único identificador de propiedad. 

|**Dimensión**|**Datos esenciales**|**Precisión operativa**|
|---|---|---|
|**Oferente**|owner_type: Propietario / Corredor / Representante<br>autorizado; owner_relationship por inmueble.|Una identidad puede administrar varios inmuebles.|
|**Inmueble**|Tipo, superficie, condición física, baños/estacionamiento,<br>ubicación.|Tipo común con PRD 02/06.|
|**Ubicación**|Región/comuna, sector, address_full privado, punto<br>público aproximado.|S/N admitido; no mostrar dirección exacta.|
|**Comercial**|monthly_rent_clp, rent_is_negotiable, gastos comunes,<br>garantía opcional.|No mezclar renta con presupuesto del emprendedor.|
|**Disponibilidad**|Ventana, fecha exacta opcional, restricciones de uso<br>declaradas.|No certificar patentes ni normativa a partir de respuestas.|
|**Atributos**|Siete atributos físicos, triestado Sí/No/No sé.|No informado no equivale a «No».|



###### **CONTINUIDAD** 

Crear property_id en DRAFT y reutilizarlo durante assessment, registro, fotos, publicación, actualización y despublicación. Los borradores incompletos no son un nuevo estado de publicación. 

Documento rector · Octubre 2026     |     Página 10 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

09 / CONTRATO DE DEMANDA/OFERTA 

## **Catálogo compartido de inmuebles y atributos** 

|**Necesidad emprendedor**|**Atributo inmueble**|**Semántica**|
|---|---|---|
|**gas_extraction**|has_gas_extraction|Salida de gases.|
|**three_phase_power**|has_three_phase_power|Electricidad trifásica.|
|**accessibility_required**|has_accessibility|Accesibilidad universal.|
|**parking_required**|parking_spaces|Requiere estacionamiento; la oferta declara cantidad.|
|**storage_required**|has_storage|Bodega.|
|**terrace_required**|has_terrace_or_patio|Terraza/patio.|
|**gastronomic_fit_required**|has_food_service_fitout|Acondicionamiento gastronómico declarado; no<br>certificación legal.|



#### **Matriz de interpretación** 

|**Dato**|**Valores**|**Qué NO significa**|
|---|---|---|
|**Demanda**|Sí / No / Indiferente.|No permite descartar automáticamente a la persona ni ejecutar<br>matching en MVP1.|
|**Oferta**|Sí / No / No sé; estacionamientos<br>numéricos.|No sé ≠ No; blanco ≠ No; atributo declarado ≠ certificado.|
|**Tipo inmueble**|Local comercial / Oficina / Bodega-Galpón /<br>Otro.|Stand/Kiosco no es tipo independiente del MVP1.|
|**Renta y presupuesto**|monthly_rent_clp vs<br>max_monthly_rent_clp.|No son equivalentes; gastos comunes van aparte.|



Documento rector · Octubre 2026     |     Página 11 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

10 / PILAR 04 

## **PRD 04 — Registro y Roles** 

Registro contextual de una única cuenta, doble contexto de perfil y retorno seguro al flujo que originó la autenticación. 

|**Momento**|**Regla aprobada**|**Caso a probar**|
|---|---|---|
|**Registro**|Nombre, correo, contraseña y teléfono en un paso; reutilizar datos ya<br>capturados.|No pedir información redundante.|
|**Verificación**|Correo no verificado puede navegar/guardar borrador; no publica ni<br>envía Interest válido.|Aviso y reenvío; retorno al contexto.|
|**Interés exprés**|Desde «Me interesa» registrar y retomar ficha/propiedad.|Assessment emprendedor no obligatorio.|
|**Doble perfil**|Cuenta única con Emprendedor + Propietario; activación contextual.|No duplica user_id ni contactos.|
|**Privilegios**|ADMIN otorgado solo por circuito interno, acceso backend/RLS, MFA<br>obligatorio.|Acceso /admin y APIs denegado a usuarios<br>normales.|
|**Cuenta/privacidad**|Recuperación, sesión, opciones independientes de consentimiento y<br>eliminación solicitada.|No filtrar existencia de usuarios ni PII.|



#### **Continuidad y protección** 

- Autorización en servidor y capa de datos para cada acceso/edición por owner_user_id, no únicamente ocultar botones. 

- Control de return_to para retornar a la acción segura y solicitada sin redirecciones arbitrarias. 

- No exigir OTP telefónico ni KYC documental obligatorio al usuario normal en MVP1. 

Documento rector · Octubre 2026     |     Página 12 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

11 / PILAR 05 

## **PRD 05 — Perfiles Editables** 

Mi Perfil centraliza datos canónicos y la capacidad del usuario de mantener su búsqueda o inmuebles sin modificar silenciosamente información de terceros. 

|**Contexto**|**Vista/acción principal**|**Límites**|
|---|---|---|
|**Emprendedor**|Datos de negocio, presupuesto, comunas, necesidades y una<br>búsqueda activa editable.|No se crean múltiples búsquedas activas<br>paralelas.|
|**Propietario**|Identidad del oferente, resumen de hasta tres inmuebles y enlace a<br>«Mis locales».|No reemplaza PRD 06 para edición integral<br>de oferta.|
|**Cuenta**|Correo verificado/pendiente, preferencias de comunicación y cambio<br>de contexto.|Proactividad ≠ marketing ≠ mensajes<br>operativos.|
|**Compleción**|Pendiente / Por completar / Completado por rol, con nudges y<br>persistencia.|No equiparar con assessment ni<br>precalificación.|
|**Rectificación**|Autoservicio, avisos al salir sin guardar y solicitud de eliminación.|No borrar historia comercial sin política<br>aplicable.|



##### **Cuatro conceptos que siempre deben mantenerse separados** 

|**Dimensión**|**Ejemplo de valor**|**Qué responde**|
|---|---|---|
|**Assessment**|COMPLETED|¿Respondió la captura guiada?|
|**Perfil**|Completado|¿Su información requerida está completa?|
|**Estado comercial**|CONTACTED|¿En qué etapa está este Interest concreto?|
|**Precalificación**|Por validar|¿Cuál es la evaluación manual de esa oportunidad?|



Documento rector · Octubre 2026     |     Página 13 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

12 / PILAR 06 

## **PRD 06 — Publicación Gratuita** 

Ofrecer uno o varios inmuebles gratis con inventario confiable, salida a público sin espera de aprobación previa y moderación administrativa posterior. 

|**Fase**|**Regla funcional**|**Condición/ejemplo**|
|---|---|---|
|**DRAFT**|El property_id existe y conserva los datos del oferente y de<br>la ficha.|«Borrador incompleto» solo etiqueta visual.|
|**Validación**|Correo verificado; campos, foto, tipo de archivo, permisos<br>e integridad.|1–12 fotos; preferencia UX 6–8; primera como portada.|
|**PUBLISHED**|Al cumplirse las validaciones se publica inmediatamente.|No requiere aprobación del equipo ADMIN.|
|**Notificación**|Se genera aviso «Nueva propiedad publicada» y bandera<br>interna de revisión posterior.|El aviso no bloquea el estado PUBLISHED.|
|**Moderación**|ADMIN revisa y puede despublicar motivadamente.|Propietario no puede revertir retirada ADMIN por su<br>cuenta.|
|**Pausa/archivo**|Oferente despublica; se conserva historial de intereses<br>sujeto a política.|«Ya se arrendó» no significa WON MiLocal.|
|**Vigencia**|Confirmación real y recordatorio interno ~30 días.|Sin despublicación por inactividad o login.|



#### **Privacidad de fotografías y datos** 

Fotografías optimizadas, ordenables y saneadas de EXIF/GPS; validación de MIME/tamaño; URLs de imágenes bajo controles adecuados. address_full, coordenadas precisas y contactos privados nunca se envían a endpoints públicos. La moderación manual posterior reconoce que un archivo válido puede mostrar información sensible o imágenes no pertinentes. 

Documento rector · Octubre 2026     |     Página 14 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

13 / PILAR 07 

## **PRD 07 — Explorar Locales** 

Descubrimiento público de fichas reales y generación de solicitudes comerciales para mediación humana por MiLocal. 

|**Componente**|**Regla MVP1**|**No hacer**|
|---|---|---|
|**Inventario**|Solo propiedades PUBLISHED; lazy loading / paginación progresiva.|Mostrar borradores o pausadas.|
|**Filtros**|Región/comunas (máx. tres), tipo, renta, superficie; gastos comunes<br>aparte.|Simular ranking algorítmico de match.|
|**Mapa**|Mapa básico, pines aproximados, sincronizado con filtros/listado.|Revelar dirección exacta ni geolocalización<br>precisa.|
|**Tarjetas y fichas**|Fotos, tipo, sector y renta, atributos técnicos declarados.|Entregar contacto privado del oferente.|
|**Aplicar mi búsqueda**|Usar voluntariamente los filtros guardados del usuario.|Mostrar porcentajes de compatibilidad.|
|**Me interesa**|Registro exprés, correo verificado, intención CONTACT/VISIT.|Crear lead por cada clic o prometer visita.|
|**Interés único**|Un Interest por (user_id, property_id), guardar insistencias y<br>snapshot de renta.|Reiniciar gestión por repetición.|
|**Despublicada**|Bloquear intereses nuevos, conservar el historial ya válido.|Borrar trazas o generar nuevos leads.|



#### **Significado de CONTACT y VISIT** 

CONTACT expresa deseo de conversación; VISIT expresa deseo de coordinar una visita. Ninguna intención representa cita agendada. La coordinación y seguimiento ocurren manualmente desde MiLocal y se reflejan en PRD 08. 

Documento rector · Octubre 2026     |     Página 15 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

14 / PILAR 08 

## **PRD 08 — Administración Simple** 

El backoffice es la capa mínima de operación y aprendizaje del MVP1: listas filtrables, moderación, mini-CRM, indicadores y exportación sin software empresarial adicional. 

|**Módulo**|**Funciones aprobadas**|**Protección/condición**|
|---|---|---|
|**Resumen**|Metas configurables, tarjetas de oferta, demanda, leads y embudo<br>comercial.|Definiciones de KPI versionadas.|
|**Usuarios**|Consultar ambos perfiles, assessments, contacto interno, correo<br>verificado y fechas.|No editar silenciosamente respuestas.|
|**Propiedades**|Listar/moderar fichas, revisar publicaciones nuevas y vigencia<br>confirmada.|ADMIN puede despublicar con motivo y log.|
|**Intereses**|Bandeja asignable; CONTACT/VISIT, estado comercial, precalificación y<br>notas.|Un Interest canónico por usuario/inmueble.|
|**Exportaciones**|Cuatro CSV normalizados con IDs estables y campos permitidos.|Acceso restringido y descarga auditada.|



#### **Mediación humana y precalificación** 

MiLocal recibe todas las solicitudes, asigna responsable, contacta al emprendedor, valida pertinencia y, si corresponde, solicita antecedentes por un canal corporativo seguro fuera de la plataforma. Puede presentar candidatos al oferente manualmente. No hay chat, agenda, carga KYC ni distribución automática de PII. 

###### **META OPERATIVA NO PÚBLICA** 

Primer contacto deseable dentro de dos días hábiles, registrado como objetivo interno (SHOULD), sin prometerlo como SLA de cara al cliente. 

Documento rector · Octubre 2026     |     Página 16 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

15 / MÁQUINAS DE ESTADO 

## **Estados canónicos y reglas de negocio** 

|**Dominio**|**Estados canónicos**|**Independencia**|
|---|---|---|
|**Assessment**|NOT_STARTED → IN_PROGRESS → COMPLETED.|No contiene CONVERTED como estado<br>funcional.|
|**Perfil**|Pendiente / Por completar / Completado.|No implica evaluación documental ni<br>calificación comercial.|
|**Inmueble**|DRAFT / PUBLISHED / UNPUBLISHED / ARCHIVED.|Banderas de moderación no crean<br>estado público.|
|**Intención de interés**|CONTACT / VISIT.|No constituye pipeline ni visita<br>confirmada.|
|**Pipeline comercial**|NEW / CONTACTED / VISIT_SCHEDULED / VISIT_COMPLETED /<br>IN_NEGOTIATION / WON / LOST.|Estado por Interest; cierres auditable.|
|**Precalificación**|Sin revisar / No pertinente / Por validar / Calificado.|Evaluación manual por oportunidad,<br>no score global.|



#### **Reglas transversales de transición** 

- El estado inicial de un Interest válido es NEW; el responsable puede asignarse después sin ocultar la oportunidad de la bandeja. 

- Un propietario que reporta «Ya se arrendó» provoca retiro de la ficha, NO un WON comercial por sí solo. 

- WON requiere operación concretada y confirmada con participación efectiva de MiLocal; registrar evidencia/contexto mínimo. 

- LOST se cierra con motivo; las correcciones y reaperturas mantienen historial auditable. 

- Si una ficha pasa a UNPUBLISHED/ARCHIVED, se detiene la captación de nuevos intereses; el historial existente permanece sujeto a privacidad y retención. 

Documento rector · Octubre 2026     |     Página 17 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

16 / FLUJOS OPERATIVOS 

## **Dos recorridos comerciales end-to-end** 

**Flujo A — Propietario publica un inmueble** 

|**Paso**|**Actor**|**Resultado verificable**|
|---|---|---|
|**1. Captura**|Oferente|Assessment de seis bloques y property_id DRAFT.|
|**2. Cuenta**|Oferente|Registro con contexto Propietario; correo verificado antes de publicar.|
|**3. Ficha**|Oferente|Datos técnicos/comerciales y 1–12 fotografías validadas.|
|**4. Publicación**|Sistema|Transición automática a PUBLISHED; visible en buscador y mapa aproximado.|
|**5. Revisión**|ADMIN|Notificación interna; marca revisada o modera con motivo.|
|**6. Vigencia**|MiLocal / oferente|Confirmaciones reales; seguimiento manual ~30 días.|



#### **Flujo B — Emprendedor manifiesta interés** 

|**Paso**|**Actor**|**Resultado verificable**|
|---|---|---|
|**1. Descubre**|Visitante|Explora y abre ficha PUBLISHED sin autenticación.|
|**2. CTA**|Visitante|Clic «Me interesa»; NO es lead válido aún.|
|**3. Identidad**|Emprendedor|Registro exprés / sesión, correo verificado, retorno al inmueble.|
|**4. Intención**|Emprendedor|Envía CONTACT o VISIT; crea Interest único y snapshot de renta.|
|**5. Operación**|MiLocal|Asignación, CONTACTED, revisión y precalificación manual.|
|**6. Resultado**|MiLocal|Visita coordinada/realizada, negociación y WON/LOST reales.|



Documento rector · Octubre 2026     |     Página 18 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

17 / DATOS COMPARTIDOS 

## **Modelo lógico y diccionario mínimo** 

|**Entidad canónica**|**ID / atributos representativos**|**Fuente principal**|
|---|---|---|
|**User / Auth**|user_id; auth_user_id; email_verified_at; datos de contacto con visibilidad<br>restringida.|PRD 04|
|**EntrepreneurProfile / Search**|user_id; negocio, preferred_communes; max_monthly_rent_clp;<br>budget_flexibility; necesidades.|PRD 02 / 05|
|**OwnerProfile**|user_id; owner_type; contact_preference; datos del oferente.|PRD 03 / 05|
|**Property**|property_id; owner_user_id; property_type; commune_id; address_full privado;<br>monthly_rent_clp; status.|PRD 03 / 06|
|**PropertyPhoto / Review**|property_id; orden, portada, media segura; moderación posterior; timestamps.|PRD 06 / 08|
|**Interest**|interest_id; user_id; property_id; intent; commercial_status;<br>qualification_status; responsible.|PRD 07 / 08|
|**InterestHistory**|intentos, timestamps, status history, notas internas autorizadas y snapshot<br>renta inicial.|PRD 07 / 08|
|**Consent / Audit**|finalidad, versionado, opt-in/revocación, actor, acción, fecha y alcance.|PRD 04 / Anexo|



###### **NORMALIZACIÓN DE CONTRATOS** 

En este Maestro se usa rent_snapshot_clp para la renta preservada al primer Interest, monthly_rent_clp para renta vigente y max_monthly_rent_clp para presupuesto del emprendedor. Los PRD de detalle pueden usar nombres descriptivos o alias en algunas tablas: el esquema/API definitivo deberá fijar una única nomenclatura antes de implementar. 

Documento rector · Octubre 2026     |     Página 19 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

18 / REGLAS DE DATOS 

## **Diccionario de intereses, integridad e historial** 

|**Campo/regla**|**Semántica**|**Aceptación mínima**|
|---|---|---|
|**unique(user_id, property_id)**|Un Interest canónico por par usuario-inmueble.|Repetir CTA/submit no crea segunda oportunidad.|
|**intent**|CONTACT o VISIT seleccionado por el usuario.|VISIT no cuenta como VISIT_SCHEDULED.|
|**commercial_status**|Avance NEW…WON/LOST registrado por ADMIN.|Historial, actor y fecha en transiciones.|
|**qualification_status**|Sin revisar / No pertinente / Por validar / Calificado.|Manual, individual por Interest.|
|**interest_attempt_count**|Intentos repetidos sobre el mismo par.|Conservar contador y última fecha.|
|**rent_snapshot_clp**|Renta mensual CLP al primer interés válido.|No sobrescribir cuando cambia<br>property.monthly_rent_clp.|
|**availability_last_confirmed_at**|Última confirmación EXPLÍCITA de vigencia del<br>inmueble.|Login/edición sin confirmar no renueva fecha.|
|**source / timestamps**|Origen, created_at, updated_at y eventos<br>relevantes.|Fechas ISO y zona horaria definida.|
|**assigned_admin_user_id**|Responsable actual de gestión comercial.|Bandeja admite NEW no asignados.|
|**InterestNote / StatusHistory**|Notas internas fechadas y transiciones append-<br>only.|No borrar historia al cerrar/reabrir.|



#### **Excepciones de carrera y consistencia** 

- Verificar en backend que la propiedad siga PUBLISHED en el momento de registrar Interest. 

- Asegurar idempotencia ante doble clic, refresh y envíos concurrentes. 

- Actualizar interés e insistencias sin alterar la fecha del primer interés ni reabrir automáticamente un LOST/WON. 

- Al moderar un inmueble, invalidar su exposición pública y cache correspondiente; conservar relaciones históricas autorizadas. 

Documento rector · Octubre 2026     |     Página 20 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

19 / GESTIÓN COMERCIAL 

## **Mini-CRM: estados y precalificación** 

|**Etapa comercial**|**Definición operativa**|**No confundir con**|
|---|---|---|
|**NEW**|Interés enviado y aceptado; pendiente de gestión.|Clic o visita web.|
|**CONTACTED**|MiLocal contactó efectivamente al emprendedor.|Correo automático de recepción.|
|**VISIT_SCHEDULED**|Visita coordinada efectivamente por medios externos.|Intención VISIT.|
|**VISIT_COMPLETED**|Visita realizada y verificada.|Visita coordinada.|
|**IN_NEGOTIATION**|Negociación comercial real en proceso.|Solo interés/precalificación.|
|**WON**|Arriendo confirmado y concretado con intermediación<br>MiLocal.|Propiedad arrendada por terceros.|
|**LOST**|Oportunidad cerrada sin concretar, con motivo.|Borrado físico de información.|



#### **Precalificación independiente** 

|**Estado**|**Cuándo usarlo**|**Ejemplo**|
|---|---|---|
|**Sin revisar**|Aún no existe evaluación comercial de esa relación.|Interest recién creado.|
|**No pertinente**|Incompatibilidad real para ese inmueble bajo las condiciones<br>actuales.|Actividad declarada incompatible con restricción<br>confirmada.|
|**Por validar**|Hay potencial, pero faltan antecedentes o confirmaciones.|Presupuesto $1.100.000 y renta negociable<br>$1.200.000.|
|**Calificado**|MiLocal revisó antecedentes pertinentes y estima que puede<br>avanzar.|Negocio y condiciones adecuadas para esa ficha.|



Documento rector · Octubre 2026     |     Página 21 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

20 / MEDICIÓN DE PRODUCTO 

## **Métricas y embudo de conversión** 

|**Indicador**|**Definición / fuente**|**Evitar error**|
|---|---|---|
|**Vistas de ficha**|Eventos válidos de apertura de detalle de propiedad.|No equivale a usuario interesado.|
|**Clic «Me interesa»**|Eventos CTA de exploración.|No contar como Interest válido.|
|**Solicitudes válidas**|Interest creado con cuenta y correo verificado.|No duplicar por clicks repetidos.|
|**Contactados**|Oportunidades con CONTACTED real.|No usar correo automático como contacto.|
|**Calificados**|qualification_status=Calificado por oportunidad.|No etiquetar permanentemente usuario.|
|**Visitas coordinadas**|Transición confirmada VISIT_SCHEDULED.|No confundir intent VISIT.|
|**Visitas realizadas**|VISIT_COMPLETED efectivamente verificada.|No sumar simples coordinaciones.|
|**Negociaciones**|IN_NEGOTIATION registradas.|No inferir por precalificación.|
|**Cierres MiLocal**|WON confirmado, intermediación real.|No sumar arriendos externos.|



#### **Ejemplo de un mes — cifras exclusivamente ilustrativas** 

|**Inventario**|**Tráfico/interés**|**Operación y resultados**|
|---|---|---|
|**100 propiedades publicadas**|4.000 vistas · 350 clics · 180 intereses válidos|120 contactados · 70 calificados|
|**Metas configurables: 200**<br>**emprendedores / 50 propietarios**|La tasa vista→interés usa intereses válidos / vistas<br>con definiciones fijas.|35 visitas coordinadas · 25 realizadas · 12<br>negociaciones · 3 WON|



Definir para cada KPI: nombre, fuente, periodo, zona horaria, filtros, numerador, denominador, exclusiones y unidad. Las tarjetas y tablas simples son suficientes para MVP1; la capa de datos debe permitir análisis futuro, sin BI avanzado. 

Documento rector · Octubre 2026     |     Página 22 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

###### 21 / REPORTERÍA E INTELIGENCIA FUTURA 

## **Cuatro exportaciones y portabilidad** 

|**Archivo CSV**|**Campos/cobertura**|**Control**|
|---|---|---|
|**emprendedores.csv**|user_id, perfil, rubro, etapa, presupuesto, comunas, superficies, requisitos,<br>preferencias/fechas permitidas.|Sin documentos, claves ni<br>notas sensibles.|
|**propietarios.csv**|user_id, owner_type, perfil, cantidad de inmuebles, estados, fechas y contacto<br>permitido.|Acceso ADMIN autorizado.|
|**inmuebles.csv**|property_id, owner_user_id, comuna/sector permitido, atributos, renta, estado,<br>revisiones y vigencia.|Dirección exacta no<br>exportada por defecto.|
|**intereses.csv**|interest_id, user_id, property_id, intención, comercial/precalificación,<br>insistencias, rentas, responsables y fechas.|No exportar notas privadas<br>por defecto.|



#### **Calidad técnica del archivo** 

- UTF-8; encabezados estables/versionados; IDs como texto y relaciones entre datasets explícitas. 

- Fechas ISO 8601, montos CLP numéricos y superficie m² sin textos incrustados; distinguir NULL de No y de $0. 

- Datos multivalor serializados mediante convención y escapado documentados; protección contra CSV formula injection. 

- Auditar actor, dataset, fecha/hora, filtros y volumen; no almacenar el CSV completo en el log. 

- La inteligencia comercial es solo para análisis interno de MiLocal; no divulgar, vender o comercializar datasets sin revisión jurídica y decisión posterior. 

Documento rector · Octubre 2026     |     Página 23 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

22 / ANEXO OBLIGATORIO 

## **Seguridad, privacidad y controles transversales** 

|**Control**|**Regla mínima aplicable al MVP1**|
|---|---|
|**Autorización**|RBAC/RLS o equivalente para endpoints, recursos, imágenes, exportaciones y /admin; pruebas de acceso<br>cruzado.|
|**MFA**|ADMIN y operadores técnicos privilegiados con MFA nominal y recuperación institucional; usuarios normales<br>solo correo verificado para acciones protegidas.|
|**Consentimientos**|Contrato/aviso versionados; marketing y oportunidades proactivas separados, voluntarios y revocables.|
|**Intermediación**|CONTACT/VISIT llega primero a MiLocal; sin entrega automática de PII al propietario.|
|**Fotos/mapa**|EXIF/GPS eliminados; imágenes optimizadas; coordenadas y dirección precisa siempre privadas.|
|**Analytics**|Eventos permitidos desde capa propia; sin PII ni grabación del backoffice.|
|**Retención/derechos**|Matriz por finalidad y procedimiento de acceso, rectificación, supresión/anonimización; plazos por validar<br>legalmente.|
|**Auditoría**|Acciones privilegiadas, moderación, cambios comerciales, notas y CSV con actor/fecha/contexto mínimo.|
|**Continuidad**|Backups de BD y fotos, restauración probada, entornos separados, runbooks y revocación de secretos.|



###### **LÍMITE JURÍDICO** 

La v1.0 es especificación funcional, no certificación de cumplimiento. La identidad del responsable, bases jurídicas, avisos definitivos, retención, transferencias, proveedores y obligaciones legales deben cerrarse con sus responsables antes de habilitar usuarios reales. 

Documento rector · Octubre 2026     |     Página 24 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

###### 23 / IMPLEMENTACIÓN DESACOPLADA 

## **Arquitectura técnica de referencia** 

|**Capa**|**Capacidad requerida**|**Criterio de decisión**|
|---|---|---|
|**Frontend web**<br>**responsive**|Landing, assessments, perfil, publicaciones, explorador/mapa y<br>/admin.|Componentes reutilizables, accesibilidad y<br>rendimiento móvil.|
|**Identidad y sesión**|Auth gestionada, correo verificado, doble rol/contexto, return_to y<br>MFA privilegiado.|Proveedor final sujeto a seguridad, portabilidad,<br>costo y soporte.|
|**API / servicios**|Evaluaciones backend, permisos por recurso, idempotencia,<br>intereses, auditoría y exportación.|Ninguna regla sensible dependiente solo del<br>navegador.|
|**Persistencia**|Usuarios, perfiles, inmuebles, interés, historiales y consentimientos<br>relacionales.|IDs estables, migraciones y backup verificable.|
|**Media**|Upload seguro, thumbnails, sanitización EXIF/GPS, URLs permitidas<br>y cachés.|Revisión posterior y retirada pública efectiva.|
|**Mapa**|Pines aproximados filtrados, alternancia lista/mapa, SDK<br>intercambiable.|Proveedor no elegido definitivamente.|
|**Analytics y**<br>**notificaciones**|Adapter de eventos y alertas internas de publicaciones/intereses.|Minimización y proveedor no acoplado al<br>dominio.|
|**Backoffice**|Consultas operativas, mini-CRM, KPIs predefinidos y CSV.|No sustituir sistemáticamente por consola<br>técnica.|



#### **Proveedores sugeridos, no decisiones vinculantes** 

El stack inicialmente discutido puede considerar Next.js/React, servicios gestionados tipo Supabase, hosting administrado, repositorio GitHub, GA4 y Clarity. La contratación, región, base legal, precio, credenciales corporativas, respaldo, MFA y plan de salida se validan antes de implementar o lanzar; este Maestro no adjudica tecnología. 

Documento rector · Octubre 2026     |     Página 25 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

24 / CALIDAD 

## **Requisitos no funcionales y QA** 

|**Área**|**Regla de aceptación**|
|---|---|
|**Responsive**|Recorridos completos en móvil y escritorio, incluido mapa/lista, formularios, perfil y backoffice.|
|**Accesibilidad**|Labels, foco, estados vacíos, mensajes de error y semántica de controles navegables.|
|**Rendimiento**|Carga de fotos optimizada, paginación/lazy load y queries filtradas; no bloquear publicación por aviso interno<br>fallido.|
|**Integridad**|No duplicar registros ante reintentos, doble clic, refresco o carreras concurrentes.|
|**Privacidad**|Probar rutas públicas, APIs, imágenes, CSV, /admin y analytics en situaciones negativas.|
|**Observabilidad**|Errores, operaciones críticas y eventos de negocio trazables sin exposición de PII excesiva.|
|**Resiliencia**|Backups de BD+fotos, restauración controlada, rollback y procedimientos de incidente.|
|**Compatibilidad**|Excel/Sheets con CSV en UTF-8; comportamiento coherente de acentos, fechas, IDs y NULL.|



#### **Matriz de pruebas E2E indispensable** 

|**Caso**|**Resultado esperado**|
|---|---|
|**Visitante abre propiedad PUBLISHED**|Ficha y pin aproximado visibles, sin PII ni auth obligatorio.|
|**Interés desde visitante**|Registro/verificación retorna a propiedad y permite CONTACT/VISIT sin assessment.|
|**Doble envío de interés**|Un Interest, fecha original conservada, contador/fecha de insistencia actualizados.|
|**Propietario publica**|PUBLISHED inmediato, aparece en mapa/listado, ADMIN recibe aviso interno.|
|**ADMIN modera**|Despublicación efectiva y bloqueada a republicación autónoma; historial íntegro.|
|**Precio cambia tras Interest**|Snapshot de renta original y renta vigente disponibles sin mutar lead.|
|**Visita solicitada**|Permanece intención VISIT; no se cuenta VISIT_SCHEDULED sin coordinación real.|
|**Cierre fuera de MiLocal**|Se retira la ficha, pero nunca genera WON.|
|**Usuario sin rol busca /admin o CSV**|Acceso denegado también por API/RLS.|
|**Admin exporta CSV**|Dataset correcto, auditoría registrada y PII restringida.|



Documento rector · Octubre 2026     |     Página 26 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

###### 25 / ENTREGA POR INCREMENTOS 

## **Roadmap propuesto y dependencias** 

Secuencia indicativa para cotización y organización técnica. Los sprints, proveedores, capacidades y presupuesto deben ajustarse con el equipo de desarrollo; no constituyen fechas cerradas. 

|**Hito**|**Construcción/resultado demostrable**|**Condición de aceptación**|
|---|---|---|
|**0 · Base**|Diseño de sistema, entornos, repositorio, auth, esquemas, catálogo y<br>decisiones técnicas.|Rutas y permisos seguros,<br>migración/backup inicial y contratos<br>acordados.|
|**1 · Captación**|Landing, Assessment Emprendedor y Assessment Propietario; borradores 7<br>días.|Ambos flujos completos; persistencia<br>sin duplicados.|
|**2 · Identidad y**<br>**perfiles**|Registro contextual, correo verificado, doble contexto y edición.|return_to, consentimiento y permisos<br>probados.|
|**3 · Publicación**|Property DRAFT, fotos, publicación automática y notificación posterior.|PUBLISHED inmediato y<br>retirada/moderación auditada.|
|**4 · Descubrimiento**|Listado, filtros, ficha, mapa básico y Interest CONTACT/VISIT.|Interés único con snapshot e<br>inscripción exprés.|
|**5 · Operación**|ADMIN, precalificación, pipeline comercial, vigencia, KPI y cuatro CSV.|Gestión completa sin SQL en tareas<br>normales.|
|**6 · QA / lanzamiento**|Pruebas E2E, seguridad, performance, restauración, gate LEGAL/OPS.|Evidencia de aceptación y aprobación<br>de salida.|



###### **DEPENDENCIA CRÍTICA** 

No activar una funcionalidad de publicación/interés en producción sin verificación de correo, controles backend y privacidad. No lanzar a usuarios reales sin los gates jurídicos y operativos del Anexo. 

Documento rector · Octubre 2026     |     Página 27 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

###### 26 / RESPONSABILIDADES PREVIAS A PRODUCCIÓN 

## **Gates jurídicos y operativos** 

|**ID**|**Pendiente de validación**|**Responsable principal**|
|---|---|---|
|**LEGAL-01**|Razón social, RUT/domicilio y canal del responsable del tratamiento.|Founders + legal|
|**LEGAL-02**|Bases por finalidad, términos y política/avisos de privacidad finales.|Legal + producto|
|**LEGAL-03**|Períodos de retención de cuentas, CRM, inmuebles, audit y backup.|Legal + tecnología|
|**LEGAL-04**|Canal y proceso de ejercicio de derechos, verificación, plazos y respuesta.|Legal + operación|
|**LEGAL-05**|Proveedores, contratos, regiones y transferencias internacionales.|Legal + tecnología|
|**LEGAL-06**|Analítica y tecnologías de seguimiento: aviso/consentimiento/configuración.|Legal + tecnología|
|**LEGAL-07**|Uso exclusivamente interno de datos para inteligencia comercial.|Legal + producto|
|**LEGAL-08**|Evaluación jurídica del futuro motor y perfilado, antes de activarlo.|Legal + producto|
|**OPS-01**|RPO/RTO, plan real de backup, pruebas y costo aprobado.|Tecnología|
|**OPS-02**|Responsables titulares y suplentes de incidentes y privacidad.|Operación + founders|
|**OPS-03**|Permisos técnicos, revocación, recuperación y runbooks verificables.|Tecnología + founders|



No inventar plazos de conservación ni fijar proveedor por conveniencia editorial. Estos códigos se mantienen abiertos hasta disponer de validación/evidencia documentada; la aprobación funcional de este Maestro no los cierra. 

Documento rector · Octubre 2026     |     Página 28 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

27 / CRITERIOS DE CIERRE 

## **Matriz de trazabilidad por pilar** 

|**Pilar**|**Evidencia QA más relevante**|**Referencia**|
|---|---|---|
|**01 Landing**|Dos caminos, hasta 6 fichas activas, eventos de conversión y SEO.|PRD 01 v1.0|
|**02 Assessment**<br>**emprendedor**|7 bloques, presupuesto exacto, triestados y búsqueda única.|PRD 02 v1.0|
|**03 Assessment propietario**|6 bloques, owner_type/relationship, renta, ubicación privada.|PRD 03 v1.0|
|**04 Registro y roles**|Verificación email, doble contexto, return_to, MFA ADMIN.|PRD 04 v1.0|
|**05 Perfiles**|Edición persistente, 4 dimensiones separadas, preferencias revocables.|PRD 05 v1.0|
|**06 Publicación**|PUBLISHED automático + aviso/postrevisión, fotos seguras, vigencia.|PRD 06 v1.0|
|**07 Exploración**|Mapa aproximado, filtros, Interest único, precio snapshot.|PRD 07 v1.0|
|**08 Administración**|Precalificación manual, pipeline, KPI, 4 CSV, auditoría.|PRD 08 v1.0|
|**Transversal**|Permisos, consentimientos, fotos, privacidad, respaldo y LEGAL/OPS.|Anexo v1.0|



#### **Criterio final de aceptación documental** 

- Cada pilar se implementa según su propio PRD detallado y los límites de alcance de este Maestro. 

- Los contratos de enums, IDs, tipos, eventos y nomenclatura deben versionarse como parte del handoff técnico. 

- Los controles de privacidad y seguridad no se consideran opcionales por aparecer también en el Anexo. 

- Toda excepción de alcance o inconsistencia nueva se documenta y revisa formalmente, no se oculta en el desarrollo. 

Documento rector · Octubre 2026     |     Página 29 

**MILOCAL  /  MVP 1  /  PRD MAESTRO v1.0** 

28 / DECISIÓN DE PRODUCTO 

## **Cierre: criterio rector del MVP1** 

###### **QUÉ DEBEMOS DEMOSTRAR** 

Que MiLocal puede captar demanda y oferta reales, convertirlas en datos estructurados, exponer inventario comercial útil, generar intereses válidos y gestionarlos con intervención humana trazable; todavía no necesitamos automatizar la decisión inmobiliaria. 

#### **El MVP1 está listo para entrar a implementación cuando…** 

- Los ocho PRD y el Anexo v1.0 son la fuente de alcance vigente para diseño, desarrollo y QA. 

- El equipo técnico dispone del diccionario final de campos, enums, relaciones, rutas y eventos, con IDs estables y responsabilidades claras. 

- La arquitectura y los proveedores reales satisfacen los controles imprescindibles de autenticación, privacidad, auditoría y respaldos. 

- Se ejecuta el plan de QA E2E y se resuelven, antes del lanzamiento, los gates LEGAL/OPS aplicables. 

Siguiente hito de proyecto: arquitectura de implementación, estimación, backlog por entregables, contratos de datos y plan de QA; mantener separados el alcance funcional v1.0 y las verificaciones jurídicas/técnicas aún abiertas. 

Documento rector · Octubre 2026     |     Página 30 

