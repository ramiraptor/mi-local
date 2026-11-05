**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 



**GUÍA DE EJECUCIÓN / GITHUB CONFIRMADO / PROVEEDORES PENDIENTES** 

# **MiLocal MVP1** 

# **Empezar a construir con Codex** 

Tutorial práctico, paso a paso, para desarrollar una base reutilizable sin integrar todavía servicios definitivos. 

|**CONTROL**|**DEFINICIÓN**|
|---|---|
|**Versión**|0.1 · guía de inicio para evaluación y ejecución gradual|
|**Base documental**|PRD Maestro v1.0 + PRD 01–08 v1.0 + Anexo v1.0|
|**Arquitectura**|Propuesta de Arquitectura de Solución v0.1 · no aprobada|
|**Confirmado**|GitHub para código fuente, revisiones y control de<br>versiones|
|**No seleccionado**|Framework, BD, Auth, hosting, fotos, mapas, correo y<br>analítica|
|**Destinatarios**|Socios de MiLocal, operador de Codex y revisores técnicos|



### **RESULTADO BUSCADO** 

Repositorio privado ordenado, interfaces y reglas de negocio verificables, datos ficticios, pruebas y documentación de puntos de integración. NO se pretende conseguir un sistema público listo para usuarios reales. 

Guía operativa complementaria. Si un paso contradice un PRD funcional, prevalece el PRD v1.0; si afecta tratamiento de datos, rige el Anexo Transversal. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   1 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

**00 / ENTENDER EL PLAN** 

# **La frontera: qué avanzamos y dónde nos detenemos** 

El objetivo NO es desarrollar un producto cerrado sobre una tecnología que aún no hemos elegido. Separaremos la experiencia, las reglas comerciales y los datos de prueba de los adaptadores que, más adelante, hablarán con proveedores reales. 

|**SÍ CONSTRUIREMOS / PROBAREMOS**|**TODAVÍA NO INTEGRAREMOS**|
|---|---|
|**Componentes visuales responsive y flujos de navegación**|Hosting público, dominio de producción y despliegue real|
|**Validaciones de formularios y estados del negocio**|Proveedor de autenticación y MFA reales|
|**Datos de ejemplo y repositorios simulados**|Base de datos hospedada y migraciones productivas|
|**Fichas, galería de imágenes ficticias y mapa simulado**|Storage de fotos, tiles/geocodificación de pago|
|**Intereses y mini-CRM de prueba con escenarios**|Email transaccional, notificaciones externas y analítica|
|**Tests unitarios/E2E y contratos de integración**|Usuarios reales, KYC documental o comunicaciones reales|



## **El criterio de salida de esta guía** 

Se llega a un prototipo ejecutable y reproducible, con datos ficticios, componentes reutilizables, servicios simulados y evidencia de pruebas. Las pantallas pueden existir y los flujos pueden demostrarse, pero sus datos aún no son persistentes ni seguros como servicio real. 

### **STOP / PUNTO DE DETENCIÓN** 

No sustituir mocks por servicios externos, no desplegar públicamente, no activar registro real ni invitar usuarios de prueba con datos personales hasta cerrar las decisiones de arquitectura, permisos, respaldo y LEGAL/OPS. 

## **Ruta condensada** 

|**SECUENCIA**|**ENTREGABLE COMPROBABLE**|
|---|---|
|**1 · Repositorio**|GitHub privado con README y responsables|
|**2 · Codex**|Entorno vinculado; primera tarea de diagnóstico|
|**3 · Contratos**|Reglas, interfaces y fixtures sin proveedores|
|**4 · Módulos**|Pantallas y flujo de los ocho PRD con datos ficticios|
|**5 · QA**|Pruebas, demostración y backlog de integración|
|**6 · Pausa**|Revisión con técnico / selección tecnológica|



MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   2 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **01 / GITHUB** 

# **Crear la base del proyecto sin perder control** 

GitHub es la única herramienta confirmada. El repositorio debe pertenecer a MiLocal o, si aún no existe una organización, quedar preparado para transferirse a su control institucional. 

- **01** Abrir GitHub y crear un repositorio nuevo. Nombre sugerido: milocal-mvp1; visibilidad: PRIVATE. 

- **02** Agregar un README inicial y un .gitignore cuando se elija el lenguaje; no publicar archivos de configuración con secretos. 

- **03** Invitar solo a colaboradores autorizados mediante cuentas personales; activar MFA en las cuentas con permisos críticos. 

- **04** Mantener main como referencia estable; trabajar por ramas feature/* y revisar cambios mediante pull requests (PR). 

- **05** Crear carpetas docs/producto, docs/arquitectura y docs/decisiones. Subir copias de trabajo de los PRD solo al repositorio privado y con los permisos correctos. 

- **06** Crear un tablero/Issues para registrar cada PRD, decisiones pendientes, pruebas y observaciones; no necesitamos un gestor adicional. 

## **Estructura inicial sugerida** 

**REFERENCIA VISUAL: ÁRBOL DE CARPETAS (NO OBLIGA A ELEGIR FRAMEWORK)** 

milocal-mvp1/ README.md AGENTS.md                  # reglas breves para Codex docs/producto/             # PRD Maestro + referencias docs/arquitectura/         # propuesta v0.1 y decisiones docs/decisiones/           # ADR abiertos src/                       # se crea tras definir stack mínimo tests/                     # tests cuando exista código 

### **CONTROL DE PROPIEDAD** 

El repositorio, el historial, las ramas y los entregables pertenecen a MiLocal. Evitar que el único administrador sea un proveedor externo. 

### **EVIDENCIA PARA AVANZAR** 

Repositorio privado creado; README visible; permisos de socios revisados; main identificada; carpeta docs disponible. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   3 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **02 / CODEX** 

# **Conectar Codex al repositorio y probar el acceso** 

Camino recomendado para comenzar sin instalar servidores: Codex Cloud, si está disponible en tu cuenta. Alternativamente, Codex en tu computador mediante la aplicación, extensión o CLI. Las pantallas pueden variar según la versión y el plan. 

## **Opción A · Codex Cloud (web o escritorio)** 

- **01** Entrar a Codex desde la web o aplicación de escritorio e iniciar sesión con la cuenta de ChatGPT habilitada. 

- **02** Autorizar la conexión con la cuenta GitHub que tiene permiso sobre milocal-mvp1. 

- **03** Crear y publicar un entorno para el repositorio según los controles disponibles. Seleccionar el repositorio correcto y habilitar solo los permisos necesarios. 

- **04** Comenzar con una tarea de lectura: pedir inventario de archivos y estado del repositorio, sin hacer cambios. 

- **05** Una vez validado, pedir una rama de trabajo y una PR pequeña; revisar el diff y las pruebas antes de integrarla. 

## **Opción B · Codex en computador** 

El desarrollador puede clonar el repositorio y usar Codex con su editor o CLI. Esta opción facilita levantar la app localmente y probarla desde el navegador. No requiere elegir Vercel ni Supabase. 

### **DIFERENCIA IMPORTANTE** 

La conexión de GitHub para lectura desde un chat NO garantiza que Codex pueda escribir en el repositorio. Hay que verificar que la tarea tenga acceso de escritura y revisar las PR. Nunca entregar credenciales por el chat. 

### **PRIMERA TAREA EN CODEX (SOLO DIAGNÓSTICO)** 

Analiza el repositorio privado milocal-mvp1. NO escribas código, NO instales dependencias y NO hagas commits. Resume estructura existente, riesgos, documentos disponibles y permisos requeridos. Propón el siguiente cambio mínimo y espera mi aprobación antes de modificar archivos. 

### **EVIDENCIA PARA AVANZAR** 

Codex puede leer el repositorio correcto; la primera tarea es solo diagnóstico; no se han conectado servicios externos. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   4 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **03 / FUENTES Y REGLAS** 

# **Convertir los PRD en instrucciones útiles para Codex** 

Codex no debería improvisar requisitos. El PRD Maestro da el contexto; cada PRD especializado define campos, flujos y QA. El Anexo define controles. La arquitectura v0.1 es una HIPÓTESIS que debe permanecer abierta. 

|**DOCUMENTO**|**PARA QUÉ SE UTILIZARÁ**|
|---|---|
|**PRD Maestro v1.0**|Visión, alcance, estados canónicos, flujos de extremo a<br>extremo.|
|**PRD 01–08 v1.0**|Requisitos, pantallas, campos y aceptación de cada módulo.|
|**Anexo Transversal v1.0**|Privacidad, MFA, auditoría, retención y requisitos de<br>lanzamiento.|
|**Arquitectura v0.1**|Alternativas; nunca tratar Next.js/Supabase/Vercel como<br>confirmados.|
|**AGENTS.md**|Instrucciones cortas y obligatorias para todas las tareas.|
|**docs/decisiones**|ADR abiertos: framework, BD, Auth, archivos, mapas,<br>hosting y correo.|



## **Reglas mínimas que debe contener AGENTS.md** 

- No agregar funcionalidades que no estén aprobadas en los PRD. 

- Solo GitHub está confirmado; cualquier stack mínimo requiere aprobación específica. 

- No usar datos personales reales, secretos, pagos ni servicios productivos. 

- Separar modelos, lógica comercial e interfaces de proveedores detrás de contratos. 

- No convertir “simulación” en promesa de seguridad o persistencia real. 

- Antes de escribir: presentar plan corto. Después: archivos modificados, pruebas y limitaciones. 

- Sin merges, pushes a producción ni cambios de infraestructura sin autorización. 

### **ENCARGO BREVE PARA CODEX** 

Lee PRD Maestro v1.0, PRD 01–08 v1.0 y Anexo v1.0. Propón un AGENTS.md conciso, una lista de requisitos por PRD y un registro ADR de decisiones técnicas abiertas. NO elijas proveedores por mi cuenta. NO escribas aplicación aún. 

### **EVIDENCIA PARA AVANZAR** 

Reglas del repositorio visibles; lista de módulos en Issues; decisiones tecnológicas abiertas documentadas. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   5 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **04 / FUNDACIONES** 

# **Elegir un mínimo de código, no un proveedor final** 

Aquí sí se necesita una decisión técnica acotada: lenguaje y mecanismo para ejecutar las pantallas. GitHub no ejecuta por sí solo una aplicación web. Conviene que un revisor técnico valide el mínimo para evitar rehacer interfaces. 

|**DECISIÓN**|**RECOMENDACIÓN DE ESTA FASE**|
|---|---|
|**Lenguaje**|TypeScript como candidato; no confundirlo con selección de<br>hosting.|
|**UI / framework**|React con entorno local simple, o Next.js si un técnico lo valida.<br>Aún no es definitivo.|
|**Estilos**|Sistema de componentes propio y tokens de marca MiLocal.|
|**Persistencia temporal**|Repositorios en memoria o fixtures JSON; no guardar usuarios<br>reales.|
|**Reglas comerciales**|Funciones y servicios desacoplados de base de datos externa.|
|**Contratos**|Interfaces explícitas para Auth, datos, fotos, mapas, correo y<br>analytics.|
|**Pruebas**|Unitarias y de interfaz; navegador local o entorno de preview<br>de Codex.|
|**Despliegue**|Solo entorno local/Codex de desarrollo, sin URL pública ni<br>usuarios reales.|



## **Orden de construcción de la estructura** 

- **01** Conseguir validación mínima del framework o mantener el trabajo limitado a contratos, fixtures y reglas puras. 

- **02** Crear carpetas separadas para dominio, interfaces, datos ficticios y componentes UI. 

- **03** Definir las entidades y enumeraciones del Maestro sin acoplarlas todavía a una base de datos. 

- **04** Preparar adaptadores FakeAuth, FakePropertyRepository, FakeInterestRepository y FakeNotificationService. 

- **05** Configurar formato, lint, comprobación de tipos y pruebas como condiciones de cada PR. 

### **NO CAER EN LA TRAMPA** 

Un login falso puede servir para probar navegación, pero NO demuestra protección real de datos. Simular MFA no equivale a implementarlo. No declarar que el producto está seguro o listo para beta. 

### **EVIDENCIA PARA AVANZAR** 

La aplicación arranca en desarrollo, muestra una pantalla de inicio y ejecuta pruebas sin credenciales de ningún proveedor. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   6 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

**05 / PRIMEROS MÓDULOS** 

# **Construir captación: PRD 01, 02 y 03** 

Empezaría por las experiencias más autónomas: Landing y assessments. Son ideales para validar diseño, formularios y estructura de datos antes de tocar autenticación o almacenamiento permanente. 

|**MÓDULO**|**QUÉ PEDIR A CODEX**|**CÓMO SE PRUEBA**|
|---|---|---|
|**PRD 01 · Landing**|Hero, dos CTA, navegación, secciones,<br>hasta 6 fichas ficticias.|Responsivo; CTA a selector de rol; fichas<br>abren detalle simulado.|
|**PRD 02 · Emprendedor**|Siete bloques, validaciones, comuna hasta<br>3, presupuesto CLP y edición.|Guardar en memoria; avanzar/volver sin<br>perder datos; estados correctos.|
|**PRD 03 · Propietario**|Seis bloques, oferente, datos del<br>inmueble, ubicación privada y<br>continuidad de DRAFT.|Múltiples inmuebles ficticios; atributos<br>triestado; ID estable.|



## **Criterios de producto que no deben perderse** 

- El assessment no es un requisito para explorar propiedades ni para registrar «Me interesa». 

- Presupuesto del emprendedor (`max_monthly_rent_clp`) y renta del inmueble (`monthly_rent_clp`) son 

- campos distintos. 

- Región/comuna y tipo de inmueble mantienen catálogos compartidos; no agregar Stand/Kiosco como tipo 

- separado. 

- Un borrador anónimo de siete días puede SIMULARSE; su seguridad y política de persistencia real quedarán 

- pendientes. 

### **PROMPT PARA EL PRIMER DESARROLLO VISUAL** 

Trabaja SOLO PRD 01, 02 y 03 con datos ficticios. Antes de escribir, enumera pantallas, estados y criterios QA. No integres Auth, base de datos, email, storage ni analítica. Usa componentes reutilizables y separa la lógica del diseño. Entrega cada PRD en PR independiente con pruebas y capturas. 

### **EVIDENCIA PARA AVANZAR** 

Landing y assessments navegables; validaciones probadas; sin llamadas a servicios de proveedores ni datos reales. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   7 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

**06 / IDENTIDAD VISUAL SIMULADA** 

# **PRD 04 y 05: continuidad, roles y perfiles** 

Podemos desarrollar las pantallas y probar cambios de contexto con usuarios ficticios. Lo que NO podemos certificar todavía es registro seguro, verificación real de email ni protección de las API. 

|**MÓDULO**|**PERMITIDO AHORA**|**SE RESOLVERÁ CON PROVEEDOR**|
|---|---|---|
|**PRD 04 · Registro**|Formularios y flujos, return_to, correo<br>pendiente/verificado SIMULADO,<br>cambio de rol.|Auth real, sesiones, email, MFA ADMIN<br>y backend protegido.|
|**PRD 05 · Perfil**|Edición de negocio/búsqueda, doble<br>contexto, estados de completitud y<br>preferencias.|Persistencia real, aislamiento entre<br>usuarios y supresión legal.|
|**Interoperabilidad**|Modelos y contratos sin proveedores,<br>pruebas de navegación.|Migraciones, permisos y política de<br>almacenamiento.|



## **La prueba del «Me interesa» sin assessment** 

- **01** Un visitante abre una propiedad ficticia y pulsa «Me interesa». 

- **02** El sistema muestra un registro simulado y conserva `return_to` de esa propiedad. 

- **03** Se simula correo verificado para comprobar exclusivamente la UX. 

- **04** El usuario vuelve al inmueble; PRD 07 podrá crear la solicitud de prueba sin assessment completo. 

### **CUATRO DIMENSIONES INDEPENDIENTES** 

Assessment: NOT_STARTED / IN_PROGRESS / COMPLETED. Perfil: Pendiente / Por completar / Completado. Estado comercial: NEW…WON/LOST. Precalificación: Sin revisar / No pertinente / Por validar / Calificado. Nunca mezclar estados en código ni en la interfaz. 

### **PROMPT PARA CODEX · PRD 04–05** 

Implementa la UX de PRD 04 y PRD 05 usando FakeAuth. La interfaz debe indicar claramente MODO DEMOSTRACIÓN. Incluye doble perfil y retorno a ficha tras registro. No guardes contraseñas, no emules seguridad de backend real y no declares MFA ni verificación de correo implementados. Pruebas: cambio de contexto, perfiles, permisos simulados. 

### **EVIDENCIA PARA AVANZAR** 

Se navega entre perfiles sin duplicar identidad; nadie confunde la demo con autenticación funcional. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   8 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **07 / OFERTA Y EXPLORACIÓN** 

# **PRD 06 y 07: publicar y explorar con mocks** 

|**MÓDULO**|**TRABAJO DESACOPLADO**|**DEPENDENCIA POSTERIOR**|
|---|---|---|
||Borrador, edición, validación, 1–12 fotos|Storage real, tratamiento EXIF/GPS,|
|**PRD 06 · Publicación**|DEMO, estados, moderación y alerta<br>interna fake.|permisos backend, seguridad de<br>imágenes.|
|**PRD 07 · Explorar**|Lista y filtros, fichas, mapa de<br>demostración, CONTACT/VISIT ficticios.|Proveedor cartográfico real y API pública<br>filtrada.|
|**Interés**|Unicidad lógica, snapshot CLP y<br>reintentos simulados.|Restricción transaccional única en BD y<br>autorizaciones reales.|



## **Tres comportamientos obligatorios para la demo** 

- **01** Publicación: DRAFT → PUBLISHED al completar validaciones; notificación ADMIN simulada DESPUÉS, nunca revisión previa obligatoria. 

- **02** Privacidad: mapa con marcadores ficticios aproximados; no mostrar dirección exacta ni contacto privado del oferente. 

- **03** Interés: un solo registro de prueba por usuario e inmueble; conservar `rent_snapshot_clp` original si cambia la renta actual. 

## **Cómo simular el mapa sin contratar un proveedor** 

Durante esta fase se puede usar una representación estática o un plano ilustrativo con puntos de ejemplo. Un mapa interactivo real requiere validar biblioteca, proveedor de tiles y restricciones de uso; no es necesario resolverlo para probar tarjetas, filtros y selección de fichas. 

### **PROMPT PARA CODEX · PRD 06–07** 

Desarrolla PRD 06 y 07 exclusivamente con fixtures. Incluye publicación automática + cola ADMIN simulada, moderación, filtros sincronizados con lista/mapa DEMO, y solicitud CONTACT/VISIT sin agendar visitas. Conserva un Interest único y el snapshot del primer interés. Prohíbe PII en vistas públicas. Adjunta pruebas negativas. 

### **EVIDENCIA PARA AVANZAR** 

Un propietario ficticio publica, ADMIN revisa después y un emprendedor puede pedir contacto sin duplicados. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   9 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **08 / OPERACIÓN** 

# **PRD 08: mini-CRM completo en modo demostración** 

El backoffice puede estar visualmente muy avanzado antes de escoger proveedor. Sin embargo, todas sus acciones operarán sobre fixtures y repositorios en memoria, NO sobre usuarios, propiedades o registros reales. 

|**BLOQUE DEL ADMIN**|**COMPORTAMIENTO DE PRUEBA**|
|---|---|
|**Resumen**|Tarjetas con datos ficticios: emprendedores, oferentes,<br>publicadas e intereses.|
|**Publicaciones nuevas**|Avisos ficticios y bandera interna de revisión posterior.|
|**Oportunidades**|Asignación, CONTACT/VISIT, estado comercial, notas y bitácora<br>de prueba.|
|**Precalificación**|Sin revisar / No pertinente / Por validar / Calificado por interés.|
|**Vigencia**|Última confirmación real representada con fecha ficticia y<br>recordatorio ~30 días.|
|**Embudo**|Ficha vista ≠c clic ≠c lead válido ≠c visita realizada ≠c WON.|
|**CSV**|Generar cuatro archivos de PRUEBA sin datos personales reales.|
|**Auditoría**|Eventos simulados con actor y fecha ficticios; no afirmar<br>auditoría productiva.|



## **Ejemplo E2E con datos ficticios** 

«Camila» consulta un local ficticio, solicita VISIT, queda un Interest NEW/Sin revisar; ADMIN la contacta, modifica su precalificación a Por validar, agenda manualmente una visita de prueba y registra el avance. La intención VISIT nunca significa visita confirmada. WON solo aplica si MiLocal medió una operación realmente confirmada (en demo: resultado ficticio). 

### **PROMPT PARA CODEX · PRD 08** 

Implementa pantallas del PRD 08 con FakeAdminService. Incluye los dos ciclos de estados independientes, notificación de publicación, responsable, notas, KPI y CSV con datos ficticios. Evita BI avanzado y automatizaciones. Prueba cierre WON/LOST con evidencia DEMO y permisos fake claramente señalados como NO seguros para producción. 

### **EVIDENCIA PARA AVANZAR** 

Demo comercial completa con estados correctos, CSV de prueba y trazabilidad visual; sin backend productivo. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   10 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **09 / CALIDAD Y CONTROL** 

# **No avanzar sin pruebas y revisión de GitHub** 

Una interfaz que se ve bien no basta. Cada entrega deberá demostrar comportamientos positivos y negativos, registrar limitaciones y dejar una PR pequeña, revisable y reversible. 

|**CASO DE PRUEBA**|**RESULTADO EXIGIDO DURANTE ESTA FASE**|
|---|---|
|**Sin assessment completo**|Permite registro de interés ficticio con flujo exprés.|
|**Click repetido**|Un Interest lógico; aumenta insistencias sin resetear<br>seguimiento.|
|**Precio modificado**|Se mantiene snapshot de la primera renta al registrar interés.|
|**Publicación nueva**|Se muestra en inventario y emite alerta interna fake no<br>bloqueante.|
|**Despublicada**|Desaparece de listado ficticio; bloquea nuevos intereses.|
|**Moderada por ADMIN**|No puede republicarla propietario en el flujo simulado.|
|**Estados mezclados**|Assessment, perfil, comercial y precalificación siguen<br>separados.|
|**Datos privados**|Las vistas públicas no muestran dirección exacta ni contacto.|
|**CSV**|Cuatro estructuras esperadas y datos de muestra, sin PII real.|
|**Sin proveedor externo**|Demo funciona sin keys, cuentas pagadas o servicios remotos.|



## **Rutina de revisión por PR** 

- **01** Codex presenta qué cambió y qué PRD cubre; no aceptar cambios fuera de alcance. 

- **02** Revisar archivos editados y capturas, probar el flujo en la demo. 

- **03** Ejecutar lint, tipos, pruebas y build; registrar resultados reales, no «deberían pasar». 

- **04** Comprobar secretos, PII, dependencias nuevas y que main no cambie sin revisión. 

- **05** Corregir, aprobar la PR y documentar la limitación pendiente de integración. 

### **REGLA DE ORO** 

No permitir a Codex desplegar, enviar correos, crear servicios con costo, cambiar permisos o fusionar ramas sin aprobación humana expresa. 

### **EVIDENCIA PARA AVANZAR** 

Cada PR contiene objetivo, PRD, evidencia de pruebas, diff revisado y declaración explícita de lo NO implementado. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   11 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

**10 / PUNTO DE DETENCIÓN** 

# **Cerrar la fase de Codex sin elegir proveedores por anticipado** 

La guía termina cuando podamos mostrar un prototipo coherente, reproducible y bien separado de los futuros servicios. En ese momento se vuelve a la selección tecnológica y a la planificación formal del desarrollo. 

|**ADAPTADOR A REEMPLAZAR**|**DECISIÓN TECNOLÓGICA ABIERTA**|**QUÉ NO ES SEGURO AFIRMAR AÚN**|
|---|---|---|
|**Auth / sesiones**|Proveedor de identidad; correo y MFA<br>ADMIN|No hay identidad ni autorización real.|
|**Repositorio de datos**|Motor / hosting de BD, migraciones,<br>backup|No hay unicidad transaccional ni<br>durabilidad garantizada.|
|**Fotografías**|Storage y pipeline de saneamiento, URLs<br>y backup|No hay protección real de fotos/EXIF.|
|**Mapa**|Proveedor de tiles, geocodificación,<br>privacidad|No hay mapas públicos reales ni costos<br>cerrados.|
|**Email / notificaciones**|Proveedor, dominio de envío,<br>entregabilidad|No existen correos transaccionales reales.|
|**Hosting / CI / observabilidad**|Entornos, logs, secretos, rollback y costo|No existe servicio productivo ni SLA.|
|**Analítica**|Herramienta, base legal, masking,<br>eventos|No hay medición externa autorizada.|



## **Paquete que debe quedar en GitHub al detenernos** 

- Código por módulos y una demo ejecutable con fixtures. 

- README de instalación/pruebas, AGENTS.md y guía de revisión de PR. 

- Mapa de implementación PRD → pantalla/servicio → prueba → pendiente. 

- Interfaces de adaptadores y decisiones ADR abiertas; cero secretos reales. 

- Registro de limitaciones y bugs; estimación técnica para integrar proveedores. 

- Lista de pendientes LEGAL-01–08 y OPS-01–03 para antes de usuarios reales. 

### **GATE GO / NO-GO** 

GO a selección tecnológica cuando la demo y pruebas sean revisables. NO-GO a producción hasta conectar servicios reales, probar autenticación/permisos/respaldos, cerrar LEGAL/OPS y completar QA E2E. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   12 

**MILOCAL   /   MVP1   /   GUÍA CODEX + GITHUB   /   V0.1** 

### **11 / COPIAR Y COMENZAR** 

# **Plantilla para abrir el siguiente chat de Codex** 

Usa este texto en la primera tarea del nuevo flujo. Si los documentos no están dentro del repositorio o en el entorno, adjúntalos o súbelos expresamente. No asumas que Codex puede leer otras conversaciones de ChatGPT por sí solo. 

### **PROMPT MAESTRO (COPIAR / PEGAR)** 

Estamos construyendo MiLocal MVP1. Usa como fuentes el PRD Maestro v1.0, los PRD 01–08 v1.0 y el Anexo v1.0. La Arquitectura de Solución v0.1 es una PROPUESTA, no una decisión aprobada. GitHub es la única plataforma confirmada. Quiero preparar una demo y código reutilizable SIN integrar proveedores finales ni datos personales reales. 

1) Primero analiza los documentos y el repositorio. 2) Propón estructura, stack mínimo y riesgos de retrabajo. 3) Identifica qué puede ser mock y qué debe quedar pendiente. 4) No escribas ni instales nada hasta mi aprobación. 5) Trabaja de a un PRD por vez, en PR pequeñas. 6) Incluye pruebas, evidencia y criterios de aceptación. 7) Nunca hagas deploy, merges o gastos sin aprobación. 

Empieza por un diagnóstico y un plan de implementación acotado para PRD 01; NO empieces a programar todavía. 

## **Preguntas de revisión antes de cada entrega** 

- ¿Qué requisito de cuál PRD quedó implementado y cuál sigue solo simulado? 

- ¿Qué archivos se modificaron y dónde se ven los resultados? 

- ¿Qué pruebas se ejecutaron y cuáles no pudieron verificarse? 

- ¿Apareció una dependencia nueva de algún proveedor no aprobado? 

- ¿Es necesario tomar una decisión arquitectónica antes de continuar? 

## **Fuentes oficiales para consultar el proceso** 

OpenAI · Uso de Codex Cloud: help.openai.com/es-419/articles/20001545-using-codex-cloud 

OpenAI · Codex y sus modalidades: help.openai.com/es-419/articles/11369540-using-codex-with-your-chatgpt-plan 

GitHub · Crear repositorio privado: docs.github.com/es/repositories/creating-and-managing-repositories/creating-a-newrepository 

GitHub · Ramas y PR: docs.github.com/en/pull-requests/reference/branches 

Referencias consultadas en octubre de 2026. Algunas rutas de interfaz y posibilidades dependen del plan y las actualizaciones del producto. 

MiLocal · Guía para prototipado y desarrollo desacoplado  |  Octubre 2026   ·   13 

