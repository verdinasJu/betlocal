import type { StudyCard } from "@/lib/study/types";

/**
 * Práctica traducida al español a partir de escenarios tipo examen
 * (Platform Admin). Redacción propia en español; conceptos alineados
 * con el exam guide y Trailhead.
 */
export const SF_ADMIN_PDF_PRACTICE: StudyCard[] = [
  // —— Del PDF (16 preguntas traducidas) ——
  {
    id: "pdf-01",
    topicId: "sf-security",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Universal Containers usa modelo Privado en Oportunidades con equipos de oportunidad, sin reglas de compartición por criterios. Un comercial se fue, se desactivó su usuario y luego volvió al mismo rol. El admin reactivó el registro antiguo y lo añadió al mismo equipo de oportunidad por defecto, pero ya no ve los registros con los que trabajaba antes de irse. ¿Causa más probable?",
    options: [
      "La etapa de las oportunidades pasó a Cerrada perdida",
      "Cambió el tipo de registro de las oportunidades",
      "Los registros se compartieron manualmente con el usuario",
      "Se le quitó un permission set al desactivarlo",
    ],
    answerIndex: 2,
    explanation:
      "Al desactivar un usuario, Salesforce elimina permanentemente las comparticiones manuales (Share). Reactivar al usuario no las restaura. En modelo Privado sin reglas, ese acceso puntual desaparece.",
  },
  {
    id: "pdf-02",
    topicId: "sf-setup",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Cloud Kicks distingue la jerarquía de cuentas con el campo estándar Tipo de cuenta. Quieren que en los page layouts se muestre como «Nivel». ¿Cómo lo implementa el admin?",
    options: [
      "Editar el campo Type en Campos y relaciones",
      "Usar Renombrar pestañas y etiquetas",
      "Crear un campo personalizado Nivel y eliminar Type",
      "Crear un conjunto de valores de lista de selección global",
    ],
    answerIndex: 1,
    explanation:
      "Renombrar pestañas y etiquetas cambia la etiqueta visible de campos estándar en toda la org sin tocar datos ni lógica subyacente.",
  },
  {
    id: "pdf-03",
    topicId: "sf-collab",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Un admin construye un agente para nutrir leads. ¿Cómo ayuda Agentforce SDR?",
    options: [
      "Crea guiones dinámicos de llamada para comerciales humanos",
      "Negocia precios y cierra contratos de forma autónoma",
      "Analiza el rendimiento del equipo y da coaching",
      "Responde preguntas de leads con datos de la empresa",
    ],
    answerIndex: 3,
    explanation:
      "Agentforce SDR responde consultas de prospectos usando datos internos (Knowledge, catálogos, etc.) para nutrir leads sin alucinaciones.",
  },
  {
    id: "pdf-04",
    topicId: "sf-objects",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Universal Containers pide una relación muchos-a-muchos entre dos objetos personalizados. ¿Qué DOS pasos debe ejecutar el admin? (Elige 2)",
    options: [
      "Crear un objeto puente (junction) personalizado",
      "Crear dos relaciones maestro-detalle en el objeto nuevo",
      "Crear un campo URL en uno de los objetos",
      "Crear dos relaciones de búsqueda (lookup) en el objeto nuevo",
    ],
    answerIndices: [0, 1],
    explanation:
      "Muchos-a-muchos = objeto puente + dos master-detail hacia cada padre. Lookup no da la integridad ni roll-ups típicos del patrón junction.",
  },
  {
    id: "pdf-05",
    topicId: "sf-auto",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Un screen flow ayuda a crear leads. Si Origen del lead = «Motor de búsqueda», debe mostrarse un picklist de motor concreto; si no, ocultarlo. ¿Forma más eficiente?",
    options: [
      "Filtro condicional del elemento de pantalla",
      "Elemento Asignación con dos ramas según el origen",
      "Visibilidad condicional del picklist cuando Origen = Motor de búsqueda",
      "Regla de validación para mostrar el campo condicionalmente",
    ],
    answerIndex: 2,
    explanation:
      "Visibilidad condicional del componente en la pantalla del flow adapta el formulario en tiempo real. Las validation rules solo reaccionan al guardar.",
  },
  {
    id: "pdf-06",
    topicId: "sf-ui",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "No aparece la línea de actividades en la página de registro de Cuenta. ¿Qué debe hacer el admin?",
    options: [
      "Añadir el componente estándar Actividades en la Lightning Record Page",
      "Actualizar permisos de edición de la línea de actividades",
      "Ejecutar un informe para comprobar si hay actividades",
      "Añadir un botón de línea de actividades en el Object Manager",
    ],
    answerIndex: 0,
    explanation:
      "La Activity Timeline es un componente Lightning. Si falta, se arrastra desde App Builder a la página de registro.",
  },
  {
    id: "pdf-07",
    topicId: "sf-reports",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "El admin quiere limitar qué tipos de informe ven los usuarios al pulsar «Nuevo informe». ¿Qué herramienta usa?",
    options: [
      "Ocultar tipos de informe",
      "Compartir carpetas de informes",
      "Tipos de informe estándar",
      "Informes unidos (joined reports)",
    ],
    answerIndex: 0,
    explanation:
      "Select Report Types to Hide reduce la lista de plantillas disponibles al crear informes. Compartir carpetas no restringe la creación.",
  },
  {
    id: "pdf-08",
    topicId: "sf-collab",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Agentforce escala casos al soporte, pero los agentes no ven el contexto y el cliente repite todo. ¿Causa de configuración más probable?",
    options: [
      "Al soporte le falta el permission set de Agentforce User",
      "El page layout de Caso no incluye el componente de historial del agente",
      "Las instrucciones del agente no guardan historial",
      "El traspaso crea un caso nuevo en lugar de transferir la sesión",
    ],
    answerIndex: 1,
    explanation:
      "Sin el componente de historial/conversación en la página Lightning del Caso, el humano no ve el chat previo con la IA.",
  },
  {
    id: "pdf-09",
    topicId: "sf-ui",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Se añadió un campo de área de texto en Cuenta. El manager quiere verlo en el panel de destacados (highlights). ¿Cómo?",
    options: [
      "Crear o editar un compact layout en el Object Manager de Cuenta",
      "Marcar el campo como obligatorio y moverlo arriba",
      "Crear una sección «Panel destacado» en el page layout",
      "Arrastrar el campo al highlight panel desde el page layout editor",
    ],
    answerIndex: 0,
    explanation:
      "El panel de destacados lo controla el compact layout (hasta 7 campos), no el page layout clásico de detalles.",
  },
  {
    id: "pdf-10",
    topicId: "sf-service",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Ursa Major quiere asuntos predefinidos: Tareas → «Programar visita» y «Enviar contrato»; Eventos → «Visita in situ» y «Acompañamiento». ¿Qué configuración?",
    options: [
      "Valores predefinidos en acciones globales Nuevo evento / Nueva tarea",
      "Añadir valores al picklist Asunto por separado en Tarea y Evento",
      "Crear un picklist Asunto personalizado en Actividad",
      "Mezclar todos los valores en un solo picklist de Actividad",
    ],
    answerIndex: 1,
    explanation:
      "Tarea y Evento tienen picklists de Asunto distintos. Se gestionan por separado en Object Manager.",
  },
  {
    id: "pdf-11",
    topicId: "sf-ui",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Se eliminó por error un campo de área de texto del page layout de un objeto personalizado. ¿Qué DOS formas de restaurarlo? (Elige 2)",
    options: [
      "Clonar el layout de otro perfil con «Guardar como»",
      "Restaurar el page layout desde un sandbox",
      "Recuperarlo de la papelera en 15 días",
      "Arrastrar el campo desde la paleta de campos al layout",
    ],
    answerIndices: [1, 3],
    explanation:
      "Quitar un campo del layout no borra el campo: se vuelve a arrastrar desde la paleta. También puedes redeployar metadata desde sandbox.",
  },
  {
    id: "pdf-12",
    topicId: "sf-sales",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Cloud Kicks quiere registrar email, ferias y webinars en Campañas, con campos distintos según el tipo. ¿Enfoque correcto?",
    options: [
      "Tipo de informe personalizado con los campos",
      "Campo personalizado «tipo de iniciativa» en Campaña",
      "Tipos de registro y page layouts por tipo de campaña",
      "Jerarquía de campañas para organizar tipos",
    ],
    answerIndex: 2,
    explanation:
      "Record types + layouts distintos muestran solo los campos relevantes por tipo de campaña.",
  },
  {
    id: "pdf-13",
    topicId: "sf-collab",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Cada vez que el admin prueba una plantilla de prompt en Prompt Builder obtiene respuestas distintas. ¿Por qué?",
    options: [
      "Prompt Builder cachea respuestas del LLM por plantilla",
      "Cada prueba genera una llamada única al modelo de lenguaje",
      "El prompt solo se envía al desplegar en un agente en vivo",
      "Prompt Builder simula llamadas sin usar el modelo real",
    ],
    answerIndex: 1,
    explanation:
      "Los LLM generativos son probabilísticos: cada ejecución de prueba llama al modelo y la salida puede variar.",
  },
  {
    id: "pdf-14",
    topicId: "sf-reports",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "La dirección quiere publicar componentes del dashboard en Chatter pero no puede. ¿Cómo habilitarlo?",
    options: [
      "Activar instantáneas de informes (reporting snapshots)",
      "Usar «Descargar gráfico» del componente",
      "Configurar «Ver informe como» del dashboard",
      "Activar seguimiento de feed del dashboard",
    ],
    answerIndex: 3,
    explanation:
      "Feed tracking en dashboards permite seguir el dashboard y publicar componentes en Chatter.",
  },
  {
    id: "pdf-15",
    topicId: "sf-sales",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Los comerciales omiten campos clave en Oportunidades y no pueden retroceder etapas. ¿Qué TRES opciones cubren la necesidad? (Elige 3)",
    options: [
      "Marcar campos obligatorios en el page layout",
      "Usar un flow para marcar campos obligatorios",
      "Configurar Opportunity Path",
      "Usar reglas de validación",
      "Activar Guided Selling",
    ],
    answerIndices: [0, 2, 3],
    explanation:
      "Path guía por etapa; validation rules bloquean avance sin datos; required en layout captura lo esencial. Flow no es la vía principal para required en UI.",
  },
  {
    id: "pdf-16",
    topicId: "sf-collab",
    kind: "mcq",
    difficulty: 2,
    prompt: "¿Caso de uso de Agentforce en una organización de ventas?",
    options: [
      "Realizar llamadas en frío",
      "Automatizar todo el contenido de marketing",
      "Ofrecer un web bot básico con script fijo",
      "Automatizar la cualificación de leads",
    ],
    answerIndex: 3,
    explanation:
      "Cualificación de leads con conversación natural y actualización de registros es un caso de uso clave de Agentforce en ventas.",
  },

  // —— Inspiradas en el mismo estilo (más difíciles) ——
  {
    id: "pdf-17",
    topicId: "sf-security",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Tras desactivar a un usuario, un manager dice que «ya no ve las oportunidades que compartió manualmente con él la semana pasada». El usuario sigue desactivado. ¿Explicación?",
    options: [
      "Las comparticiones manuales se eliminan al desactivar",
      "El OWD pasó automáticamente a Public Read Only",
      "Los permission sets caducan al desactivar",
      "La jerarquía de roles se recalcula y oculta todo",
    ],
    answerIndex: 0,
    explanation:
      "Manual share no sobrevive a la desactivación del usuario destino, aunque el registro siga existiendo.",
  },
  {
    id: "pdf-18",
    topicId: "sf-setup",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Quieres que el campo estándar «Amount» en Oportunidad se llame «Importe neto» en toda la org. ¿Mejor opción?",
    options: [
      "Crear campo Importe_neto__c y ocultar Amount",
      "Renombrar pestañas y etiquetas",
      "Editar el API name de Amount",
      "Formula field que copie Amount",
    ],
    answerIndex: 1,
    explanation:
      "Renombrar etiquetas es la vía oficial para cambiar cómo se muestra un campo estándar.",
  },
  {
    id: "pdf-19",
    topicId: "sf-objects",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Tienes Proyecto__c y Consultor__c. Un consultor puede estar en varios proyectos y un proyecto tiene varios consultores. ¿Arquitectura correcta?",
    options: [
      "Lookup de Consultor en Proyecto",
      "Master-detail bidireccional",
      "Objeto Asignacion__c con dos master-detail",
      "Campo de texto multilínea con nombres",
    ],
    answerIndex: 2,
    explanation:
      "Patrón junction: objeto intermedio con dos relaciones maestro-detalle.",
  },
  {
    id: "pdf-20",
    topicId: "sf-auto",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "En un screen flow, un picklist solo debe mostrarse si el usuario elige «Otro» en un radio button. ¿Qué usas?",
    options: [
      "Regla de validación en el objeto Lead",
      "Visibilidad condicional del componente picklist",
      "Process Builder",
      "Workflow field update",
    ],
    answerIndex: 1,
    explanation:
      "Component visibility en Flow Builder controla qué se muestra según valores de otros componentes de la misma pantalla.",
  },
  {
    id: "pdf-21",
    topicId: "sf-ui",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Los comerciales ven la ficha de Cuenta pero no el componente de actividades abiertas. ¿Primera comprobación?",
    options: [
      "Lightning App Builder: ¿está el componente Actividades en la página?",
      "¿Tienen licencia Salesforce?",
      "¿Existe el objeto Task?",
      "¿Está activado Chatter?",
    ],
    answerIndex: 0,
    explanation:
      "Si falta el componente en la record page, no aparece aunque existan tareas en el registro.",
  },
  {
    id: "pdf-22",
    topicId: "sf-reports",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Los usuarios crean informes con tipos que mezclan objetos incorrectos y los datos salen mal. ¿Medida preventiva?",
    options: [
      "Ocultar tipos de informe irrelevantes",
      "Poner OWD en Public",
      "Desactivar informes tabulares",
      "Quitar permiso de crear informes",
    ],
    answerIndex: 0,
    explanation:
      "Reducir la lista de report types visibles guía a los usuarios hacia plantillas correctas.",
  },
  {
    id: "pdf-23",
    topicId: "sf-collab",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Tras escalar de Agentforce a agente humano, el caso existe pero el transcript no. ¿Qué revisar primero?",
    options: [
      "Page layout de Caso en Lightning App Builder",
      "OWD de Case",
      "Fiscal year",
      "Compact layout de Contact",
    ],
    answerIndex: 0,
    explanation:
      "El historial de conversación es un componente de UI en la record page del Caso.",
  },
  {
    id: "pdf-24",
    topicId: "sf-ui",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Un campo personalizado debe aparecer en el hover de registro y en el encabezado móvil. ¿Dónde se configura?",
    options: [
      "Compact layout",
      "Page layout de detalles",
      "Lightning page template",
      "Permission set",
    ],
    answerIndex: 0,
    explanation:
      "Compact layout define campos del header y vista compacta (hasta 7 campos).",
  },
  {
    id: "pdf-25",
    topicId: "sf-service",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Al crear una Tarea, el usuario ve asuntos que solo aplican a Eventos. ¿Qué pasó?",
    options: [
      "Se mezclaron valores de Asunto de Tarea y Evento en un solo picklist",
      "Falta licencia de Service Cloud",
      "El perfil no tiene acceso a Task",
      "Hay que usar Quick Text",
    ],
    answerIndex: 0,
    explanation:
      "Tarea y Evento gestionan picklists de Asunto por separado; mezclarlos confunde la UX.",
  },
  {
    id: "pdf-26",
    topicId: "sf-sales",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Campaña de feria necesita «Número de stand»; campaña email necesita «Asunto del email». ¿Solución escalable?",
    options: [
      "Un campo texto libre para todo",
      "Record types con layouts distintos en Campaign",
      "Solo jerarquía de campañas padre/hijo",
      "Validation rule que pida ambos campos siempre",
    ],
    answerIndex: 1,
    explanation:
      "Record types permiten campos y layouts específicos por tipo de iniciativa.",
  },
  {
    id: "pdf-27",
    topicId: "sf-collab",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "El admin quiere respuestas de IA más consistentes en Prompt Builder antes de producción. ¿Qué puede hacer?",
    options: [
      "Refinar instrucciones para ser más específicas",
      "Desactivar el LLM y usar solo texto fijo",
      "Esperar a que el modelo cachee la respuesta",
      "Usar solo validation rules",
    ],
    answerIndex: 0,
    explanation:
      "Instrucciones más precisas reducen variabilidad; la naturaleza probabilística del LLM no desaparece del todo.",
  },
  {
    id: "pdf-28",
    topicId: "sf-reports",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Un VP quiere comentar un gráfico del dashboard con su equipo en Chatter sin exportar PNG. ¿Requisito?",
    options: [
      "Feed tracking habilitado en dashboards",
      "Dashboard en modo solo lectura",
      "Report snapshot diario",
      "Joined report",
    ],
    answerIndex: 0,
    explanation:
      "Sin feed tracking en dashboards no hay publicación social integrada de componentes.",
  },
  {
    id: "pdf-29",
    topicId: "sf-sales",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Un comercial puede avanzar etapa sin rellenar «Motivo de pérdida» cuando cierra perdida. ¿Combinación típica para corregirlo?",
    options: [
      "Path + validation rule condicionada a la etapa",
      "Solo cambiar el OWD",
      "Eliminar el page layout",
      "Crear otro perfil idéntico",
    ],
    answerIndex: 0,
    explanation:
      "Path muestra qué falta; validation rule impide guardar/avanzar sin el campo en esa etapa.",
  },
  {
    id: "pdf-30",
    topicId: "sf-security",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "OWD de Case es Private. Un agente ve casos de compañeros del mismo rol sin reglas de sharing. ¿Causa más probable?",
    options: [
      "Case Team o sharing manual previo",
      "FLS en modo Public Read",
      "El perfil es System Administrator",
      "Validation rule de sharing",
    ],
    answerIndex: 0,
    explanation:
      "Private + mismo rol no implica ver registros ajenos salvo equipos, manual share o reglas.",
  },
  {
    id: "pdf-31",
    topicId: "sf-users",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Reactivas un usuario desactivado hace 6 meses. ¿Qué NO se restaura automáticamente?",
    options: [
      "Su nombre y email en el registro de usuario",
      "Comparticiones manuales que tenía sobre registros",
      "Su perfil asignado si no cambiaste nada",
      "Su username si sigue libre",
    ],
    answerIndex: 1,
    explanation:
      "Reactivar recupera login y configuración base, pero no recrea manual shares eliminados al desactivar.",
  },
  {
    id: "pdf-32",
    topicId: "sf-auto",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Quieres impedir que una Oportunidad pase a «Propuesta» si falta «Presupuesto estimado». ¿Herramienta adecuada?",
    options: [
      "Validation rule con ISCHANGED(StageName)",
      "Compact layout",
      "Report type",
      "Renombrar pestañas",
    ],
    answerIndex: 0,
    explanation:
      "Validation rules pueden exigir campos cuando cambia StageName.",
  },
  {
    id: "pdf-33",
    topicId: "sf-objects",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "En un objeto junction, ¿qué implica usar master-detail hacia ambos padres?",
    options: [
      "El junction hereda sharing y se borra si se borra un padre",
      "Los padres pueden existir sin registros junction obligatoriamente",
      "No permite informes",
      "Sustituye la necesidad de FLS",
    ],
    answerIndex: 0,
    explanation:
      "Master-detail: visibilidad del hijo depende del padre y borrado en cascada del junction.",
  },
  {
    id: "pdf-34",
    topicId: "sf-collab",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "¿Qué diferencia clave hay entre un chatbot clásico y Agentforce en cualificación de leads?",
    options: [
      "Agentforce puede razonar con datos de Salesforce y actualizar registros",
      "Agentforce no usa IA generativa",
      "El chatbot clásico siempre actualiza Opportunities",
      "No hay diferencia funcional",
    ],
    answerIndex: 0,
    explanation:
      "Agentforce combina IA generativa con acciones y datos CRM; bots rígidos siguen árboles fijos.",
  },
  {
    id: "pdf-35",
    topicId: "sf-reports",
    kind: "mcq",
    difficulty: 3,
    prompt:
      "Un dashboard muestra datos de otro usuario aunque «Ver como» está en el ejecutivo. Los componentes siguen vacíos para algunos. ¿Qué revisar?",
    options: [
      "Acceso del usuario «Ver como» a los informes fuente y carpetas",
      "Color del gráfico",
      "Tipo de licencia del dashboard",
      "Número de componentes máximo",
    ],
    answerIndex: 0,
    explanation:
      "Dashboard running user debe poder ver los reportes subyacentes y los registros según sharing.",
  },
  {
    id: "pdf-36",
    topicId: "sf-ui",
    kind: "mcq",
    difficulty: 2,
    prompt:
      "Dos perfiles necesitan el mismo layout salvo un campo sensible. ¿Enfoque recomendado?",
    options: [
      "Dos page layouts + asignación por perfil/record type",
      "Duplicar el objeto",
      "Un layout con todos los campos para todos",
      "Quitar FLS",
    ],
    answerIndex: 0,
    explanation:
      "Layouts distintos por perfil o record type ocultan campos sin multiplicar objetos.",
  },
];
