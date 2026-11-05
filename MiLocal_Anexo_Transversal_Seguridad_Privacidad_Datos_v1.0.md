**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 



**<mark>DOCUMENTO TRANSVERSAL / ANEXO DE SEGURIDAD Y PRIVACIDAD</mark>** 

# **Seguridad, privacidad y tratamiento de datos personales** 

### **Anexo transversal de los PRD 01–08** 

MiLocal MVP 1 | Versión 1.0 funcional consolidada del estándar transversal de seguridad, privacidad y datos personales. Integra PRD 01–08 v1.0, 79 decisiones CONS, 96 ajustes de aplicación y 18 acuerdos SEG; distingue controles de producto de validaciones LEGAL/OPS antes de producción. 

|**DOCUMENTO**|**ESTADO**|**FECHA**|**ALCANCE**|
|---|---|---|---|
|Anexo Transversal v1.0|Funcionalmente consolidado;<br>LEGAL/OPSpendientes|27 octubre 2026|PRD 01–08 v1.0 · Estándar<br>transversal MVP 1|



**NATURALEZA DEL DOCUMENTO  Este anexo consolida el estándar transversal aprobado para el MVP 1. No sustituye la Política de Privacidad pública, Términos y Condiciones, contratos, verificaciones de proveedores ni asesoría legal. La versión 1.0 es una especificación FUNCIONAL; no certifica seguridad implementada ni cumplimiento jurídico. Los pendientes LEGAL-01–08 y OPS-01–03 permanecen identificados para el gate de producción.** 

Documento vivo - Octubre 2026 

Página 1 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

### **Tres niveles de certeza** 

|**MARCA**|**SIGNIFICADO**|**TRATAMIENTO**|
|---|---|---|
|APROBADO|Decisión funcional cerrada en SEG-01–18,<br>79 CONS y AJ-01–96, incluyendo<br>precisiones aprobadas durante la revisión<br>de los PRD.|Aplicar en requisitos, UX, backend,<br>procedimientos, pruebas y consistencia<br>entre los ocho PRD v1.0.|
|PROPUESTA|Forma técnica concreta aún dependiente de<br>proveedor, costos, arquitectura o QA.|No imponer proveedor ni funcionalidad<br>adicional sin evaluación de alcance/costo.|
|LEGAL|Determinación jurídica o contractual<br>pendiente|No declarar cierre de cumplimiento:<br>responsable, evidencia y revisión antes de<br>producción.|



### **Decisiones rectoras** 

- MiLocal recibe y gestiona manualmente solicitudes CONTACT/VISIT; no entrega automáticamente al propietario la identidad o los datos del interesado, ni promete visitas agendadas. 

- Solo se publican datos permitidos del inmueble; dirección exacta, contactos y notas internas permanecen privados. 

- El usuario puede consultar o despublicar sus inmuebles, pero la eliminación definitiva sigue un flujo controlado y jurídicamente revisado. 

- Los accesos ADMIN están separados de los permisos técnicos de infraestructura; no existe un “administrador invulnerable”. 

- El diseño del MVP debe conservar información estructurada para el futuro motor de compatibilidad sin simular una IA ya operativa. 

Documento vivo - Octubre 2026 

Página 2 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 01 / PROPÓSITO, LÍMITES Y PRECEDENCIA</mark>** 

## **Propósito, límites y precedencia** 

Definir controles comunes de tratamiento, acceso, minimización, conservación, auditoría y respuesta a incidentes para el MVP 1. Esta v1.0 recoge las decisiones SEG-01 a SEG-18 y los ajustes transversales ya aprobados; LEGAL/OPS siguen pendientes de validación externa. 

Este documento es transversal: define criterios comunes de seguridad, privacidad, almacenamiento, trazabilidad y gestión de derechos. El detalle de la experiencia de usuario y las reglas de producto siguen perteneciendo a cada PRD específico. 

### **Reglas de precedencia** 

- La ley aplicable y las decisiones jurídicas verificadas prevalecen sobre cualquier regla técnica o de UX. 

- Las decisiones funcionales consolidadas en los ocho PRD v1.0, 79 CONS y AJ-01–96 prevalecen como especificación acordada; cambios exigidos por validación técnica o legal se registran expresamente y se someten a decisión, sin reescritura silenciosa. 

- Los controles SEG describen el requisito de producto. Proveedor, implementación, evidencia y costo deben verificarse antes del lanzamiento. La aprobación documental v1.0 NO cierra automáticamente LEGAL-01–08 ni OPS-01–03. 

- Cada regla transversal vive aquí como fuente común; PRD 01–08 la referencian y detallan exclusivamente sus efectos funcionales. Evitar estados, permisos o contratos de datos paralelos e incompatibles. 

- Supabase, GitHub, Vercel, GA4 y Microsoft Clarity son alternativas y referencias del stack inicial; selección, contratos, configuración, ubicaciones de datos y salida de proveedor se validan por separado. 

### **Clasificación mínima de información** 

|**CATEGORÍA**|**EJEMPLOS**|**CRITERIO**|
|---|---|---|
|Pública|Comuna, sector opcional, título, renta, m²,<br>imágenes saneadas, atributos publicados y<br>ubicación aproximada.|Proyección explícita desde vista/API<br>pública.|
|Privada del titular|Nombre, correo, teléfono, presupuesto del<br>negocio, búsqueda y dirección exacta del<br>inmueble.|Acceso por titular y operación autorizada<br>según finalidad.|
|Interna operativa|Intención, estados comerciales,<br>precalificación por oportunidad, notas<br>mínimas, asignación ADMIN, moderación y<br>confirmaciones de vigencia.|Solo personal habilitado; registrar<br>modificaciones.|
|Restringida técnica|Credenciales de servicios, llaves, secretos,<br>respaldos, logs técnicos|Nunca en interfaz pública ni exportación<br>comercial.|
|Histórica / analítica|Interacciones, cambios de estado,<br>estadísticas|Minimizar datos identificables y aplicar<br>retenciónpor finalidad.|



Documento vivo - Octubre 2026 

Página 3 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 02 / MAPA DEL TRATAMIENTO POR CAPÍTULO</mark>** 

## **Mapa del tratamiento por capítulo** 

|**PRD**|**DATOS / OPERACIÓN**|**REGLA DE PRIVACIDAD Y SEGURIDAD**|
|---|---|---|
|01 Landing|Intención anónima, UTMs, vistas,<br>navegación.|Visitante anónimo; analytics sin PII. Clic de<br>CTA ≠ Interest válido; no instrumentar<br>ADMIN en analíticapública.|
|02 Assessment emprendedor|Rubro, etapa, comunas, presupuesto,<br>superficie, necesidades técnicas.|Borrador anónimo hasta 7 días; búsqueda<br>única editable y datos estructurados; sin<br>scoringniprecalificación automática.|
|||Ubicación exacta no pública; sector|
|03 Assessment propietario|Relación con inmueble, tipo, ubicación<br>exacta, renta, atributos.|opcional, mapa con pines aproximados;<br>información declarativa sin KYC de<br>dominio.|
|||Registro exprés y perfiles duales; correo|
|04 Registro y roles|Email, nombre, teléfono, roles, sesión,<br>verificaciones, aceptación.|verificado antes de publicar o crear Interest<br>válido. Marketing y oportunidades<br>proactivas independientes.|
|||Pendiente / Por completar / Completado ≠|
|05 Perfiles|Estado y contenido del perfil, preferencias<br>de contacto.|assessment, estado comercial o<br>precalificación. Preferencias editables y<br>revocables.|
|||Auto-publicar tras validaciones y email|
|06 Publicación|Property, fotos, moderación, archivos y<br>retiro.|verificado; notificar ADMIN para revisión<br>POSTERIOR no bloqueante; EXIF/GPS<br>eliminadoymoderación auditada.|
|||Exploración anónima + mapa básico|
|07 Explorar|Fichas, búsquedas, solicitud<br>CONTACT/VISIT.|aproximado, ficha pública sin identidad del<br>oferente; CONTACT/VISIT solo tras<br>registro/validación.|
|08 Administración|Datos privados, CSV, CRM, cambios,<br>auditoría.|Mini-CRM manual con estado comercial y<br>precalificación independiente, snapshots de<br>rentaycuatro CSV auditados. MFA ADMIN.|



### **Secuencia de datos** 

Visita anónima → assessment/borrador (opcional, máx. 7 días anónimo) o exploración → registro y email verificado para acciones protegidas → perfil/búsqueda/propiedad → publicación automática + revisión ADMIN posterior → Interest único CONTACT/VISIT → seguimiento y precalificación manual MiLocal → resultado confirmado → retención/eliminación según finalidad y política validada. 

|**DIMENSIÓN**|**EJEMPLO DE ESTADO**|**RESPONSABILIDAD / REGLA**|
|---|---|---|
|Assessment|COMPLETED|Respuestas al formulario; PRD 02/03, no es<br>calificación.|
|Perfil|Completado|Datos mínimos delperfil; PRD 05.|
|Estado comercial|CONTACTED|Progreso de una solicitud concreta; PRD<br>08.|
|Precalificación|Por validar|Juicio manual por emprendedor e inmueble;<br>PRD 08.|



Documento vivo - Octubre 2026 

Página 4 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 03 / FUNDAMENTO JURÍDICO Y MARCO VIGENTE</mark>** 

## **Fundamento jurídico y marco vigente** 

Referencia normativa del anexo original consultada en BCN al 20-10-2026: Ley 19.628 y Ley 21.719 (vigencia diferida prevista para 01-12-2026). Esta mención es informativa y debe reconfirmarse jurídicamente al finalizar los documentos legales y antes del lanzamiento; no constituye dictamen ni verificación de cumplimiento de MiLocal. 

|**MARCO**|**SITUACIÓN AL 20-10-2026**|**IMPLICANCIA PARA MILOCAL**|
|---|---|---|
|Ley 19.628|Régimen general vigente hasta 30-11-2026,<br>según versión BCN.|No operar sin avisos, bases y controles<br>adecuados durante etapa de transición.|
|Ley 21.719|Publicada 13-12-2024; entrada en vigencia<br>01-12-2026, según BCN.|Diseñar y revisar antes del lanzamiento con<br>los estándaresque comenzarán a regir.|
|Agencia de Protección de Datos Personales|Instituida por Ley 21.719.|Preparar roles y procedimientos de gestión<br>de incidentesyderechos.|
|Contratos / servicios|Obligaciones encomendadas, encargados y<br>transferencias según régimen aplicable.|Revisar DPA, subencargados,<br>jurisdicciones, ubicación de servidores.|



### **Aspectos que deberá dictaminar asesoría legal** 

- Identificar la razón social responsable del tratamiento, RUT y domicilio cuando corresponda, representación y canal institucional de privacidad. Nunca inventar estos datos: son campos de cierre LEGAL-01 antes del lanzamiento. 

- Definir base jurídica por finalidad: cuenta, assessment, perfil, publicación, mediación de CONTACT/VISIT, contacto proactivo solicitado, comunicación comercial, analítica, auditoría y estadísticas internas. No reutilizar información de búsqueda para marketing por defecto. 

- Registro en un paso con vínculos visibles a términos y privacidad. Separar marketing opcional, autorización proactiva de oportunidades y comunicaciones operativas; no usar casillas premarcadas para permisos voluntarios, y verificar jurídicamente cada base y mecanismo. 

- Régimen y plazos para ejercicio de derechos, conservación, supresión y transferencias internacionales. 

- Necesidad de una evaluación de impacto según riesgos reales, especialmente antes de introducir evaluación sistemática automatizada o tratamientos de mayor escala. 

- MVP 1 destinado a mayores de 18 años: incorporación de declaración simple en términos/registro y revisión jurídica previa. No agregar KYC documental ni escaneo de identidad por esta razón. 

- Requisitos de información y contratos para la intermediación en solicitudes de visitas y futuras comisiones inmobiliarias (materia complementaria). 

**ALERTA TEMPORAL** Para lanzamientos desde diciembre de 2026, revisar la versión efectiva de la Ley 19.628 modificada por Ley 21.719 y los reglamentos o instrucciones disponibles a la fecha de producción. No confiar solo en el texto de este anexo. 

Documento vivo - Octubre 2026 

Página 5 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 04 / FINALIDADES, DATOS Y BASES JURÍDICAS POR VALIDAR</mark>** 

## **Finalidades, datos y bases jurídicas por validar** 

El estándar funcional identifica finalidades y acceso, pero no presume una única base jurídica para todos los datos. Sin venta ni cesión de datos de mercado; cualquier procesamiento externo requiere finalidad, acuerdo y revisión específica. 

|**FINALIDAD**|**DATOS MÍNIMOS**|**BASE A VALIDAR**|**DECISIÓN MVP**|
|---|---|---|---|
|Creación de cuenta / acceso|Identidad y contacto,<br>credenciales gestionadas por<br>Auth|Contrato / gestión solicitada, o<br>la que corresponda|APROBADO: cuenta con<br>términos/privacidad<br>versionados.|
||||APROBADO: datos<br>estructurados, una búsqueda|
|Assessment / perfil|Necesidades del negocio y del<br>espacio|Ejecución de servicio / medidas<br>precontractuales u otra|activa editable por<br>emprendedor; sin clasificación<br>automática de solvencia o<br>compatibilidad.|
||||APROBADO: publicación<br>gratuita automática tras|
|Publicar inmueble|Características, dirección<br>privada, fotos|Relación contractual y<br>finalidades explicitadas|validaciones, con alerta a<br>ADMIN para revisión posterior;<br>dirección privada y pin público<br>aproximado.|
||||APROBADO: Interest canónico<br>CONTACT/VISIT, MiLocal|
|Gestión CONTACT / VISIT|Identidad, teléfono, intención,<br>propiedad, notas|Gestión comercial pedida por el<br>titular y comunicación informada|intermediario manual; estado<br>comercial y precalificación<br>independientes, sin entrega<br>automática alpropietario.|
|Contacto proactivo / marketing|Email/teléfono, preferencia<br>proactiva separada y<br>preferencia marketing<br>independiente.|Validar base por finalidad y<br>voluntariedad; no casillas<br>premarcadas.|APROBADO: oportunidades<br>proactivas y marketing son dos<br>opciones independientes,<br>revocables y no obligatorias;<br>comunicaciones operativas se<br>gestionan por finalidad<br>informada.|
||||APROBADO: GA4/Clarity son<br>|
|Medición de producto / UX|Eventos, dispositivo y analítica|Evaluar base, cookies y<br>herramientas aplicables|opciones sustituibles; no enviar<br>PII ni grabar ADMIN; eventos<br>filtrados y configuración sujeta a<br>LEGAL-06.|
||||APROBADO: eventos sensibles|
|Auditoría y seguridad|Identificadores, actor, acción,<br>fecha, metadatos mínimos|Obligación o interés<br>jurídicamente válido según caso|internos en auditoría restringida;<br>excluirlos de analítica pública y<br>logs excesivos.|



Documento vivo - Octubre 2026 

Página 6 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 05 / AVISOS, ACEPTACIÓN, MARKETING Y TRAZABILIDAD</mark>** 

## **Avisos, aceptación, marketing y trazabilidad** 

### **Registro simple, avisos visibles y decisiones separadas** 

- Assessment anónimo permitido con aviso breve de finalidad y enlace de privacidad. Al registrarse se muestra la información requerida y se conservan constancias versionadas según revisión legal. 

- Registro de una pantalla y una acción final de envío, con acceso visible a Términos y Política de Privacidad; conservar versiones y fechas. Ni aceptar publicidad ni aceptar ofertas proactivas es requisito para usar el MVP. 

- Marketing: permiso voluntario específico, separado y sin marcar por defecto. Oportunidades proactivas relacionadas con la búsqueda: preferencia voluntaria diferente, también desmarcada y revocable. Los correos transaccionales de seguridad o respuesta a una solicitud no equivalen a marketing. 

- Si cambian el responsable legal, las finalidades o los destinatarios, revisar avisos y determinar si corresponde informar nuevamente u obtener consentimiento nuevo. Los cambios meramente visuales de logo o identidad gráfica no deben alterar las reglas técnicas ni ocultar la identidad jurídica vigente. 

- Conservar constancias versionadas y separadas: términos, información de privacidad, marketing_opt_in y proactive_opportunities_opt_in, con fecha, fuente y revocación aplicable. No registrar datos personales adicionales para guardar evidencia. 

|**COMUNICACIÓN**|**DISPARADOR / CONTENIDO**|**REGLA MVP**|
|---|---|---|
|Solicitud operativa|El usuario envía CONTACT/VISIT o pide<br>gestión específica.|Atender finalidad informada; no convertir en<br>marketing.|
|Oportunidades proactivas|MiLocal identifica inmuebles potenciales<br>para su búsqueda.|Preferencia específica, opcional, sin<br>premarcaryrevocable.|
|Marketing general|Campañas, promociones o novedades no<br>vinculadas a un interés concreto.|Preferencia independiente y opcional;<br>validar basejurídica.|
|Cuenta y seguridad|Verificación de email, recuperación, avisos<br>necesarios.|Comunicaciones del servicio; finalidad<br>diferenciada.|



### **Contenido legal que debe ofrecer el producto** 

|**PIEZA**|**MOMENTO**|**RESPONSABLE DE VALIDAR**|
|---|---|---|
|TérminosyCondiciones|Accesibles desde landing yregistro|Legal / founders|
|Política de Privacidad|Accesible públicamente, especialmente en<br>captura|Legal / founders|
||Antes de enviar un Interest||
|Aviso de contacto/visita|CONTACT/VISIT; sin promesa de visita<br>reservada|Producto + legal|
|Aviso de analítica/cookies|Antes de habilitar analítica según proveedor<br>ybasejurídica revisada|Legal + técnica|
|Canalpara derechos|En sitio, enprivacidadyen cuenta|Operación + legal|



**PROTECCIÓN CONTRACTUAL** Prohibido presumir que todos los datos capturados en assessments pueden reutilizarse para marketing o venta a terceros. La inteligencia de mercado se destina únicamente a análisis internos de MiLocal, bajo minimización, agregación y controles de acceso. No se autoriza su comercialización ni divulgación externa. 

Documento vivo - Octubre 2026 

Página 7 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 06 / MODELO DE DATOS, MINIMIZACIÓN Y SEPARACIÓN DE ACCESO</mark>** 

## **Modelo de datos, minimización y separación de acceso** 

### **Datos identificadores vs información del negocio** 

Auth conserva credenciales separadas de datos de negocio. Entidades de emprendedores, propietarios, propiedades e intereses emplean IDs estables, atributos autorizados y control explícito de acceso/edición. Los datos privados, históricos y operativos no se filtran en la proyección pública ni en analytics. 

### **Contrato de API pública - prohibiciones** 

- No exponer address_full, números de calle, coordenadas exactas, nombre/contacto del propietario, PII del interesado, comentarios internos, estados comerciales, precalificación, claves ni secretos en endpoints públicos o metadatos. 

- No confiar en ocultar campos por CSS o en la UI; la consulta backend/API debe autorizar y proyectar solo atributos permitidos. 

- No enviar información privada en URLs, query params de seguimiento, títulos visibles en redes sociales ni metadata pública de la ficha. 

- No permitir que propietarios o emprendedores accedan a datos de otras cuentas por cambiar un UUID o enlace. 

- No exponer datos de notas, pipeline o el teléfono del emprendedor en previews públicas de propiedades. 

### **Fotografías** 

MVP: 1–12 fotografías por publicación (recomendación UX de 6–8), reordenables y con portada elegible. Antes de su exposición pública, validar tipo MIME real/peso, procesar imágenes y eliminar EXIF/GPS; verificar también URLs, cachés y retiradas. Quitar EXIF no garantiza privacidad visual: informar al oferente y habilitar revisión POSTERIOR por ADMIN, sin bloquear publicación válida. 

Documento vivo - Octubre 2026 

Página 8 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 07 / CICLO DE VIDA DEL DATO PERSONAL Y DE LA PUBLICACIÓN</mark>** 

## **Ciclo de vida del dato personal y de la publicación** 

|**EVENTO**|**EFECTO EN PRODUCTO**|**CONTROL DE PRIVACIDAD**|
|---|---|---|
|Borrador anónimo|Permite continuar assessment sin cuenta<br>hasta 7 días.|No enlazar a identidad si nunca hubo<br>registro; caducidad efectivaylimpieza.|
|Registro|Transfiere borrador a cuenta y genera<br>perfil/propiedad.|Asociación controlada, evitar duplicidad y<br>pérdida de datos.|
|Perfil editado|Titular corrige sus datos.|Guardar updated_at; respetar source of<br>truthy permisos.|
||Publicación pasa automáticamente a|Email verificado, proyección pública|
|Publicar|PUBLISHED tras validaciones; se crea<br>aviso interno para revisión posterior<br>ADMIN.|mínima, sin etapa obligatoria de<br>preaprobación; revisión interna NO es<br>estadopúblico.|
|Pausar|Propiedad UNPUBLISHED fuera de mapa,<br>listado y nuevos intereses; histórico CRM<br>permaneceprotegido.|Mantener historia operativa y reglas de<br>acceso.|
||ARCHIVED/solicitud eliminación retira|Soft-delete no equivale a supresión|
|Archivo/solicitud de eliminación|visibilidad; archivo lógico según política y<br>motivo registrado.|definitiva; iniciar flujo de<br>retención/supresión.|
|Solicitud de borrar cuenta|Confirmación y desactivación inicial.|Derechos y supresión/anonimización<br>posteriores según decisiónjurídica.|



### **Conservación de resultados comerciales** 

Historial comercial ≠ derecho de retención indefinida. Mantener matriz versionada y parametrizable por finalidad (cuenta, foto, inmueble, precalificación e Interest, notas, exportaciones, audit, backups), con plazos y excepciones sujetos a LEGAL-03. Una restauración no debe reactivar datos ya suprimidos o rectificados. 

Documento vivo - Octubre 2026 

Página 9 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 08 / SOLICITUDES DE CONTACTO Y VISITA: TRATAMIENTO Y CONTROLES</mark>** 

## **Solicitudes de contacto y visita: tratamiento y controles** 

«Me interesa» permite registro exprés de Emprendedor sin assessment completo. Interest válido exige nombre y teléfono, identidad autenticada y email verificado; una oportunidad canónica por (user_id, property_id), intención CONTACT/VISIT y mensaje de recepción, NO visita agendada. MiLocal recibe la solicitud para gestión MANUAL; jamás distribuye automáticamente PII al propietario. 

|**PASO**|**ACTOR**|**DATOS Y PROTECCIÓN**|
|---|---|---|
|Solicitud|Emprendedor|Intención CONTACT/VISIT; clic en CTA no<br>es Interest válido ni visita confirmada.|
|||Interest único (user_id, property_id);|
|Registro|Backend|registrar insistencias/timestamps y renta al<br>primer interés, sin duplicar lead ni<br>sobreescribir snapshot.|
|||Aviso interno a MiLocal minimizado; no|
|Aviso|MiLocal|comunicación automática de<br>identidad/contacto alpropietario.|
|Gestión|ADMIN|Responsable, estado comercial y<br>precalificación MANUAL independientes,<br>notas mínimas e historial de cambios;<br>objetivo interno de respuesta en 2 días<br>hábiles, no SLApúblico.|
|||Gestión manual; documentación pertinente|
|Coordinación|MiLocal|fuera de la plataforma por canal corporativo<br>seguro.|
|||Visitas coordinadas vs realizadas; WON|
|Resultado|ADMIN|solo mediación MiLocal confirmada.<br>Arriendo externo ≠ WON.|



### **Estados del mini-CRM** 

Estado comercial: NEW → CONTACTED → VISIT_SCHEDULED → VISIT_COMPLETED → IN_NEGOTIATION → WON/LOST. La intención CONTACT/VISIT es distinta. Precalificación separada POR OPORTUNIDAD: Sin revisar / No pertinente / Por validar / Calificado; no representa una etiqueta global del emprendedor. WON solo tras operación realmente concretada y confirmada con intervención MiLocal. 

### **Protecciones adicionales propuestas** 

- Solo ADMIN autorizados ven la bandeja y notas; el propietario no recibe notificación automática de una solicitud ni acceso al perfil completo del emprendedor. 

- En notas internas registrar solo información pertinente. No almacenar contraseñas, documentos completos de identidad, acreditaciones financieras, datos bancarios ni soportes tributarios en el CRM; si corresponde pedir antecedentes, hacerlo manualmente mediante correo corporativo seguro fuera de la app, con manejo sujeto a políticas aprobadas. 

- Al mostrar un contacto en el panel, utilizar solo los datos necesarios; no guardar conversaciones de WhatsApp por defecto si no existe finalidad y base revisadas. 

- MiLocal puede compartir manualmente con la contraparte únicamente datos estrictamente necesarios para coordinar un caso, conforme a información entregada al titular y base legal revisada. Registrar destinatario, motivo, alcance y momento; prohibida distribución masiva y comercialización de leads. 

- Exportaciones del CRM solo para equipos habilitados y con registro de auditoría; no enviar listados masivos por correo personal. 

Documento vivo - Octubre 2026 

Página 10 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 09 / ACCESOS, PERMISOS Y SEGREGACIÓN DE RESPONSABILIDADES</mark>** 

## **Accesos, permisos y segregación de responsabilidades** 

ADMIN operativo es distinto del personal técnico de infraestructura; cuentas individuales, privilegios mínimos, MFA obligatorio y baja/revocación controladas. ADMIN no publica inmuebles arbitrariamente ni altera assessments privados; modera solo campos autorizados, gestiona CRM y exportaciones restringidas. 

|**RECURSO**|**VISITANTE**|**EMPRENDEDOR**|**PROPIETARIO**|**ADMIN MILOCAL**|**TÉCNICO**|
|---|---|---|---|---|---|
|Ficha pública|Leer|Leer|Leer|Leer|Solo acceso técnico<br>justificado|
|Perfil privado propio|No|Propio|Propio|Lectura según<br>gestión|Excepcional|
|Dirección exacta<br>inmueble|No|No|Propio|Operativa|Excepcional|
|Solicitudes CRM|No|Solo propia, según<br>UX|No por defecto|Solo ADMIN<br>autorizado;<br>asignación, estados<br>y precalificación<br>auditados|Excepcional|
|||||CSV internos con<br>filtros y descarga||
|CSV privados|No|No|No|auditados; sin<br>documentos ni<br>notas CRM por<br>defecto|Solo soporte<br>autorizado|
|Configuración<br>DB/hosting|No|No|No|No|Según privilegio<br>corporativo|



### **Separación de identidades** 

- ADMIN se provisiona por mecanismo interno restringido, nunca por registro público ni por bandera editable desde el frontend. 

- La validación del rol ocurre en middleware/servidor y en autorizaciones reales de datos (por ejemplo RLS/servicios); no solo escondiendo el menú. 

- GitHub, hosting y proveedor de base de datos son cuentas corporativas de MiLocal con permisos individuales, revocables y de mínimo privilegio. No asumir proveedor permanente: documentar accesos, migraciones, responsable, costo, región y plan de sustitución. 

- Al menos dos responsables institucionales autorizados deben poder recuperar cuentas críticas, mediante MFA y custodia protegida de códigos o métodos de respaldo. Prohibido compartir contraseñas generales o crear cuentas imposibles de revocar. 

- No crear una pantalla de impersonación de usuarios durante MVP 1; el soporte debe operar por trazas, evidencias y acciones autorizadas. 

Documento vivo - Octubre 2026 

Página 11 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 10 / AUTENTICACIÓN, SESIONES Y VERIFICACIÓN</mark>** 

## **Autenticación, sesiones y verificación** 

|**CONTROL**|**DECISIÓN O PROPUESTA**|**OBSERVACIÓN**|
|---|---|---|
|Auth|APROBADO: proveedor gestionado con<br>adapter desacoplado.|No guardar contraseñas en tablas de<br>negocio.|
|Password|APROBADO: mínimo 8 caracteres<br>mediante proveedor Auth.|No divulgar existencia de cuenta ni datos<br>personales ante errores; controles de<br>accesoyrecuperación.|
|Correo|APROBADO: verificación requerida antes<br>de publicar/interés.|La exploración, lectura de fichas y avance<br>de borradores no exigen verificación;<br>publicar o enviar interés válido sí.|
|Teléfono|APROBADO: obligatorio; OTP no se exige<br>en MVP 1.|Dejar preparado para futuro OTP/KYC.|
|Sesión|APROBADO: sesión persistente segura del<br>proveedor.|Cerrar sesión, expiración/revocación según<br>proveedoryriesgo.|
|Acceso privilegiado|APROBADO SEG-12: MFA MUST para<br>ADMIN y cuentas técnicas privilegiadas.|MFA y revocación verificables antes de<br>producción; no se exige MFA a usuarios<br>normales del MVP.|
|Abuso automatizado|PROPUESTA: límites de tasa en Auth y<br>solicitudes.|Sin imponer una plataforma antifraude<br>compleja.|



### **Escenarios a probar** 

- Correo no verificado: permitir explorar y editar borradores, bloquear publicar/crear Interest válido con reenvío y retorno a la acción original. No confundir correo verificado con MFA privilegiado. 

- Sesión caducada o revocada: la API nunca devuelve PII aunque una pantalla vieja conserve estado. 

- Cambio de rol o bloqueo administrativo: derechos efectivos se invalidan en el backend sin esperar refresco manual. 

- Crear interés con reintentos o recarga: un único Interest por pareja usuario/inmueble, con historial de intentos; impedir nuevo Interest si inmueble no PUBLISHED; aplicar límites contra abuso sin filtrar existencia de otras cuentas. 

Documento vivo - Octubre 2026 

Página 12 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 10A / GUÍA PRÁCTICA DE MFA (SEG-12)</mark>** 

## **MFA: explicación sencilla para MiLocal** 

- MFA significa autenticación multifactor: además de la contraseña, el acceso privilegiado exige comprobar una segunda credencial independiente (por ejemplo una aplicación autenticadora o una passkey). Si roban la contraseña, esa segunda comprobación ayuda a impedir la entrada. 

### **Qué significa para nuestro MVP** 

- Para ADMIN MiLocal y propietarios de cuentas técnicas GitHub/hosting/base de datos: MFA es OBLIGATORIO antes de producción. Cada persona debe utilizar sus propios factores, sin códigos compartidos. 

- Para emprendedores y propietarios normales: en MVP 1 se exige verificar correo antes de publicar o pedir contacto/visita, pero NO se exige MFA como fricción adicional en el registro. 

- MFA, verificación por correo, OTP del teléfono y KYC documental son cosas distintas: el OTP telefónico y KYC quedaron fuera del MVP. MFA aquí protege cuentas con privilegios. 

- Si un ADMIN pierde su teléfono: no se crea un usuario invulnerable. Debe usar el procedimiento institucional de recuperación, códigos de respaldo custodiados y autorización de responsables; luego se revocan los factores comprometidos. 

- Cuando cambie un proveedor tecnológico: validar que ofrezca MFA equivalente, recuperación, registros de accesos y baja de usuarios. La exigencia es funcional, no dependiente de una marca. 

### **Comprobaciones de calidad antes del lanzamiento** 

|**PRUEBA**|**QUÉ HACER**|**RESULTADO ESPERADO**|
|---|---|---|
|Sin segundo factor|Intentar entrar a una cuenta ADMIN con<br>solo contraseña.|Acceso denegado hasta completar MFA.|
|Cuentas individuales|Dos operadores usan credenciales propias.|Accesos y auditoría atribuibles a cada<br>persona.|
|Pérdida del teléfono|Ensayar recuperación de un ADMIN<br>autorizado.|Recuperación controlada sin compartir<br>códigos en chats.|
|Revocación|Revocar permiso de un operador retirado.|La cuenta pierde acceso real a /admin y a<br>servicios técnicos.|
|Usuario estándar|Abrir cuenta y explorar sin MFA.|Experiencia normal sin fricción adicional;<br>email verificadopara accionesprotegidas.|



Documento vivo - Octubre 2026 

Página 13 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 11 / CONTROLES TÉCNICOS DE APLICACIÓN Y DATOS</mark>** 

## **Controles técnicos de aplicación y datos** 

|**RIESGO**|**CONTROL MVP**|**EVIDENCIA DEQA**|
|---|---|---|
|Lectura de PII por terceros|Autorización por propietario/ADMIN en cada<br>consulta; RLS o servicio equivalente.|Probar que cliente ajeno, perfil dual y API<br>pública no vean ubicación exacta, contacto,<br>notas, CRM niprecalificación.|
|Exposición de claves|Secretos solo en entornos de ejecución<br>protegidos; rotaciónyrevocación.|Inspección de repositorio, build y cliente.|
|Cambios masivos o SQL accidental|Migraciones versionadas; cambios en<br>staging, respaldoprevio.|Registro de migración y plan de rollback.|
|Texto malicioso|Validación y sanitización de<br>descripciones/notas.|Pruebas XSS y datos inválidos.|
|Carga de archivo|MIME y extensión, peso/compresión, rutas<br>privadas controladas.|Archivos inválidos, 1–12 imágenes,<br>EXIF/GPS eliminado, caché/retirada y<br>revisión ADMINposterior.|
|Exceso de consultas|Paginación y límites para /admin,<br>búsquedas e intereses.|Pruebas de carga razonables.|
|Logs con PII|Minimizar payload de error y ofuscar<br>tokens/datos privados.|Confirmar exclusión de PII y páginas /admin<br>de analítica externa y grabadores de<br>sesión.|
|Disponibilidad|Monitoreo básico, backups y recuperación<br>ensayada.|Ejercicio de restauración controlado.|



Los controles MUST de seguridad se verifican antes de producción. Una librería, framework o plataforma gestionada no sustituye la revisión de configuración y las pruebas de autorización. 

Documento vivo - Octubre 2026 

Página 14 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 12 / AUDITORÍA INTERNA Y EXPORTACIONES</mark>** 

## **Auditoría interna y exportaciones** 

### **Registro de acciones administrativas** 

SEG-16: admin_actions registra acceso/cambios privilegiados, notificación/revisión y moderación posteriores a publicación, asignaciones, precalificación, estados y notas de Interest, cierres WON/LOST, exportaciones CSV y cambios de privilegios. Actor, entidad, fecha, motivo, antes/después mínimo y filtros de exportación; NO duplicar credenciales ni archivos completos. 

|**EVENTO**|**TRAZA OBLIGATORIA**|**RESTRICCIÓN**|
|---|---|---|
|Despublicación / republicación ADMIN|Actor, propiedad, motivo, fecha y estado<br>anterior/nuevo.|Motivo obligatorio, retiro público inmediato y<br>bloqueo de republicación tras moderación<br>sin autorización ADMIN.|
|Edición título/descripcion pública|Actor, timestamp, referencia al cambio y<br>antes/después controlados.|Sin modificar otros campos estructurados.|
||Actor, Interest, estado antes/después,||
|Cambio de estado CRM|responsable y contexto; incluir<br>precalificaciónpor oportunidad.|Historial de oportunidades preservado.|
|Nota interna de seguimiento|Autor, Interest, fecha, nota mínima, sin<br>documentación financiera/tributaria.|Visible solo a ADMIN autorizado.|
||ADMIN, dataset, fecha/hora, filtros y||
|Exportación CSV|cantidad de filas; campos con PII según<br>permisos.|No guardar el CSV completo en el log.|
|Cambio deprivilegio|Actor, objetivo, razónyfecha.|Gestionado fuera delpanel MVP, auditado.|



### **Exportación estructurada** 

Cuatro datasets normalizados y auditados: emprendedores.csv, propietarios.csv, inmuebles.csv e intereses.csv. Incluir IDs estables, atributos estructurados, fechas y estados; intereses: CONTACT/VISIT, estado comercial, precalificación, snapshot original de renta, responsable e intentos (sin exportar notas por defecto). UTF-8, protecciones anti-fórmulas CSV y filtros autorizados. Uso EXCLUSIVAMENTE INTERNO de MiLocal; no ceder, vender ni compartir bases o reportes como producto. 

Documento vivo - Octubre 2026 

Página 15 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 13 / ANALÍTICA, OBSERVABILIDAD Y FUTURAS MÉTRICAS DE MERCADO</mark>** 

## **Analítica, observabilidad y futuras métricas de mercado** 

SEG-06/07: GA4 y Clarity son opciones sustituibles, sujetas a LEGAL-06, no decisiones técnicas irrevocables. Analítica externa solo UX/eventos permitidos sin PII ni sesión ADMIN. KPI internos con definiciones versionadas, metas 200/50 configurables y embudo visitas de ficha → clic CTA → Interest válido → contacto → precalificación → visita coordinada/realizada → WON confirmado. Las cifras utilizadas para explicar el embudo son ILUSTRATIVAS, no resultados reales. 

### **Controles propuestos para instrumentación** 

- Enviar eventos desde una capa propia desacoplada del proveedor y con un diccionario de campos permitido. Un cambio de herramienta de analítica no debe obligar a reconstruir los flujos de negocio ni las métricas internas. 

- No enviar a GA4/Clarity nombres, email, teléfono, dirección exacta, presupuesto individual, respuestas personales, comentarios o notas CRM, documentos, claves, identificadores directos de cuentas ni atributos que permitan reidentificación. 

- Exclusión total de /admin, pantallas con PII y campos de contacto en herramientas de replay. Probar masking y eventos reales antes de activar; auditoría interna no se sustituye por analytics. 

|**TIPO DE DATO / EVENTO**|**ANALÍTICA EXTERNA**|**BACKOFFICE AUTORIZADO**|
|---|---|---|
|Ficha abierta / clic CTA|Sí, eventopermitido, sin PII.|Sí, medición del embudo.|
|Solicitud enviada|Conversión sin identidad.|Sí, Interest con usuario + inmueble.|
|Nombre, teléfono, presupuesto|No.|Solo personal autorizado cuando<br>corresponda.|
|Precalificación y notas|No, ni sesión grabada.|Estado operativo por oportunidad; notas<br>privadas.|
|Acciones ADMIN / CSV|No.|Auditoría interna con actor, fechayalcance.|



- Definir con revisión jurídica aviso/consentimiento y configuración proporcional de medición UX, evitando banners invasivos innecesarios pero sin saltar controles exigibles. 

- Generar métricas internas agregadas por comuna, rubro, tipo, renta o etapa comercial, con tamaños mínimos de segmento; no facilitar consultas que reidentifiquen a personas. Reportería externa/comercialización de informes o datasets: WONT MVP 1, exigir cambio de alcance y evaluación legal posterior. 

- Diccionario versionado de eventos/KPI: distinción obligatoria entre property_view, interest_cta_click, interest_submitted, VISIT solicitado, VISIT_SCHEDULED, VISIT_COMPLETED, precalificación y WON. Definir numerador, denominador, fecha, zona horaria, exclusiones, datos permitidos y retención. 

### **Roadmap de datos sin anticipar matching** 

|**ETAPA**|**CAPACIDAD**|**LÍMITE**|
|---|---|---|
|MVP 1|Conteos, embudos, visitas, solicitudes,<br>resultados, exportación CSV.|Uso interno MiLocal únicamente. Sin<br>matchingenpantalla ni venta de datos.|
|Evolución|Tasas por comuna, tiempo de cierre,<br>demanda no satisfecha, reportería.|Ampliar reportería interna con control de<br>acceso, privacidad y minimización; no<br>reportes comercializables a terceros en<br>MVP 1.|
|Motor futuro|Compatibilidad estructurada y evaluación<br>algorítmica.|Nuevo análisis de riesgos, transparencia y<br>eventual evaluación de impacto.|



Documento vivo - Octubre 2026 

Página 16 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 14 / PROVEEDORES, INFRAESTRUCTURA Y TRANSFERENCIAS INTERNACIONALES</mark>** 

## **Proveedores, infraestructura y transferencias internacionales** 

|**SERVICIO**|**USO PREVISTO**|**CONTROL A VERIFICAR**|
|---|---|---|
|Supabase / servicio equivalente|Auth, PostgreSQL, Storage|Región de alojamiento; contratos; RLS;<br>respaldos; llaves; subencargados.|
|Vercel / hosting equivalente|Frontend, funciones y entrega|Accesos, logs, variables de entorno,<br>regiones de ejecución.|
|GitHub / repositorio equivalente|Código y migraciones|Titularidad corporativa; 2FA; secretos fuera<br>del código; revisiones.|
|GA4|Eventos y funnel|Información transferida, políticas,<br>configuración deprivacidad.|
|Microsoft Clarity|Comportamiento UX|Enmascaramiento, retención, datos<br>enviados; base legal/aviso.|
|Correo transaccional|Verificación y avisos de solicitudes|Proveedor final pendiente; contratos,<br>registrosyacceso autorizado.|



LEGAL SEG-05: proveedores definitivos y sus regiones, subencargados, contratos y transferencias se validan según configuración REAL. Supabase/Vercel/GitHub/GA4/Clarity y servicio transaccional son referencias sustituibles; revisar acceso, minimización, reversibilidad y eliminación contractual antes de producir. 

### **Checklist de alta de proveedor** 

- Determinar si el proveedor procesa PII, la finalidad, región, subencargados, medidas de acceso, borrado y las transferencias internacionales aplicables. 

- Identificar país(es) de procesamiento y transferencia internacional cuando exista. 

- Revisar condiciones de tratamiento (DPA/encargo), autorizaciones de subencargados y seguridad. 

- Revisar borrado/retorno de datos al terminar contrato, exportabilidad, respaldo y dependencia técnica. 

- Registrar nombre y titular de cada cuenta corporativa, administrador, región, contrato/plan, costo total, exportación, revocación de accesos y procedimiento de cambio o salida. Al reemplazar un proveedor, verificar tratamiento y borrado residual de datos. 

Documento vivo - Octubre 2026 

Página 17 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 15 / RETENCIÓN, ARCHIVO Y ELIMINACIÓN DE DATOS</mark>** 

## **Retención, archivo y eliminación de datos** 

Matriz de retención por categoría y finalidad: definir plazos legales y operativos, eventos disparadores, visibilidad pública/privada, anonimización, excepciones, respaldos y responsable. No fijar tiempos jurídicos sin LEGAL-03. 

|**CATEGORÍA**|**DISPARADOR**|**DESTINO / TRATAMIENTO**|**PLAZO**|
|---|---|---|---|
|Borrador anónimo|Inactividad / registro|Caduca máximo a 7 días; si se<br>registra, vincular; si no, limpiar.|Aprobado: 7 días.|
|Cuenta / perfil|Solicitud de eliminación|Desactivar; ejecutar<br>supresión/anón. según reglas y<br>excepciones.|LEGAL: pendiente.|
|||PUBLISHED→UNPUBLISHED:<br>no visible ni capta nuevos||
|Propiedad pausada|UNPUBLISHED|intereses; último check de<br>disponibilidad para alerta<br>interna ~30 días, sin retiro<br>automático.|LEGAL: pendiente.|
|Propiedad archivada|Archivo / solicitud de<br>eliminación|ARCHIVED/retirada: no publica<br>ni capta leads nuevos, conserva<br>histórico privado sujeto a<br>política; arriendo externo no se<br>atribuye a MiLocal.|LEGAL: pendiente.|
|Intereses y notas CRM|Cierre o inactividad comercial|Estados y precalificación por<br>oportunidad, snapshot de renta<br>original y notas mínimas;<br>conservar con motivo y plazo<br>revisados.|LEGAL: plazo/versionado<br>pendientes; parametrizar<br>política.|
|Audit logs y exports|Evento administrativo|Limitar acceso; política de<br>retenciónprotegida.|LEGAL: pendiente.|
|||Expiración y restauración||
|Backups / objetos Storage|Rotación de respaldo /<br>eliminación|controladas con fotos incluidas;<br>evitar reversión de<br>eliminaciones/rectificaciones.|TÉCNICO + LEGAL: pendiente.|
|||Configurar retención/acceso de||
|Analítica externa|Evento de medición|proveedor y eventuales<br>consentimientos.|LEGAL + TÉCNICO: pendiente.|



**ERROR FRECUENTE A EVITAR** No traducir “despublicar” o “soft-delete” como “eliminar todos mis datos”. En la interfaz se debe explicar con lenguaje claro el efecto inmediato y el procedimiento separado de supresión definitiva. 

Documento vivo - Octubre 2026 

Página 18 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 16 / EJERCICIO DE DERECHOS Y SOLICITUDES DE PRIVACIDAD</mark>** 

## **Ejercicio de derechos y solicitudes de privacidad** 

APROBADO SEG-04: canal institucional único de privacidad y registro interno de casos. Durante MVP la gestión puede ser manual, con responsable y suplente, verificación proporcionada, escalamiento y respuesta dentro de plazos legalmente confirmados. Los textos del canal se publicarán antes del lanzamiento. 

- 1. Recibir solicitud de acceso, rectificación, supresión, oposición, bloqueo u otros derechos aplicables y generar registro interno. 

- 2. Verificar identidad de forma proporcionada sin pedir documentos de identidad por defecto ni exponer datos de terceros. 

- 3. Determinar qué datos y sistemas están involucrados: Auth, perfiles, propiedades, Interest, fotos, exports, backups y proveedores. 

- 4. Revisar la base y excepción legal aplicable; bloquear o limitar usos mientras se resuelve si procede. 

- 5. Ejecutar respuesta, corrección, anonimización o supresión según decisión revisada; conservar evidencia mínima de la gestión. 

- 6. Comunicar resultado y alternativas de reclamación conforme a normativa, en plazo legal validado. 

- 7. Asegurar que la supresión o rectificación no sea revertida indebidamente por restauraciones de respaldos. 

### **Dependencias relevantes** 

PRD 04 gestiona acceso y solicitud de borrado; PRD 05 rectificación y preferencias; PRD 06 vigencia, auto-publicación y archivo; PRD 07 interés único y retiro de ficha; PRD 08 CRM, CSV, auditoría y control de accesos. Las reglas se consideran CONSOLIDADAS documentalmente, no legalmente certificadas. 

Documento vivo - Octubre 2026 

Página 19 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 17 / GESTIÓN DE INCIDENTES Y RECUPERACIÓN</mark>** 

## **Gestión de incidentes y recuperación** 

**SEG-10: antes de producción, asignar responsables nominales de incidentes, privacidad y suplentes; definir severidad, criterios de contención, comunicaciones sujetas a revisión jurídica, bitácora segura y protocolos de recuperación. OPS-02 sigue pendiente hasta la asignación efectiva.** 

- Detectar: alerta de proveedor, comportamiento anómalo, reporte de usuario o monitoreo. 

- Contener: restringir token/permiso comprometido, pausar una API, preservar evidencia con acceso limitado. 

- Evaluar: qué datos, titulares, servicios y operaciones pueden estar comprometidos; clasificar criticidad. 

- Escalar: responsables técnicos, operativos y asesoría legal; decidir comunicaciones regulatorias/personas según ley. 

- Recuperar: restauración verificada, corrección de causa raíz, rotación de secretos y controles complementarios. 

- Documentar: bitácora cronológica, decisiones, costos, afectados, verificaciones y mejoras preventivas. 

MARCO JURÍDICO: la Ley 21.719 incorpora en el art. 14 sexies el deber de reportar vulneraciones relevantes a la autoridad sin dilaciones indebidas cuando exista riesgo razonable, y contempla comunicaciones a titulares en supuestos determinados. La evaluación y la respuesta exacta requieren asesoría jurídica y la normativa vigente al momento del incidente. 

### **Recuperación ante fallas** 

|**ESCENARIO**|**PRIMERA RESPUESTA**|**RESPALDO NECESARIO**|
|---|---|---|
|Panel /admin falla|Bloquear operaciones riesgosas,<br>diagnósticoyrecuperación de despliegue.|Procedimiento de rollback + acceso soporte<br>técnico.|
|Supabase Studio / consola no disponible|No asumir que servirá como fallback<br>durante caída delproveedor.|Estado servicio + continuidad del proveedor<br>+plan alterno.|
|Datos borrados/alterados|Aislar, evaluar y restaurar de respaldo<br>probado.|Versionado de esquema +<br>snapshot/restauración verificable.|
|Credencial filtrada|Revocar y rotar secretos, revisar eventos y<br>accesos.|Inventario secreto y responsables<br>autorizados.|
|Despliegue defectuoso|Revertir versión y revisar compatibilidad<br>con migraciones DB.|GitHub + despliegue versionado + runbook.|



Documento vivo - Octubre 2026 

Página 20 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 18 / BACKUPS, AMBIENTES, CONTINUIDAD Y PORTABILIDAD TECNOLÓGICA</mark>** 

## **Backups, ambientes, continuidad y portabilidad tecnológica** 

SEG-09/11/17: staging separado, migraciones controladas, accesos corporativos y respaldos de base de datos MÁS imágenes, junto con prueba documentada de restauración de relaciones usuarios–inmuebles–intereses. RPO/RTO, frecuencia, proveedor, región y costos siguen sujetos a OPS-01. Consolas técnicas no sustituyen backup independiente ni continuidad ante caída de proveedor. 

### **Parámetros por cerrar con proveedor técnico** 

|**CONTROL**|**DECISIÓN PROPUESTA**|**CIERRE**|
|---|---|---|
|Frecuencia de respaldo|Referencia a contrastar: respaldo al menos<br>diario donde sea viable; no es SLA ni<br>capacidad confirmada.|TÉCNICO: establecer RPO y capacidad<br>real del plan.|
||Objetivo inicial tentativo: restauración||
|Tiempo de recuperación|dentro de 48 horas, sujeto a costo, plan y<br>prueba técnica; no prometer sin<br>verificación.|TÉCNICO: fijar RTO.|
|Restauración|Probar con datos ficticios o entorno<br>restringido.|MUST antes de producción.|
|Imágenes|Respaldar también archivos y<br>metadatos/orden de fotos.|TÉCNICO: incluir Storage en plan.|
|Migraciones|Script de esquema + control GitHub.|MUSTpara cambios estructurales.|
|Portabilidad|Exportar datos y código; limitar<br>acoplamiento de negocio.|TÉCNICO: plan de salida proveedor.|
|Cambios urgentes|Acceso técnico excepcional con<br>aprobación/documentación.|MUST: procedimiento de emergencia.|



### **Supabase Studio como herramienta excepcional** 

SEG-11: Supabase Studio o consola equivalente solo para emergencia y diagnóstico de personal técnico nominal, con MFA, motivo, log y respaldo previo. No dar por hecho que estará disponible si el proveedor cae. Documentar recuperación de credenciales y permisos, rollback, incidentes de integridad y migración de proveedor (OPS-03). 

Documento vivo - Octubre 2026 

Página 21 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 19 / VALIDACIÓN DE RIESGOS PARA EL FUTURO MOTOR DE COMPATIBILIDAD</mark>** 

## **Validación de riesgos para el futuro motor de compatibilidad** 

SEG-08: MVP 1 NO utiliza matching/scoring ni decisiones automáticas para aceptar, descartar o calificar candidatos. Preservar IDs, valores declarados, No / No informado / No aplica, fechas y resultados reales para una evolución futura que requerirá una nueva decisión de producto y evaluación legal de perfilado, finalidad, transparencia, sesgos e impacto cuando proceda. 

|**RIESGO FUTURO**|**CONTROL PREPARATORIO**|
|---|---|
|Reutilización no informada|Registrar finalidad original, base jurídica y compatibilidad de<br>reutilización.|
|Datos incompletos convertidos en negativos|Preservar No / No informado / No aplica e Indiferente / No sé según<br>taxonomías acordadas; evitar negativos inferidos.|
|Perfilado intensivo|Evaluar necesidad de DPIA bajo supuestos legales<br>correspondientes.|
||No contemplada: no compartir, vender ni publicar datasets o|
|Divulgación de inteligencia de mercado a terceros|reportes de mercado. Cualquier propuesta posterior requiere<br>decisión expresayevaluaciónjurídicaprevia.|
|Calidad del ranking|Versionado de categorías, timestampsyfuente de respuesta.|
|Cambio deproveedor analítico|Capa de instrumentación independienteyexportabilidad.|



Documento vivo - Octubre 2026 

Página 22 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 20 / MATRIZ DE REQUISITOS POR PRIORIDAD</mark>** 

## **Matriz de requisitos por prioridad** 

|**NIVEL**|**CONTROLES**|**CRITERIO**|
|---|---|---|
|MUST MVP|Autorización backend/RLS, email verificado<br>para publicar/interés, MFA privilegiado,<br>audit de CRM/precalificación/CSV,<br>publicación automática + revisión posterior,<br>privacidad de mapa/API, EXIF/GPS,<br>analytics sin PII, backups restaurables y<br>gatejurídico.|No lanzar sin prueba técnica y, donde<br>corresponda, validación legal.|
|SHOULD MVP|Controles proporcionados de rate limiting y<br>monitoreo; reportería avanzada fuera de<br>alcance. Cuando intervienen PII o replay,<br>masking/exclusión y controles pasan a<br>MUST antes de usar el servicio.|Implementar con esfuerzo proporcionado;<br>críticos de riesgo pasan a MUST.|
|FUTURO|OTP teléfono y KYC documental, carga de<br>antecedentes en app, IA/matching<br>automático, agenda/CRM empresariales,<br>informes comercializablesyBI externo.|Fuera de alcance funcional MVP salvo<br>cambio aprobado.|



**ALCANCE** Esta matriz clasifica controles de forma preliminar. La revisión CONS debe contrastarla contra los MUST/SHOULD de cada PRD y las obligaciones legales antes de autorizar cambios de alcance o presupuesto. 

Documento vivo - Octubre 2026 

Página 23 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 21 / RESPONSABLES, ARTEFACTOS Y GATE DE PRODUCCIÓN</mark>** 

## **Responsables, artefactos y gate de producción** 

|**RESPONSABLE**|**OBLIGACIÓN DE ENTREGA**|
|---|---|
|Founders / producto|Definir responsable jurídico, finalidades, modelo de operación,<br>prioridadesy presupuesto; aprobar textos finales.|
|Operación MiLocal|Administrar permisos, contactos/visitas, solicitudes de privacidad,<br>notasyseguimiento de incidentes.|
|Desarrollo / seguridad|Implementar RBAC/RLS, APIs, controles de fotos, logs,<br>exportaciones, backups,pruebasyrunbooks.|
|Asesoría jurídica externa|Validar bases, avisos, contratos, transferencias, conservación,<br>derechosynotificaciones.|
|QA / producto|Verificar flujos de ambos roles y matriz de permisos; mantener<br>evidenciaycasos negativos.|



### **Gate mínimo antes de permitir usuarios reales** 

- SEG-01/02/03/04/17: responsable y canal de privacidad reales, bases y T&C/avisos validados, registro sencillo, preferencias voluntarias de marketing y oportunidades proactivas independientes, retención/ejercicio de derechos con evidencia. 

- SEG-05/06/07: inventario firmado de proveedores y regiones; analítica configurada y legalmente revisada; prohibición de vender/compartir inteligencia comercial en MVP; PII y /admin excluidos de eventos/replay. 

- SEG-12/13/14/16: backend/RLS y MFA probados; CONTACT/VISIT solo al equipo MiLocal; fotos EXIF/GPS saneadas; publicación automática y alerta ADMIN post-publicación; auditoría de notas, precalificación y 4 CSV. 

- SEG-01/10/11: accesos nominales revocables y MFA para ADMIN/técnicos, responsables/suplentes, recuperación y runbooks de caída sin dependencia total de una consola de proveedor. 

- SEG-04/09/10/17: runbook de incidentes, pruebas de restauración base de datos + fotos + relaciones CRM, derechos y supresión reproducibles, políticas versionadas y control de cambios. 

- SEG-03/15: retención y supresión con plazos jurídicos definidos; servicio destinado a mayores de 18 años con declaración simple validada en términos, sin KYC documental en MVP. 

- SEG-13: todo Interest CONTACT/VISIT válido llega a MiLocal con confirmación honesta; propietario sin notificación automática ni PII del solicitante. Compartición manual mínima, informada y trazada; WON solo con mediación MiLocal verificada. 

Documento vivo - Octubre 2026 

Página 24 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 22 / MATRIZ DE VERIFICACIONES PARA LA AUDITORÍA CONS</mark>** 

## **Matriz de verificaciones para la auditoría CONS** 

La auditoría de 79 CONS ya fue resuelta y aplicada en PRD 01–08 v1.0 mediante 96 ajustes aprobados. Esta matriz se conserva como CONTROL DE REGRESIÓN transversal para verificar la implementación real y detectar desviaciones, no como una ronda de decisiones pendientes. 

|**ID**|**PRD**|**QUÉ VERIFICAR**|
|---|---|---|
|SEC-CONS-01|01 / 02 / 03 / 04|Avisos/versiones, marketing y<br>oportunidades proactivas SEPARADOS,<br>analytics sin PII, con alcance y permiso<br>consistentes.|
|SEC-CONS-02|02 / 03 / 04 / 05|Assessment y perfil independientes,<br>borrador anónimo 7 días, verificación email,<br>registro exprés; MFA soloprivilegiado.|
|||Dirección/contactos privados, mapa con|
|SEC-CONS-03|03 / 06 / 07 / 08|pines aproximados, sin datos del oferente ni<br>interesados en APIpública.|
|SEC-CONS-04|06 / 07|1–12 fotos, saneamiento EXIF/GPS,<br>publicación automática con revisión ADMIN<br>posterior no bloqueante y retirada de<br>medios.|
|SEC-CONS-05|04 / 06 / 08|Eliminar cuenta/propiedad, soft-delete,<br>retenciónyderechos de titulares.|
|||Intentos repetidos/único Interest,|
|SEC-CONS-06|07 / 08|CONTACT/VISIT sin agenda, estado<br>comercial y precalificación por oportunidad,<br>snapshots de rentayauditoría.|
|SEC-CONS-07|04 / 08|ADMIN operativo vs técnico, MFA,<br>revocación, logging yresiliencia.|
|SEC-CONS-08|01 / 02 / 03 / 07 / 08|GA4/Clarity, campos permitidos, event<br>schema, configuración deprivacidad.|
|||DRAFT/PUBLISHED/UNPUBLISHED/|
|SEC-CONS-09|06 / 08|ARCHIVED, cola interna revisión posterior,<br>moderación y bloqueo de republicación sin<br>liberación ADMIN.|
|||QA seguridad, 4 CSV, KPIs e hitos;|
|SEC-CONS-10|Todos|<br>legal/ops no se declaran concluidos por<br>existir PRD v1.0.|



### **Método de resolución** 

Secuencia actual: (a) decisiones 79 CONS y 96 AJ aprobadas; (b) ocho PRD v1.0 consolidados; (c) este Anexo v1.0; (d) verificación documental final cruzada y PRD Maestro v1.0; (e) desarrollo/QA y cierre independiente de LEGAL-01–08, OPS-01– 03 antes de producción. Un hallazgo nuevo se escala expresamente, no se modifica unilateralmente. 

Documento vivo - Octubre 2026 

Página 25 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 23 / DECISIONES JURÍDICAS Y OPERATIVAS PENDIENTES DE CIERRE</mark>** 

## **Decisiones jurídicas y operativas pendientes de cierre** 

|**ID**|**ASUNTO**|**PORQUÉ NO ESTÁ CERRADO**|
|---|---|---|
|LEGAL-01|Identidad/razón social responsable de datos|No especificada de manera concluyente en<br>los PRD.|
|LEGAL-02|Bases por finalidad y avisos|Requiere análisis jurídico concreto y<br>producto final.|
|LEGAL-03|Retención: cuentas, CRM, propiedades,<br>audit, backups|Sin períodos válidos aprobados; no<br>inventarlos.|
|LEGAL-04|Derechos: canal, verificación, plazos,<br>procedimiento|Debe revisarse conforme a ley y operación<br>real.|
|LEGAL-05|Proveedores y transferencias<br>internacionales|Depende de contratos, regiones y<br>configuración real.|
|LEGAL-06|Analítica GA4/Clarity y tecnologías de<br>seguimiento|Necesita base/aviso/consentimiento según<br>implementación.|
|||SEG-07: NO compartir, vender ni divulgar|
|LEGAL-07|Uso de datos para inteligencia de mercado,<br>exclusivamente interna|informes comerciales. Solo analítica propia,<br>con base legal/controles y posibilidad de<br>revisión futura mediante decisión explícita.|
|LEGAL-08|Impacto legal futuro del matching / perfilado|Necesita revisión específica antes del<br>motor.|
|OPS-01|RPO/RTO, backuprealycosto delplan|Proveedory presupuesto no confirmados.|
|OPS-02|Responsables de respuesta incidentes y<br>derechos|Asignaciones nominales pendientes.|
|OPS-03|Límites de acceso técnico y proceso de<br>recuperación|Requiere verificación operativa en<br>plataformas concretas.|



Documento vivo - Octubre 2026 

Página 26 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

**<mark>ANEXO / 24 / FUENTES Y TRAZABILIDAD</mark>** 

## **Fuentes y trazabilidad** 

FUENTES DE PRODUCTO: ocho PRD v1.0 de MiLocal MVP 1 y Anexo v0.2; decisiones SEG-01–18 (20-10-2026), 79 CONS y AJ-01–96 aprobadas para su integración. El Anexo v1.0 consolida lo ya resuelto funcionalmente, sin modificar unilateralmente alcance, presupuesto ni acuerdos legales. 

FUENTES NORMATIVAS: referencias BCN consultadas durante el trabajo original (20-10-2026), sujetas a revalidación formal por asesoría legal antes de lanzamiento y al confirmar proveedor/fecha de producción: 

- Biblioteca del Congreso Nacional, Ley 19.628, versión vigente hasta 30-11-2026: https://www.bcn.cl/leychile/Navegar? idNorma=141599&idVersion=2023-05-09 

- Biblioteca del Congreso Nacional, Ley 21.719, publicación 13-12-2024; vigencia diferida 01-12-2026: https://www.bcn.cl/leychile/Navegar?idNorma=1209272 

- Ley 21.719, art. 14 quinquies (seguridad), art. 14 sexies (reportes de incidentes), art. 15 bis (encargados), art. 15 ter (evaluaciones de impacto), art. 28 (transferencias), consulta en BCN. 

- BCN, normativa/regulación complementaria y versiones futuras: revisar nuevamente antes de pasar a producción y al cerrar los documentos legales. 

### **Definición de terminado del anexo** 

Definición de TERMINADO DOCUMENTAL: ocho PRD y anexo con decisiones SEG, 79 CONS y AJ-01–96 incorporadas, estados alineados y pruebas definidas. Esto NO equivale a gate de producción: LEGAL-01–08 y OPS-01–03 siguen abiertos hasta evidencia técnica, asignaciones y revisión jurídica. 

**PRÓXIMO HITO  Tras cerrar este Anexo v1.0: comprobación final de consistencia con PRD 01–08 v1.0 y elaboración del PRD Maestro v1.0. En paralelo, responsables técnicos y legales deben resolver LEGAL-01–08 y OPS-01–03 para habilitar producción. No reabrir decisiones funcionales sin hallazgo concreto.** 

Documento vivo - Octubre 2026 

Página 27 

**MILOCAL  /  MVP 1  /  ANEXO TRANSVERSAL** 

#### **<mark>ANEXO / 25 / DECISIONES SEG-01–18 Y ESTADO DE CIERRE</mark>** 

## **Registro de decisiones SEG-01–18 aprobadas** 

Los 18 acuerdos SEG permanecen vigentes y se complementan con CONS/AJ aprobados. «Aprobado funcionalmente» NO significa que la implementación ya haya sido auditada o que las obligaciones legales, contratos y proveedores hayan sido verificados. 

|**ID**|**ACUERDO INCORPORADO**<br>|**CIERRE EXTERNO / EVIDENCIA**|
|---|---|---|
|SEG-01|Responsable jurídico y canal institucional,<br>sin inventar razón social.|Legal: identificación efectiva.|
||Registro en un paso; marketing y<br>||
|SEG-02|oportunidades proactivas separados,<br>opcionales y revocables; comunicaciones<br>operativaspor finalidad.|Legal: bases y textos; QA UX.|
|SEG-03|Retención por categoría parametrizable y<br>revisable ante cambios.|Legal: plazos; QA supresión/backups.|
|SEG-04|Canal de derechos con seguimiento y<br>verificaciónproporcionada.|Legal: derechos/plazos; operación.|
|SEG-05|Inventario de proveedores, regiones, DPA,<br>transferenciasysalida.|Legal/tecnología: contratos.|
||Analítica UX con eventos permitidos sin PII,||
|SEG-06|<br>sesiones /admin excluidas; GA4/Clarity<br>sustituibles.|Legal/QA: avisos y masking.|
|SEG-07|Inteligencia de mercado de uso<br>EXCLUSIVAMENTE INTERNO. No<br>compartir ni vender.|Legal: finalidad y minimización.|
|SEG-08|Motor futuro: análisis independiente de<br>perfilado, riesgoylegalidad.|Futuro, antes de activar matching.|
|SEG-09|Backups de BD y fotos, restauración de<br>prueba, objetivos tentativos.|Técnico: RPO/RTO y plan real.|
|SEG-10|Responsables y suplentes de incidentes,<br>ruta de respuesta.|Operación: nombres/contactos.|
|SEG-11|Consola técnica excepcional, no fallback<br>ante caída total;portabilidad.|Técnico: runbooks y permisos.|
|SEG-12|MFA obligatorio en ADMIN/técnicos;<br>explicaciónyrecuperación separadas.|QA: prueba MFA/revocación.|
||Interest único CONTACT/VISIT recibido por||
|SEG-13|MiLocal; precalificación y gestión manual;<br>compartir mínimo solo de forma informada.|Legal/QA: aviso, trazabilidad.|
||Imágenes públicas 1–12 saneadas||
|SEG-14|<br>EXIF/GPS y revisión ADMIN posterior sin<br>gateprevio.|QA técnica real.|
|SEG-15|MVP para mayores de 18, declaración<br>simple sin KYC obligatorio.|Legal: términos y edad.|
||Auditar permisos, revisión/moderación||
|SEG-16|<br>posterior, estado y precalificación de<br>Interest, notas mínimasycuatro CSV.|QA: logs sin PII excesiva.|
|SEG-17|Versiones de términos/avisos y<br>consentimiento separado.|Legal/QA: evidencias.|
||Controles SEG + AJ integrados;||
|SEG-18|LEGAL/OPS abiertos hasta evidencia<br>técnica, legal y operativa antes de<br>producción.|Gate: revisión técnica + legal.|



### **Qué queda pendiente para el proyecto** 

Antes de operar con usuarios reales: definir responsable/canal, aprobar avisos/bases jurídicas, identificar proveedores y regiones, configurar analytics sin PII, designar responsables y suplentes, verificar accesos/MFA, probar backups y cerrar matriz LEGAL/OPS. La siguiente tarea DOCUMENTAL es la comprobación cruzada y el PRD Maestro v1.0. 

Documento vivo - Octubre 2026 

Página 28 

