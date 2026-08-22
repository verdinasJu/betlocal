import type { Course, StudyCard, Topic } from "@/lib/study/types";
import { SF_ADMIN_EXAM_STYLE } from "@/lib/study/courses/sf-admin-exam-practice";
import { SF_ADMIN_PDF_PRACTICE } from "@/lib/study/courses/sf-admin-pdf-practice";

/**
 * Salesforce Platform Administrator — pack de estudio en español.
 *
 * Lecciones = conceptos primero (lenguaje sencillo).
 * Cards = práctica original al estilo del examen (NO dumps de FreeCram u otros).
 *
 * La pregunta típica de FreeCram sobre "Cloud Kicks / Case page / info útil
 * por rol" se traduce aquí a conceptos reales: Page Layouts, Lightning Record
 * Pages y asignación por perfil/app — explicados y practicados con redacción
 * propia.
 */

const topics: Topic[] = [
  {
    id: "sf-setup",
    courseId: "sf-admin-es",
    title: "Setup y compañía",
    summary: "Org, licencias, locales, fiscal year, UI.",
    order: 1,
    day: 1,
    lessons: [
      {
        id: "les-setup-1",
        title: "Qué es Setup",
        body: "Setup es el panel de administración de Salesforce. Desde ahí creas usuarios, objetos, seguridad, apps y casi todo lo demás.\n\nPiensa en Setup como el “cuadro de mandos” del admin. Los usuarios normales casi no entran; tú sí.",
        sourceUrl:
          "https://trailhead.salesforce.com/content/learn/modules/admin_intro_setup",
        sourceLabel: "Trailhead · Setup",
      },
      {
        id: "les-setup-2",
        title: "Company Information",
        body: "Company Information muestra datos de la org: nombre, dirección, moneda por defecto, locale, y sobre todo las licencias disponibles y usadas.\n\nSi no puedes crear un usuario, casi siempre es porque no quedan licencias de ese tipo.",
      },
      {
        id: "les-setup-3",
        title: "Año fiscal",
        body: "El fiscal year define cómo se agrupan fechas en informes (trimestres, etc.).\n\nPuede ser estándar (calendario gregoriano) o custom si la empresa empieza el año fiscal en otro mes. Una vez custom, el cambio es delicado: planifica bien.",
      },
    ],
  },
  {
    id: "sf-users",
    courseId: "sf-admin-es",
    title: "Usuarios y login",
    summary: "Usuarios, freeze, deactivate, perfiles base.",
    order: 2,
    day: 1,
    lessons: [
      {
        id: "les-users-1",
        title: "Usuario = persona + licencia + perfil",
        body: "Un usuario necesita:\n1) Licencia (permite existir en la org)\n2) Perfil (permisos base)\n3) Opcionalmente roles y permission sets\n\nSin licencia no hay usuario. Sin perfil no puede trabajar.",
      },
      {
        id: "les-users-2",
        title: "Freeze vs Deactivate",
        body: "Freeze (congelar): el usuario no puede entrar YA, pero la licencia sigue ocupada. Útil en urgencias (alguien se va hoy).\n\nDeactivate (desactivar): libera la licencia para dársela a otra persona. Es lo habitual cuando alguien deja la empresa.",
      },
      {
        id: "les-users-3",
        title: "Un solo perfil",
        body: "Cada usuario tiene UN perfil. Si necesitas variaciones (“casi igual pero con un permiso más”), no crees 20 perfiles: usa permission sets.",
      },
    ],
  },
  {
    id: "sf-security",
    courseId: "sf-admin-es",
    title: "Seguridad y sharing",
    summary: "OWD, roles, perfiles, FLS, sharing rules.",
    order: 3,
    day: 2,
    lessons: [
      {
        id: "les-sec-1",
        title: "Tres capas de seguridad",
        body: "1) Objeto: ¿puede ver/crear/editar Accounts?\n2) Campo (FLS): ¿puede ver el campo Salario?\n3) Registro (sharing): ¿qué Accounts concretas ve?\n\nEl examen ama mezclar estas tres. Si alguien “no ve un campo”, suele ser FLS, no sharing.",
        sourceUrl:
          "https://trailhead.salesforce.com/content/learn/modules/data_security",
        sourceLabel: "Trailhead · Data Security",
      },
      {
        id: "les-sec-2",
        title: "OWD = el suelo",
        body: "Organization-Wide Defaults es el acceso MÍNIMO a registros de un objeto para toda la org (Private, Public Read Only, etc.).\n\nLas sharing rules, roles y teams solo ABRÉN acceso. Nunca restringen por debajo del OWD.",
      },
      {
        id: "les-sec-3",
        title: "Perfil vs Permission Set",
        body: "Perfil = base obligatoria.\nPermission Set = extras que se apilan.\n\nEjemplo: todos los comerciales tienen el mismo perfil Sales, y solo al equipo VIP le das un permission set “Export Reports”.",
      },
    ],
  },
  {
    id: "sf-objects",
    courseId: "sf-admin-es",
    title: "Objetos, campos y relaciones",
    summary: "Custom objects, lookup, master-detail, validaciones.",
    order: 4,
    day: 3,
    lessons: [
      {
        id: "les-obj-1",
        title: "Estándar vs custom",
        body: "Estándar: Account, Contact, Opportunity, Case… vienen de Salesforce.\nCustom: los creas tú (ej. Inventario__c).\n\nCasi todo lo que creas termina en Object Manager.",
      },
      {
        id: "les-obj-2",
        title: "Lookup vs Master-Detail",
        body: "Lookup: enlace flexible. El hijo puede vivir sin padre (según config).\n\nMaster-Detail: el detalle DEPENDE del master. Si borras el padre, se van los hijos. Además permite roll-up summary en el padre.\n\nTruco de examen: necesitas roll-up → casi seguro Master-Detail.",
      },
      {
        id: "les-obj-3",
        title: "Validation rules",
        body: "Una validation rule es una fórmula. Si da TRUE, BLOQUEA el guardado y muestra un error.\n\nEjemplo: “si Stage = Closed Won, Amount no puede estar vacío”.",
      },
    ],
  },
  {
    id: "sf-ui",
    courseId: "sf-admin-es",
    title: "Páginas y experiencia Lightning",
    summary: "Layouts, record pages, Dynamic Forms — lo que ves en Case.",
    order: 5,
    day: 4,
    lessons: [
      {
        id: "les-ui-1",
        title: "Page Layout = qué campos y dónde",
        body: "El Page Layout decide qué campos, botones y secciones ves en un registro, y en qué orden.\n\nSe asigna por Perfil (+ Record Type). Por eso Marketing y Support pueden ver páginas de Case distintas: cada perfil tiene su layout.",
      },
      {
        id: "les-ui-2",
        title: "Lightning Record Page",
        body: "En Lightning, la “página del registro” se construye con App Builder: pestañas, componentes, destacados…\n\nPuedes activar distintas record pages según App, Perfil o Record Type. Eso es justo lo que pide el típico enunciado: “que cada rol vea info más útil en Case”.",
        sourceUrl:
          "https://trailhead.salesforce.com/content/learn/modules/lightning_app_builder",
        sourceLabel: "Trailhead · App Builder",
      },
      {
        id: "les-ui-3",
        title: "Dynamic Forms (idea clave)",
        body: "Dynamic Forms permite mostrar u ocultar campos en la Lightning Record Page según reglas (sin tocar solo el layout clásico).\n\nÚsalo cuando la página debe cambiar según el valor de un campo o el contexto.",
      },
      {
        id: "les-ui-4",
        title: "Compact Layout",
        body: "El Compact Layout controla los campos del encabezado (highlights) y de la app móvil en la vista compacta.\n\nNo sustituye al page layout completo: solo el “resumen de arriba”.",
      },
    ],
  },
  {
    id: "sf-service",
    courseId: "sf-admin-es",
    title: "Service: Cases y soporte",
    summary: "Cases, colas, assignment, entitlements básicos.",
    order: 6,
    day: 5,
    lessons: [
      {
        id: "les-svc-1",
        title: "Qué es un Case",
        body: "Un Case es una solicitud de soporte: una incidencia, una pregunta, un problema.\n\nTiene dueño, estado (New, Working, Closed…), prioridad y suele vivir en colas o con assignment rules.",
      },
      {
        id: "les-svc-2",
        title: "Queues y Assignment Rules",
        body: "Queue (cola): bandeja compartida. Varios agentes “pescan” casos.\n\nAssignment Rules: al crear el Case, Salesforce lo asigna automáticamente según criterios (país, producto, idioma…).",
      },
      {
        id: "les-svc-3",
        title: "Case Page útil por rol",
        body: "Si agentes distintos necesitan ver cosas distintas en el Case:\n• Cambia Page Layout por perfil, y/o\n• Activa Lightning Record Pages distintas por perfil/app\n\nNo uses OWD para “cambiar la pantalla”: OWD es visibilidad de registros, no diseño.",
      },
    ],
  },
  {
    id: "sf-sales",
    courseId: "sf-admin-es",
    title: "Sales: Leads y Opportunities",
    summary: "Lead convert, opportunity stages, path.",
    order: 7,
    day: 6,
    lessons: [
      {
        id: "les-sales-1",
        title: "Lead → Account / Contact / Opportunity",
        body: "Lead = potencial todavía no cualificado.\nAl convertir, Salesforce crea (según elijas) Account, Contact y opcionalmente Opportunity.\n\nNo conviertas dos veces el mismo lead a lo loco: genera duplicados.",
      },
      {
        id: "les-sales-2",
        title: "Opportunity y Stage",
        body: "Opportunity = negocio en curso. El Stage (Prospecting, Negotiation, Closed Won…) marca el avance.\n\nPath muestra la guía visual de stages en Lightning. Muy de examen.",
      },
      {
        id: "les-sales-3",
        title: "Campaign influence (idea)",
        body: "Las Campaigns agrupan esfuerzos de marketing. Puedes relacionar leads/contactos/opportunities para medir qué campaña ayudó a cerrar negocio.",
      },
    ],
  },
  {
    id: "sf-auto",
    courseId: "sf-admin-es",
    title: "Automatización (Flow)",
    summary: "Record-triggered flows, approval, cuándo Apex.",
    order: 8,
    day: 7,
    lessons: [
      {
        id: "les-auto-1",
        title: "Flow es el estándar",
        body: "Para automatizar hoy: Flow Builder.\nWorkflow Rules y Process Builder están en retirada: el examen espera que priorices Flow.\n\nTipos útiles: Screen Flow (con pantallas), Record-Triggered (al crear/editar), Scheduled.",
        sourceUrl:
          "https://trailhead.salesforce.com/content/learn/trails/build-flows-with-flow-builder",
        sourceLabel: "Trailhead · Flow",
      },
      {
        id: "les-auto-2",
        title: "Before vs After",
        body: "Record-Triggered Flow:\n• Before save: cambia campos del MISMO registro sin DML extra (rápido).\n• After save: crea registros relacionados, emails, llamas a otros objetos.",
      },
      {
        id: "les-auto-3",
        title: "Approval Process",
        body: "Cuando alguien debe “pedir permiso” (descuento > 20%, vacaciones…): Approval Process.\n\nSubmit → aprobadores → acciones al aprobar/rechazar. Puede bloquear campos mientras está pendiente.",
      },
    ],
  },
  {
    id: "sf-reports",
    courseId: "sf-admin-es",
    title: "Informes, dashboards y datos",
    summary: "Report types, buckets, data import, duplicados.",
    order: 9,
    day: 8,
    lessons: [
      {
        id: "les-rep-1",
        title: "Tipos de report",
        body: "Tabular: lista simple.\nSummary: agrupa filas (por Stage, por Owner…).\nMatrix: agrupa filas Y columnas.\nJoined: varios bloques en un informe.",
      },
      {
        id: "les-rep-2",
        title: "Dashboard dinámico",
        body: "Dashboard estático: todos ven los datos del “running user” fijo.\nDinámico: cada persona ve según SU acceso.\n\nÚtil cuando cada comercial solo debe ver lo suyo.",
      },
      {
        id: "les-rep-3",
        title: "Datos limpios",
        body: "Import Wizard / Data Loader para cargar datos.\nMatching rules + duplicate rules para evitar duplicados.\n\nSin datos decentes, informes y AI mienten.",
      },
    ],
  },
  {
    id: "sf-collab",
    courseId: "sf-admin-es",
    title: "Productividad y colaboración",
    summary: "Chatter, activities, App móvil, Agentforce básico.",
    order: 10,
    day: 9,
    lessons: [
      {
        id: "les-col-1",
        title: "Activities",
        body: "Tasks y Events son actividades. Se relacionan con Who (persona) y What (Account, Opportunity…).\n\nEn Lightning las ves en el activity timeline.",
      },
      {
        id: "les-col-2",
        title: "Chatter y Groups",
        body: "Chatter: feed de colaboración en registros.\nGroups: espacios para equipos (públicos o privados).",
      },
      {
        id: "les-col-3",
        title: "Agentforce (idea de examen nuevo)",
        body: "Salesforce está metiendo Agentforce (agentes de IA) en el examen Admin.\n\nIdea base: los agentes ayudan a usuarios con tareas; el admin cuida permisos, datos y gobernanza (qué puede ver/hacer la IA).\n\nPara el examen: entiende el concepto y que la calidad de datos importa.",
      },
    ],
  },
];

const cards: StudyCard[] = [
  // Setup
  {
    id: "c-setup-1",
    topicId: "sf-setup",
    kind: "mcq",
    prompt: "¿Dónde miras cuántas licencias quedan en la org?",
    options: [
      "Report Builder",
      "Company Information",
      "App Launcher",
      "Chatter Groups",
    ],
    answerIndex: 1,
    explanation:
      "Company Information lista licencias totales y usadas. Si no puedes crear usuarios, mira ahí primero.",
    difficulty: 1,
  },
  {
    id: "c-setup-2",
    topicId: "sf-setup",
    kind: "tf",
    prompt: "El fiscal year custom se cambia de forma trivial cada semana.",
    answerTrue: false,
    explanation:
      "Custom fiscal years son serios: afectan a reportes históricos. No se “juguetea” con ellos.",
    difficulty: 2,
  },
  {
    id: "c-setup-3",
    topicId: "sf-setup",
    kind: "mcq",
    prompt: "App Manager sirve principalmente para…",
    options: [
      "Borrar la org",
      "Crear/editar Lightning Apps y su navegación",
      "Definir OWD de todos los objetos",
      "Solo instalar paquetes",
    ],
    answerIndex: 1,
    explanation:
      "Desde App Manager gestionas apps Lightning: branding, navigation items, utility bar…",
    difficulty: 1,
  },
  {
    id: "c-setup-4",
    topicId: "sf-setup",
    kind: "pair",
    prompt: "Empareja",
    term: "Setup",
    definition: "Área de administración donde se configura la org",
    explanation: "Setup ≠ App Launcher. Setup es admin; App Launcher abre apps.",
    difficulty: 1,
  },

  // Users
  {
    id: "c-users-1",
    topicId: "sf-users",
    kind: "mcq",
    prompt: "Un empleado se va HOY y no debe entrar. ¿Qué haces primero?",
    options: [
      "Borrar el usuario",
      "Freeze del usuario",
      "Cambiar el OWD a Private",
      "Quitar todos los page layouts",
    ],
    answerIndex: 1,
    explanation:
      "Freeze corta el acceso al instante. Luego, con calma, deactivate para liberar licencia.",
    difficulty: 1,
  },
  {
    id: "c-users-2",
    topicId: "sf-users",
    kind: "tf",
    prompt: "Un usuario puede tener varios perfiles a la vez.",
    answerTrue: false,
    explanation: "Un perfil. Varios permission sets.",
    difficulty: 1,
  },
  {
    id: "c-users-3",
    topicId: "sf-users",
    kind: "mcq",
    prompt: "¿Para qué son los permission sets?",
    options: [
      "Sustituir roles",
      "Añadir permisos sin multiplicar perfiles",
      "Definir OWD",
      "Crear dashboards",
    ],
    answerIndex: 1,
    explanation:
      "Mantén pocos perfiles y otorga extras con permission sets / groups.",
    difficulty: 1,
  },
  {
    id: "c-users-4",
    topicId: "sf-users",
    kind: "mcq",
    prompt: "Deactivate un usuario…",
    options: [
      "Borra sus Opportunities",
      "Libera la licencia para reasignarla",
      "Solo oculta el nombre en reports",
      "Convierte el user en Contact",
    ],
    answerIndex: 1,
    explanation:
      "Deactivate mantiene el historial pero libera la licencia. No borra la org entera.",
    difficulty: 2,
  },
  {
    id: "c-users-5",
    topicId: "sf-users",
    kind: "pair",
    prompt: "Empareja",
    term: "Role hierarchy",
    definition: "Abre acceso a registros hacia arriba en la jerarquía",
    explanation:
      "Los managers suelen ver lo de sus subordinados vía role hierarchy (según config).",
    difficulty: 2,
  },

  // Security
  {
    id: "c-sec-1",
    topicId: "sf-security",
    kind: "mcq",
    prompt: "OWD define…",
    options: [
      "El color del tema",
      "El acceso base a registros de un objeto",
      "Los campos obligatorios",
      "La API version",
    ],
    answerIndex: 1,
    explanation: "OWD = suelo de sharing del objeto.",
    difficulty: 1,
  },
  {
    id: "c-sec-2",
    topicId: "sf-security",
    kind: "tf",
    prompt: "Una sharing rule puede hacer el acceso más restrictivo que el OWD.",
    answerTrue: false,
    explanation: "Solo abren. Para restringir, bajas el OWD.",
    difficulty: 2,
  },
  {
    id: "c-sec-3",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "El layout muestra un campo, pero el usuario no lo ve. ¿Causa típica?",
    options: [
      "OWD Public Read/Write",
      "FLS oculto para su perfil",
      "No hay licencia Chatter",
      "Fiscal year custom",
    ],
    answerIndex: 1,
    explanation: "Layout ≠ FLS. FLS manda sobre visibilidad del campo.",
    difficulty: 2,
  },
  {
    id: "c-sec-4",
    topicId: "sf-security",
    kind: "mcq",
    prompt: "Marketing debe ver todas las Campaigns y Sales no. Empiezas por…",
    options: [
      "Solo validation rules",
      "OWD de Campaign + sharing/roles",
      "Solo Flow",
      "Solo Compact Layout",
    ],
    answerIndex: 1,
    explanation:
      "Primero el modelo de sharing del objeto; luego abres con roles/rules.",
    difficulty: 2,
  },
  {
    id: "c-sec-5",
    topicId: "sf-security",
    kind: "pair",
    prompt: "Empareja",
    term: "Field-Level Security",
    definition: "Controla si un campo es visible/editable por perfil",
    explanation: "Independiente de si el registro es visible.",
    difficulty: 1,
  },
  {
    id: "c-sec-6",
    topicId: "sf-security",
    kind: "tf",
    prompt: "Con OWD Private, el dueño del registro suele poder verlo.",
    answerTrue: true,
    explanation: "Owner + jerarquía (según settings) mantienen acceso.",
    difficulty: 1,
  },

  // Objects
  {
    id: "c-obj-1",
    topicId: "sf-objects",
    kind: "mcq",
    prompt: "Necesitas un roll-up summary COUNT de hijos. ¿Relación?",
    options: ["Lookup", "Master-Detail", "Hierarchy solo", "External lookup"],
    answerIndex: 1,
    explanation: "Roll-up summary requiere Master-Detail (o excepciones limitadas).",
    difficulty: 2,
  },
  {
    id: "c-obj-2",
    topicId: "sf-objects",
    kind: "tf",
    prompt:
      "Si una validation rule evalúa a TRUE, Salesforce bloquea el save.",
    answerTrue: true,
    explanation: "TRUE = error. Recuerda: la fórmula describe el caso inválido.",
    difficulty: 1,
  },
  {
    id: "c-obj-3",
    topicId: "sf-objects",
    kind: "mcq",
    prompt: "Record Type sirve para…",
    options: [
      "Crear otro objeto",
      "Variantes de proceso/layout/picklist en el mismo objeto",
      "Definir OWD",
      "Sustituir Flow",
    ],
    answerIndex: 1,
    explanation:
      "Ej.: Case de “Reclamación” vs “Consulta” con layouts distintos.",
    difficulty: 2,
  },
  {
    id: "c-obj-4",
    topicId: "sf-objects",
    kind: "mcq",
    prompt: "Formula field vs roll-up summary:",
    options: [
      "Son lo mismo",
      "Formula calcula en el registro; roll-up agrega detalles M-D",
      "Roll-up solo en User",
      "Formula siempre necesita Apex",
    ],
    answerIndex: 1,
    explanation: "Dos herramientas distintas; no las mezcles en el examen.",
    difficulty: 2,
  },
  {
    id: "c-obj-5",
    topicId: "sf-objects",
    kind: "pair",
    prompt: "Empareja",
    term: "Lookup",
    definition: "Relación flexible entre objetos; el hijo puede ser independiente",
    explanation: "Menos estricta que Master-Detail.",
    difficulty: 1,
  },

  // UI — the FreeCram theme, original wording
  {
    id: "c-ui-1",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "En Cloud Kicks, los agentes quieren ver en Case información distinta según su rol. ¿Qué abordas?",
    options: [
      "Bajar el OWD de Case a Private",
      "Asignar Page Layouts / Lightning Record Pages por perfil (o app)",
      "Crear un permission set de “ver campos” global",
      "Desactivar Chatter",
    ],
    answerIndex: 1,
    explanation:
      "Cambiar “qué se ve en la página” es diseño UI: layouts y/o Lightning Record Pages asignadas por perfil/app/record type. OWD no rediseña la pantalla.",
    difficulty: 2,
  },
  {
    id: "c-ui-2",
    topicId: "sf-ui",
    kind: "mcq",
    prompt: "¿Quién asigna normalmente un Page Layout?",
    options: [
      "Por usuario individual solamente",
      "Por perfil (y record type)",
      "Solo por rol",
      "Solo por cola",
    ],
    answerIndex: 1,
    explanation: "Page Layout Assignment: Profile × Record Type.",
    difficulty: 1,
  },
  {
    id: "c-ui-3",
    topicId: "sf-ui",
    kind: "tf",
    prompt:
      "Una Lightning Record Page se puede activar de forma distinta para distintas apps o perfiles.",
    answerTrue: true,
    explanation:
      "Activation: Org Default, App Default, App+Profile, etc. Ideal para roles distintos.",
    difficulty: 1,
  },
  {
    id: "c-ui-4",
    topicId: "sf-ui",
    kind: "mcq",
    prompt: "Compact Layout afecta sobre todo…",
    options: [
      "OWD",
      "Campos del encabezado / highlights y vistas compactas",
      "Approval processes",
      "Licencias",
    ],
    answerIndex: 1,
    explanation: "No sustituye el layout completo de la página.",
    difficulty: 2,
  },
  {
    id: "c-ui-5",
    topicId: "sf-ui",
    kind: "mcq",
    prompt: "Dynamic Forms permite…",
    options: [
      "Cambiar el OWD automáticamente",
      "Mostrar/ocultar campos en la record page según reglas",
      "Crear usuarios en masa",
      "Sustituir Data Loader",
    ],
    answerIndex: 1,
    explanation: "UI condicional en Lightning sin clonar layouts sin control.",
    difficulty: 2,
  },
  {
    id: "c-ui-6",
    topicId: "sf-ui",
    kind: "pair",
    prompt: "Empareja",
    term: "Lightning App Builder",
    definition: "Herramienta para montar páginas Lightning con componentes",
    explanation: "Ahí editas Home, App y Record pages.",
    difficulty: 1,
  },
  {
    id: "c-ui-7",
    topicId: "sf-ui",
    kind: "tf",
    prompt:
      "Si un campo no aparece, siempre es porque falta en el Page Layout (nunca FLS).",
    answerTrue: false,
    explanation: "Puede ser layout, FLS, Dynamic Forms, o permisos de objeto.",
    difficulty: 2,
  },

  // Service
  {
    id: "c-svc-1",
    topicId: "sf-service",
    kind: "mcq",
    prompt: "Una Queue de Cases sirve para…",
    options: [
      "Definir OWD",
      "Tener una bandeja compartida donde varios agentes trabajan",
      "Crear dashboards",
      "Sustituir perfiles",
    ],
    answerIndex: 1,
    explanation: "Las colas son propiedad compartida de registros.",
    difficulty: 1,
  },
  {
    id: "c-svc-2",
    topicId: "sf-service",
    kind: "mcq",
    prompt: "Assignment Rules en Case…",
    options: [
      "Solo cambian el color",
      "Asignan automáticamente según criterios al crear",
      "Borran Cases cerrados",
      "Crean usuarios",
    ],
    answerIndex: 1,
    explanation: "Reglas evaluadas en orden; la primera que cumple gana.",
    difficulty: 2,
  },
  {
    id: "c-svc-3",
    topicId: "sf-service",
    kind: "tf",
    prompt:
      "Para que Support vea otra pantalla de Case que Sales, OWD es la herramienta correcta.",
    answerTrue: false,
    explanation: "OWD = sharing. Pantalla = layout / record page.",
    difficulty: 2,
  },
  {
    id: "c-svc-4",
    topicId: "sf-service",
    kind: "pair",
    prompt: "Empareja",
    term: "Case",
    definition: "Registro de una solicitud o incidencia de soporte",
    explanation: "Núcleo de Service Cloud básico para Admin.",
    difficulty: 1,
  },
  {
    id: "c-svc-5",
    topicId: "sf-service",
    kind: "mcq",
    prompt:
      "Quieres campos distintos en Case para el perfil “Tier 1” y “Tier 2”. Mejor opción:",
    options: [
      "Dos orgs distintas",
      "Layouts o record pages asignados por perfil",
      "Dos OWD distintos a la vez",
      "Borrar FLS",
    ],
    answerIndex: 1,
    explanation: "Misma idea que la pregunta de Cloud Kicks: personalizar la UI por rol/perfil.",
    difficulty: 2,
  },

  // Sales
  {
    id: "c-sales-1",
    topicId: "sf-sales",
    kind: "mcq",
    prompt: "Al convertir un Lead puedes crear…",
    options: [
      "Solo un Dashboard",
      "Account, Contact y opcionalmente Opportunity",
      "Solo un Permission Set",
      "Solo un Flow",
    ],
    answerIndex: 1,
    explanation: "Ese es el trio clásico de la conversión.",
    difficulty: 1,
  },
  {
    id: "c-sales-2",
    topicId: "sf-sales",
    kind: "tf",
    prompt: "Path en Lightning guía visualmente los stages de un proceso.",
    answerTrue: true,
    explanation: "Muy usado en Opportunity y Case.",
    difficulty: 1,
  },
  {
    id: "c-sales-3",
    topicId: "sf-sales",
    kind: "mcq",
    prompt: "Opportunity representa…",
    options: [
      "Un ticket de soporte",
      "Un negocio potencial/en curso con importe y stage",
      "Solo un email",
      "Una licencia",
    ],
    answerIndex: 1,
    explanation: "Corazón de Sales Cloud.",
    difficulty: 1,
  },
  {
    id: "c-sales-4",
    topicId: "sf-sales",
    kind: "pair",
    prompt: "Empareja",
    term: "Lead",
    definition: "Persona/empresa potencial aún no cualificada del todo",
    explanation: "Después de cualificar → convert.",
    difficulty: 1,
  },

  // Automation
  {
    id: "c-auto-1",
    topicId: "sf-auto",
    kind: "mcq",
    prompt: "Herramienta declarativa recomendada hoy para automatizar:",
    options: ["Workflow nuevo", "Flow Builder", "Solo Apex", "Excel"],
    answerIndex: 1,
    explanation: "Flow primero. Apex cuando Flow no llega.",
    difficulty: 1,
  },
  {
    id: "c-auto-2",
    topicId: "sf-auto",
    kind: "tf",
    prompt:
      "Un Record-Triggered Flow puede ser before-save o after-save.",
    answerTrue: true,
    explanation: "Before para el mismo registro; after para efectos colaterales.",
    difficulty: 2,
  },
  {
    id: "c-auto-3",
    topicId: "sf-auto",
    kind: "mcq",
    prompt: "Approval Process sirve para…",
    options: [
      "Importar CSV",
      "Enrutar un registro por aprobaciones con criterios y acciones",
      "Crear OWD",
      "Solo reports",
    ],
    answerIndex: 1,
    explanation: "Descuentos, vacaciones, gastos…",
    difficulty: 1,
  },
  {
    id: "c-auto-4",
    topicId: "sf-auto",
    kind: "mcq",
    prompt: "¿Cuándo Apex frente a Flow?",
    options: [
      "Nunca",
      "Lógica muy compleja, bulk extremo o integraciones que Flow no cubre bien",
      "Para cambiar el logo",
      "Para crear un report",
    ],
    answerIndex: 1,
    explanation: "El admin elige la herramienta mínima suficiente.",
    difficulty: 2,
  },
  {
    id: "c-auto-5",
    topicId: "sf-auto",
    kind: "pair",
    prompt: "Empareja",
    term: "Order of execution",
    definition: "Orden interno al guardar (validations, flows, commit…)",
    explanation: "Sirve para depurar automatizaciones que “se pisan”.",
    difficulty: 3,
  },

  // Reports
  {
    id: "c-rep-1",
    topicId: "sf-reports",
    kind: "mcq",
    prompt: "Un Tabular report es…",
    options: [
      "Una tabla simple sin agrupaciones",
      "Siempre un dashboard",
      "Solo para Cases",
      "Un tipo de Flow",
    ],
    answerIndex: 0,
    explanation: "Summary/Matrix agrupan; Joined combina bloques.",
    difficulty: 1,
  },
  {
    id: "c-rep-2",
    topicId: "sf-reports",
    kind: "tf",
    prompt: "Los buckets categorizan valores en el report sin crear un campo.",
    answerTrue: true,
    explanation: "Agrupación ad hoc en el informe.",
    difficulty: 2,
  },
  {
    id: "c-rep-3",
    topicId: "sf-reports",
    kind: "mcq",
    prompt: "Dashboard dinámico muestra datos…",
    options: [
      "Siempre del admin creador",
      "Según el usuario que lo ve (su acceso)",
      "Solo en Classic",
      "Sin running user en ningún caso",
    ],
    answerIndex: 1,
    explanation: "Respeta sharing del viewer.",
    difficulty: 2,
  },
  {
    id: "c-rep-4",
    topicId: "sf-reports",
    kind: "mcq",
    prompt: "Para evitar duplicados al crear registros sueles usar…",
    options: [
      "Solo Compact Layout",
      "Matching rules + Duplicate rules",
      "Solo Path",
      "Solo Freeze",
    ],
    answerIndex: 1,
    explanation: "Matching encuentra; Duplicate decide bloquear/permitir/alertar.",
    difficulty: 2,
  },
  {
    id: "c-rep-5",
    topicId: "sf-reports",
    kind: "pair",
    prompt: "Empareja",
    term: "Joined report",
    definition: "Informe con varios bloques relacionados en una vista",
    explanation: "Útil para comparar objetos distintos lado a lado.",
    difficulty: 2,
  },

  // Collab
  {
    id: "c-col-1",
    topicId: "sf-collab",
    kind: "mcq",
    prompt: "Tasks y Events son…",
    options: ["Layouts", "Activities", "OWD", "Licencias"],
    answerIndex: 1,
    explanation: "Actividades ligadas a personas y registros.",
    difficulty: 1,
  },
  {
    id: "c-col-2",
    topicId: "sf-collab",
    kind: "tf",
    prompt:
      "La calidad de los datos importa para que la IA / Agentforce sea útil.",
    answerTrue: true,
    explanation: "Basura dentro → basura fuera. El examen nuevo insiste en datos.",
    difficulty: 1,
  },
  {
    id: "c-col-3",
    topicId: "sf-collab",
    kind: "mcq",
    prompt: "Chatter Groups sirven para…",
    options: [
      "Definir FLS",
      "Colaborar en espacios de equipo (públicos/privados)",
      "Crear OWD",
      "Sustituir Data Loader",
    ],
    answerIndex: 1,
    explanation: "Colaboración, no seguridad de objeto.",
    difficulty: 1,
  },
  {
    id: "c-col-4",
    topicId: "sf-collab",
    kind: "pair",
    prompt: "Empareja",
    term: "Agentforce",
    definition: "Capacidad de agentes de IA asistiendo a usuarios en Salesforce",
    explanation: "Tema nuevo del exam guide; entiende el concepto y la gobernanza.",
    difficulty: 2,
  },
];

export const SALESFORCE_ADMIN_ES: Course = {
  id: "sf-admin-es",
  title: "Salesforce Administrator",
  shortTitle: "SF Admin",
  language: "es",
  examHint: "Platform Admin · estilo examen · práctica original (no dumps)",
  description:
    "Conceptos en español sencillo y luego escenarios al estilo del examen real. No usamos bancos filtrados tipo FreeCram.",
  topics,
  cards: [...cards, ...SF_ADMIN_EXAM_STYLE, ...SF_ADMIN_PDF_PRACTICE],
};
