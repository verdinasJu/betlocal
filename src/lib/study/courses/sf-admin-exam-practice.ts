import type { StudyCard } from "@/lib/study/types";

/**
 * Banco de práctica al ESTILO del examen Platform Admin.
 *
 * Reglas:
 * - Escenarios (Cloud Kicks, Ursa Major… nombres públicos de Trailhead)
 * - Una respuesta correcta + distractores plausibles
 * - Explicación corta en español
 * - NO son dumps de FreeCram ni de ningún banco filtrado: redacción propia
 *   sobre objetivos públicos del exam guide / Trailhead.
 */
export const SF_ADMIN_EXAM_STYLE: StudyCard[] = [
  // —— Setup / Users ——
  {
    id: "ex-01",
    topicId: "sf-users",
    kind: "mcq",
    prompt:
      "Ursa Major Solar necesita bloquear YA el acceso de un comercial que deja la empresa hoy, pero todavía no han decidido a quién reasignar su licencia. ¿Qué hace el admin?",
    options: [
      "Delete User",
      "Freeze User",
      "Bajar el OWD de Opportunity a Private",
      "Quitar el role hierarchy",
    ],
    answerIndex: 1,
    explanation:
      "Freeze corta el login al momento y mantiene la licencia ocupada. Deactivate libera la licencia cuando ya sepas el reemplazo.",
    difficulty: 2,
  },
  {
    id: "ex-02",
    topicId: "sf-users",
    kind: "mcq",
    prompt:
      "Cloud Kicks quiere el mismo perfil base para todo Sales, pero solo 3 personas deben exportar reports. ¿Enfoque correcto?",
    options: [
      "Crear 3 perfiles casi idénticos",
      "Un perfil Sales + permission set de export para esos 3",
      "Darles el perfil System Administrator",
      "Poner OWD de Report en Public",
    ],
    answerIndex: 1,
    explanation:
      "Pocos perfiles + permission sets para excepciones. Evita la explosión de perfiles.",
    difficulty: 2,
  },
  {
    id: "ex-03",
    topicId: "sf-setup",
    kind: "mcq",
    prompt:
      "Al crear un usuario aparece un error de licencia. ¿Dónde confirmas el problema?",
    options: [
      "App Launcher",
      "Company Information",
      "Duplicate Rules",
      "Path Settings",
    ],
    answerIndex: 1,
    explanation:
      "Company Information muestra licencias usadas vs disponibles.",
    difficulty: 1,
  },

  // —— Security ——
  {
    id: "ex-04",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "Los managers de Cloud Kicks deben ver Opportunities de su equipo, pero no las de otros equipos. El OWD de Opportunity es Private. ¿Qué ayuda de forma natural?",
    options: [
      "Validation rule",
      "Role hierarchy",
      "Compact layout",
      "Fiscal year custom",
    ],
    answerIndex: 1,
    explanation:
      "Con OWD Private, la role hierarchy suele abrir acceso hacia arriba (managers → subordinados).",
    difficulty: 2,
  },
  {
    id: "ex-05",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "Un usuario ve el registro Account pero no el campo Annual Revenue, aunque el campo está en el page layout. ¿Qué revisas primero?",
    options: [
      "Sharing rules de Account",
      "Field-Level Security del perfil / permission set",
      "Assignment rules",
      "Login IP ranges",
    ],
    answerIndex: 1,
    explanation:
      "Ver el registro ≠ ver todos los campos. FLS controla el campo.",
    difficulty: 2,
  },
  {
    id: "ex-06",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "Marketing debe ver todas las Campaigns; el resto de la org no. OWD de Campaign está en Private. ¿Qué haces?",
    options: [
      "Sharing rule (o similar) que abra Campaigns a Marketing",
      "Bajar aún más el OWD",
      "Freeze a todos los no-Marketing",
      "Borrar el objeto Campaign",
    ],
    answerIndex: 0,
    explanation:
      "OWD Private + abrir con sharing a un public group / role de Marketing.",
    difficulty: 2,
  },
  {
    id: "ex-07",
    topicId: "sf-security",
    kind: "tf",
    prompt:
      "Si el OWD es Public Read/Write, una sharing rule puede volver el objeto Private solo para un equipo.",
    answerTrue: false,
    explanation:
      "Las sharing rules no restringen por debajo del OWD. Primero bajas el OWD.",
    difficulty: 2,
  },

  // —— Objects ——
  {
    id: "ex-08",
    topicId: "sf-objects",
    kind: "mcq",
    prompt:
      "Ursa Major quiere en Account el número total de casos hijos abiertos, actualizado solo. ¿Qué necesitas?",
    options: [
      "Formula field que cuente Cases",
      "Master-Detail (o relación que permita roll-up) + roll-up summary",
      "Solo Compact Layout",
      "Solo Chatter",
    ],
    answerIndex: 1,
    explanation:
      "Los roll-up summary agregan hijos en relaciones Master-Detail (Case→Account suele ser lookup; en el examen a menudo te plantean un custom M-D).",
    difficulty: 3,
  },
  {
    id: "ex-09",
    topicId: "sf-objects",
    kind: "mcq",
    prompt:
      "No se debe guardar una Opportunity Closed Won si Amount está vacío. ¿Qué usas?",
    options: [
      "Assignment rule",
      "Validation rule",
      "Sharing rule",
      "Duplicate rule",
    ],
    answerIndex: 1,
    explanation:
      "Validation rule: si la condición inválida es TRUE, bloquea el save.",
    difficulty: 1,
  },
  {
    id: "ex-10",
    topicId: "sf-objects",
    kind: "mcq",
    prompt:
      "Cloud Kicks usa dos procesos de Case (“Consulta” y “Incidencia”) con pantallas y picklists distintas. ¿Qué configuras?",
    options: [
      "Dos objetos Case",
      "Record Types (+ layouts asociados)",
      "Dos OWD",
      "Dos Company Informations",
    ],
    answerIndex: 1,
    explanation:
      "Record Types segmentan procesos/UI en el mismo objeto.",
    difficulty: 2,
  },

  // —— UI / Case page (FreeCram-like theme, original) ——
  {
    id: "ex-11",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "En Cloud Kicks, los agentes de soporte quieren ver en la página de Case información más útil según su rol (campos y componentes distintos). ¿Cómo lo consigues?",
    options: [
      "Cambiar el OWD de Case",
      "Asignar Page Layouts y/o Lightning Record Pages distintas por perfil (o por app)",
      "Crear un Flow que borre campos",
      "Desactivar FLS para todos",
    ],
    answerIndex: 1,
    explanation:
      "“Qué se ve en la página” = UI. Layouts por perfil y/o Record Pages activadas por app/perfil. OWD no rediseña la pantalla.",
    difficulty: 2,
  },
  {
    id: "ex-12",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "Quieres que en la app “Service Console” la record page de Case sea distinta que en la app “Sales”. ¿Dónde lo defines?",
    options: [
      "Solo en Company Information",
      "Activation de la Lightning Record Page (App / App+Profile)",
      "Solo en Duplicate Management",
      "Solo en Password Policies",
    ],
    answerIndex: 1,
    explanation:
      "Lightning App Builder → Activation: org default, app default, app+profile…",
    difficulty: 2,
  },
  {
    id: "ex-13",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "Los campos del encabezado (highlights) de Case no son los que quiere el equipo. ¿Qué editas?",
    options: [
      "OWD",
      "Compact Layout",
      "Assignment Rules",
      "Fiscal Year",
    ],
    answerIndex: 1,
    explanation:
      "Compact Layout controla highlights / vista compacta, no todo el detalle del layout.",
    difficulty: 2,
  },
  {
    id: "ex-14",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "Un campo debe mostrarse en Case solo si Priority = High. ¿Enfoque Lightning moderno?",
    options: [
      "Sharing rule",
      "Dynamic Forms (visibilidad condicional en la record page)",
      "Freeze User",
      "Tabular report",
    ],
    answerIndex: 1,
    explanation:
      "Dynamic Forms = campos condicionales en la página Lightning.",
    difficulty: 2,
  },
  {
    id: "ex-15",
    topicId: "sf-ui",
    kind: "tf",
    prompt:
      "Meter un campo en el Page Layout garantiza que todos los perfiles lo ven, aunque FLS lo oculte.",
    answerTrue: false,
    explanation:
      "Layout y FLS trabajan juntos: hace falta permiso de campo + presencia en layout (o Dynamic Forms).",
    difficulty: 2,
  },

  // —— Service ——
  {
    id: "ex-16",
    topicId: "sf-service",
    kind: "mcq",
    prompt:
      "Los Cases nuevos de “Billing” deben ir solos a la cola Billing_Queue. ¿Qué configuras?",
    options: [
      "Path",
      "Case Assignment Rules",
      "Compact Layout",
      "Login History",
    ],
    answerIndex: 1,
    explanation:
      "Assignment Rules evalúan criterios al crear y asignan cola o usuario.",
    difficulty: 2,
  },
  {
    id: "ex-17",
    topicId: "sf-service",
    kind: "mcq",
    prompt:
      "Varios agentes deben trabajar Cases desde una bandeja compartida sin dueño individual fijo. ¿Qué usas?",
    options: ["Public Group solo", "Queue", "Permission Set Group", "Bucket field"],
    answerIndex: 1,
    explanation: "Las queues son propietario compartido de registros.",
    difficulty: 1,
  },
  {
    id: "ex-18",
    topicId: "sf-service",
    kind: "mcq",
    prompt:
      "Tier 1 y Tier 2 necesitan campos distintos en Case. ¿Mejor opción?",
    options: [
      "Dos orgs",
      "Layouts o Lightning Record Pages por perfil",
      "Dos OWD a la vez en el mismo objeto",
      "Borrar validation rules",
    ],
    answerIndex: 1,
    explanation: "Misma familia de preguntas de “página útil por rol”.",
    difficulty: 2,
  },

  // —— Sales ——
  {
    id: "ex-19",
    topicId: "sf-sales",
    kind: "mcq",
    prompt:
      "Un Lead cualificado debe convertirse en Account + Contact + Opportunity. ¿Acción correcta?",
    options: [
      "Merge Account",
      "Convert Lead",
      "Freeze Lead",
      "Export Lead",
    ],
    answerIndex: 1,
    explanation: "Convert es el proceso estándar de cualificación.",
    difficulty: 1,
  },
  {
    id: "ex-20",
    topicId: "sf-sales",
    kind: "mcq",
    prompt:
      "Cloud Kicks quiere guiar a los comerciales por las etapas de Opportunity en Lightning. ¿Qué activas/configuras?",
    options: ["Path", "OWD", "Data Loader", "Login Flow"],
    answerIndex: 0,
    explanation: "Path muestra el proceso visual de stages/status.",
    difficulty: 1,
  },
  {
    id: "ex-21",
    topicId: "sf-sales",
    kind: "mcq",
    prompt:
      "Una Campaign debe relacionarse con Opportunities ganadas para medir ROI. Concepto clave:",
    options: [
      "Case Teams",
      "Campaign influence / membresía de campaña",
      "Freeze",
      "Tabular buckets",
    ],
    answerIndex: 1,
    explanation:
      "Las campañas se asocian a leads/contacts/opportunities para atribución de marketing.",
    difficulty: 2,
  },

  // —— Automation ——
  {
    id: "ex-22",
    topicId: "sf-auto",
    kind: "mcq",
    prompt:
      "Al crear un Case de Priority = High, debe enviarse un email al manager y crear una Task. ¿Herramienta preferida hoy?",
    options: [
      "Workflow Rule nueva",
      "Record-Triggered Flow",
      "Solo Page Layout",
      "Solo Report",
    ],
    answerIndex: 1,
    explanation:
      "Flow es el estándar actual. After-save para email + crear Task.",
    difficulty: 2,
  },
  {
    id: "ex-23",
    topicId: "sf-auto",
    kind: "mcq",
    prompt:
      "Hay que rellenar un campo del mismo Case antes de guardar, sin DML extra. ¿Tipo de Flow?",
    options: [
      "Screen Flow solo",
      "Before-save Record-Triggered Flow",
      "Schedule-Triggered Flow semanal",
      "Autolaunched sin trigger",
    ],
    answerIndex: 1,
    explanation:
      "Before-save actualiza el registro que dispara el flow de forma eficiente.",
    difficulty: 2,
  },
  {
    id: "ex-24",
    topicId: "sf-auto",
    kind: "mcq",
    prompt:
      "Un descuento > 25% en Opportunity requiere aprobación del director. ¿Qué usas?",
    options: [
      "Duplicate Rule",
      "Approval Process",
      "Compact Layout",
      "Queue de Reports",
    ],
    answerIndex: 1,
    explanation:
      "Approval Process: submit → aprobadores → acciones approve/reject.",
    difficulty: 1,
  },
  {
    id: "ex-25",
    topicId: "sf-auto",
    kind: "tf",
    prompt:
      "Para automatizaciones nuevas, Salesforce recomienda empezar por Process Builder en lugar de Flow.",
    answerTrue: false,
    explanation:
      "Process Builder/Workflow están en retirada. Flow primero.",
    difficulty: 1,
  },

  // —— Reports / Data ——
  {
    id: "ex-26",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Necesitas Opportunities agrupadas por Stage y por Owner en filas y columnas. ¿Tipo de report?",
    options: ["Tabular", "Summary", "Matrix", "Joined siempre"],
    answerIndex: 2,
    explanation: "Matrix agrupa en dos ejes.",
    difficulty: 2,
  },
  {
    id: "ex-27",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Cada comercial debe ver un dashboard solo con sus datos, sin crear uno por persona. ¿Qué usas?",
    options: [
      "Dashboard estático con running user = admin",
      "Dynamic dashboard",
      "Freeze",
      "Company Information",
    ],
    answerIndex: 1,
    explanation:
      "Dynamic dashboard respeta el acceso del usuario que lo mira.",
    difficulty: 2,
  },
  {
    id: "ex-28",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Al crear Accounts, Salesforce debe avisar si parece duplicado. ¿Qué combinas?",
    options: [
      "Path + Compact Layout",
      "Matching Rule + Duplicate Rule",
      "OWD + Freeze",
      "Flow + Fiscal Year",
    ],
    answerIndex: 1,
    explanation:
      "Matching encuentra similitudes; Duplicate define la acción (alert/block).",
    difficulty: 2,
  },
  {
    id: "ex-29",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Quieres categorizar Amount en “Pequeño / Mediano / Grande” solo dentro de un report, sin campo nuevo. ¿Qué usas?",
    options: ["Roll-up", "Bucket field", "Permission set", "Queue"],
    answerIndex: 1,
    explanation: "Buckets = categorías ad hoc en el informe.",
    difficulty: 2,
  },
  {
    id: "ex-30",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Hay que cargar 50.000 Contacts desde un CSV con relaciones. Herramienta típica:",
    options: [
      "Solo el Import Wizard siempre",
      "Data Loader (o herramienta de volumen similar)",
      "Chatter",
      "Path",
    ],
    answerIndex: 1,
    explanation:
      "Import Wizard para volúmenes pequeños/simples; Data Loader para más volumen y control.",
    difficulty: 2,
  },

  // —— Collab / Agentforce awareness ——
  {
    id: "ex-31",
    topicId: "sf-collab",
    kind: "mcq",
    prompt:
      "El equipo quiere discutir un Case en el propio registro. ¿Función típica?",
    options: ["OWD", "Chatter feed en el registro", "Fiscal Year", "Login IP"],
    answerIndex: 1,
    explanation: "Chatter colabora en contexto del registro.",
    difficulty: 1,
  },
  {
    id: "ex-32",
    topicId: "sf-collab",
    kind: "mcq",
    prompt:
      "Ursa Major empieza a usar agentes de IA (Agentforce). Como admin, ¿qué idea es más correcta?",
    options: [
      "La IA no necesita datos limpios",
      "Hay que cuidar permisos, datos y gobernanza de lo que el agente puede ver/hacer",
      "Solo hace falta un Compact Layout",
      "Se desactiva FLS para la IA siempre",
    ],
    answerIndex: 1,
    explanation:
      "El exam guide nuevo insiste en AI + datos + confianza. Basura in → basura out.",
    difficulty: 2,
  },
  {
    id: "ex-33",
    topicId: "sf-collab",
    kind: "tf",
    prompt:
      "Tasks y Events pueden relacionarse con personas (Who) y con registros como Account u Opportunity (What).",
    answerTrue: true,
    explanation: "Modelo clásico de Activities.",
    difficulty: 1,
  },

  // —— Más escenarios mixtos (sensación examen) ——
  {
    id: "ex-34",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "Un usuario con Object Permission Read en Case no ve ningún Case. OWD es Private y no es owner ni está en la jerarquía. ¿Qué falta probablemente?",
    options: [
      "Un Compact Layout",
      "Sharing (manual, rules, teams, queues…) que le abra registros",
      "Cambiar el fiscal year",
      "Quitar FLS",
    ],
    answerIndex: 1,
    explanation:
      "Permiso de objeto + sharing de registros. Sin sharing, Private = no ve los ajenos.",
    difficulty: 3,
  },
  {
    id: "ex-35",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "Support usa Lightning Console y quiere utilidad (macros, historial) en la barra. ¿Dónde se configura mucho de eso?",
    options: [
      "Solo Duplicate Rules",
      "Lightning App (utility items) / App Manager",
      "Solo OWD",
      "Solo Data Loader",
    ],
    answerIndex: 1,
    explanation:
      "Las apps Lightning definen navigation y utility bar de la consola.",
    difficulty: 2,
  },
  {
    id: "ex-36",
    topicId: "sf-objects",
    kind: "mcq",
    prompt:
      "Al borrar el registro padre deben borrarse automáticamente los hijos. ¿Relación?",
    options: ["Lookup laxa", "Master-Detail", "Hierarchy User", "External ID"],
    answerIndex: 1,
    explanation: "Cascada típica de Master-Detail.",
    difficulty: 1,
  },
  {
    id: "ex-37",
    topicId: "sf-auto",
    kind: "mcq",
    prompt:
      "Un Screen Flow guía al agente a crear Case con pantallas. ¿Cuándo se usa?",
    options: [
      "Solo de noche",
      "Cuando un usuario debe interactuar paso a paso",
      "Solo para OWD",
      "Solo para licencias",
    ],
    answerIndex: 1,
    explanation: "Screen Flow = UI guiada; Record-Triggered = sin pantallas al guardar.",
    difficulty: 1,
  },
  {
    id: "ex-38",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Quieres en un solo informe un bloque de Cases y otro de Opportunities relacionados. ¿Tipo?",
    options: ["Tabular", "Joined", "Solo Matrix", "Solo Bucket"],
    answerIndex: 1,
    explanation: "Joined report = varios bloques.",
    difficulty: 2,
  },
  {
    id: "ex-39",
    topicId: "sf-users",
    kind: "mcq",
    prompt:
      "Necesitas que un usuario deje de entrar y que su licencia quede libre para otra persona. ¿Acción?",
    options: ["Freeze", "Deactivate", "Solo quitar el role", "Delete org"],
    answerIndex: 1,
    explanation: "Deactivate libera licencia; Freeze no.",
    difficulty: 1,
  },
  {
    id: "ex-40",
    topicId: "sf-service",
    kind: "mcq",
    prompt:
      "Los agentes se quejan de que la página de Case muestra campos de ventas inútiles. Mejor primer paso:",
    options: [
      "Borrar el objeto Case",
      "Revisar Page Layout / Record Page asignados a su perfil",
      "Poner OWD en Controlled by Parent sin más",
      "Desactivar reports",
    ],
    answerIndex: 1,
    explanation:
      "Otra variante del mismo skill de examen: personalizar la experiencia por audiencia.",
    difficulty: 2,
  },

  // —— Ampliación para poder montar varios simulacros de 60 ——
  {
    id: "ex-41",
    topicId: "sf-setup",
    kind: "mcq",
    prompt:
      "Cloud Kicks cambia de moneda corporativa por defecto. ¿Dónde se configura normalmente?",
    options: [
      "Solo en un Report",
      "Company Information / settings de compañía",
      "Duplicate Rules",
      "Path Settings",
    ],
    answerIndex: 1,
    explanation: "Locale, moneda y datos de compañía viven en Setup de la org.",
    difficulty: 1,
  },
  {
    id: "ex-42",
    topicId: "sf-users",
    kind: "mcq",
    prompt:
      "Un usuario no puede ver una app Lightning que sí ven sus compañeros con el mismo rol. ¿Qué miras?",
    options: [
      "Solo el OWD de Account",
      "Asignación de la app al perfil (o permission set de app)",
      "Fiscal year",
      "Bucket fields",
    ],
    answerIndex: 1,
    explanation:
      "La visibilidad de apps se controla por perfil / permission set, no por rol.",
    difficulty: 2,
  },
  {
    id: "ex-43",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "Quieres que un public group vea ciertas Opportunities privadas. OWD = Private. ¿Mecanismo típico?",
    options: [
      "Validation rule",
      "Sharing rule basada en criteria o owner",
      "Compact Layout",
      "Freeze del owner",
    ],
    answerIndex: 1,
    explanation: "Sharing rules abren acceso por encima del OWD.",
    difficulty: 2,
  },
  {
    id: "ex-44",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "Un permission set puede…",
    options: [
      "Quitar permisos del perfil",
      "Añadir permisos encima del perfil",
      "Cambiar el OWD global",
      "Borrar usuarios",
    ],
    answerIndex: 1,
    explanation: "Los permission sets suman; no restan del perfil.",
    difficulty: 1,
  },
  {
    id: "ex-45",
    topicId: "sf-objects",
    kind: "mcq",
    prompt:
      "Necesitas un campo que calcule Amount * 1.21 en la misma Opportunity. ¿Qué creas?",
    options: [
      "Roll-up summary",
      "Formula field",
      "Queue",
      "Assignment rule",
    ],
    answerIndex: 1,
    explanation: "Formula = cálculo en el propio registro.",
    difficulty: 1,
  },
  {
    id: "ex-46",
    topicId: "sf-objects",
    kind: "mcq",
    prompt:
      "Un lookup de Contact a Account permite Contact sin Account. ¿Es coherente con Lookup?",
    options: [
      "No: Lookup siempre obliga",
      "Sí: Lookup puede ser opcional",
      "Solo con Master-Detail",
      "Solo con External ID",
    ],
    answerIndex: 1,
    explanation: "Lookup es flexible; Master-Detail es más estricto.",
    difficulty: 2,
  },
  {
    id: "ex-47",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "Ursa Major quiere botones distintos en Case según el perfil. ¿Dónde se controlan muchos botones estándar/custom de la página?",
    options: [
      "OWD",
      "Page Layout (y acciones en Lightning)",
      "Solo Data Loader",
      "Solo Matching Rules",
    ],
    answerIndex: 1,
    explanation: "Layouts y acciones Lightning definen la UI de botones.",
    difficulty: 2,
  },
  {
    id: "ex-48",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "La Home Page de Lightning debe mostrar un dashboard distinto para managers. ¿Enfoque?",
    options: [
      "Freeze a no-managers",
      "Lightning pages / asignaciones por perfil o app",
      "Solo tabular report",
      "Borrar App Manager",
    ],
    answerIndex: 1,
    explanation: "Home también se personaliza con App Builder y activaciones.",
    difficulty: 2,
  },
  {
    id: "ex-49",
    topicId: "sf-service",
    kind: "mcq",
    prompt:
      "Un Case puede tener varios contactos relacionados además del Contact principal. Concepto típico:",
    options: [
      "Case Contact Roles / related contacts",
      "Fiscal Year",
      "Login History",
      "Bucket",
    ],
    answerIndex: 0,
    explanation:
      "Service Cloud permite roles/contactos adicionales en el Case según edición/features.",
    difficulty: 3,
  },
  {
    id: "ex-50",
    topicId: "sf-service",
    kind: "mcq",
    prompt:
      "Los Cases de la cola Support_EMEA deben poder ser “reclamados” por el equipo EMEA. ¿Qué implica?",
    options: [
      "Solo FLS",
      "Miembros de la queue (usuarios/roles/grupos) con acceso a esa bandeja",
      "OWD Public Read/Write obligatorio siempre",
      "Desactivar assignment rules",
    ],
    answerIndex: 1,
    explanation: "Las queues tienen miembros que trabajan esos registros.",
    difficulty: 2,
  },
  {
    id: "ex-51",
    topicId: "sf-sales",
    kind: "mcq",
    prompt:
      "Al convertir un Lead, Salesforce avisa de posible duplicado de Account. ¿Qué ayuda a detectar duplicados?",
    options: [
      "Path",
      "Matching / Duplicate rules",
      "Compact Layout",
      "Freeze",
    ],
    answerIndex: 1,
    explanation: "Duplicate management en la creación/conversión.",
    difficulty: 2,
  },
  {
    id: "ex-52",
    topicId: "sf-sales",
    kind: "mcq",
    prompt:
      "Quieres que Closed Lost exija un motivo en un campo. Mejor herramienta:",
    options: [
      "Sharing rule",
      "Validation rule (o regla de stage + campo)",
      "Queue",
      "Tabular report",
    ],
    answerIndex: 1,
    explanation: "Validación al guardar según Stage.",
    difficulty: 2,
  },
  {
    id: "ex-53",
    topicId: "sf-auto",
    kind: "mcq",
    prompt:
      "Cada noche hay que actualizar un campo en Opportunities abiertas antiguas. ¿Tipo de automatización?",
    options: [
      "Solo Screen Flow manual",
      "Schedule-Triggered Flow (o proceso programado equivalente)",
      "Solo Page Layout",
      "Solo Chatter post",
    ],
    answerIndex: 1,
    explanation: "Automatización programada / scheduled flow.",
    difficulty: 2,
  },
  {
    id: "ex-54",
    topicId: "sf-auto",
    kind: "mcq",
    prompt:
      "Un Flow after-save crea Tasks pero a veces falla por límites. ¿Mentalidad correcta?",
    options: [
      "Ignorar bulk",
      "Diseñar pensando en muchos registros y límites de gobernanza",
      "Poner OWD a Private lo arregla",
      "Usar solo Freeze",
    ],
    answerIndex: 1,
    explanation: "El examen espera conciencia de bulk/governor limits a nivel admin.",
    difficulty: 3,
  },
  {
    id: "ex-55",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Un report Summary agrupa Opportunities por Stage. ¿Para qué sirve un chart en el report?",
    options: [
      "Cambiar OWD",
      "Visualizar el resumen en el propio informe",
      "Crear usuarios",
      "Aprobar descuentos",
    ],
    answerIndex: 1,
    explanation: "Los charts resumen el report; el dashboard reutiliza reports.",
    difficulty: 1,
  },
  {
    id: "ex-56",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Los usuarios no ven un dashboard porque la carpeta está restringida. ¿Qué revisas?",
    options: [
      "Solo FLS de Amount",
      "Acceso a la carpeta del dashboard / report",
      "Fiscal year",
      "Login IP del admin",
    ],
    answerIndex: 1,
    explanation: "Folders controlan quién ve reports/dashboards.",
    difficulty: 2,
  },
  {
    id: "ex-57",
    topicId: "sf-collab",
    kind: "mcq",
    prompt:
      "Quieres que un equipo colabore en privado sin toda la org. ¿Opción típica?",
    options: [
      "Public Group + Chatter Group privado / colaboración restringida",
      "OWD Public Read/Write en todo",
      "Borrar perfiles",
      "Solo Data Loader",
    ],
    answerIndex: 0,
    explanation: "Grupos privados / colaboración acotada.",
    difficulty: 2,
  },
  {
    id: "ex-58",
    topicId: "sf-collab",
    kind: "mcq",
    prompt:
      "Antes de activar un agente de IA que lea Cases, el admin debería preocuparse sobre todo de…",
    options: [
      "El color del tema",
      "Qué datos y permisos puede usar el agente",
      "El nombre del fiscal year",
      "Si Path está en verde",
    ],
    answerIndex: 1,
    explanation: "Gobernanza y datos > cosmética.",
    difficulty: 2,
  },
  {
    id: "ex-59",
    topicId: "sf-ui",
    kind: "mcq",
    prompt:
      "Dos record types de Case usan layouts distintos. Un usuario no ve el record type en el picklist. ¿Causa típica?",
    options: [
      "No está disponible el record type para su perfil",
      "OWD Private siempre lo oculta",
      "Falta un bucket",
      "Freeze automático",
    ],
    answerIndex: 0,
    explanation: "Record types se asignan por perfil.",
    difficulty: 2,
  },
  {
    id: "ex-60",
    topicId: "sf-setup",
    kind: "mcq",
    prompt:
      "Password policies (longitud, expiración) se configuran sobre todo a nivel de…",
    options: [
      "Report type",
      "Profile (y settings relacionados de la org)",
      "Dashboard filter",
      "Campaign member status",
    ],
    answerIndex: 1,
    explanation: "Políticas de login suelen vivir en el perfil / seguridad de org.",
    difficulty: 2,
  },
  {
    id: "ex-61",
    topicId: "sf-security",
    kind: "mcq",
    prompt:
      "Un usuario tiene Modify All en Case. ¿Qué implica a grandes rasgos?",
    options: [
      "Solo ve sus Cases",
      "Puede ver/editar Cases más allá del sharing normal (poder elevado)",
      "No puede editar nada",
      "Solo cambia el logo",
    ],
    answerIndex: 1,
    explanation: "View/Modify All son permisos potentes que saltan mucho sharing.",
    difficulty: 3,
  },
  {
    id: "ex-62",
    topicId: "sf-objects",
    kind: "mcq",
    prompt:
      "Quieres que un campo sea obligatorio solo en UI, no a nivel de base. ¿Dónde lo marcas a menudo?",
    options: [
      "OWD",
      "Page Layout (required) — con matices vs required a nivel campo",
      "Queue",
      "Path color",
    ],
    answerIndex: 1,
    explanation:
      "Required en layout es UX; required a nivel campo es más estricto (API incluida).",
    difficulty: 3,
  },
  {
    id: "ex-63",
    topicId: "sf-auto",
    kind: "mcq",
    prompt:
      "Un Approval Process puede…",
    options: [
      "Solo enviar un report",
      "Bloquear edición de campos mientras está pendiente (según config)",
      "Cambiar el OWD",
      "Crear licencias",
    ],
    answerIndex: 1,
    explanation: "Locking de registros/campos es típico en approvals.",
    difficulty: 2,
  },
  {
    id: "ex-64",
    topicId: "sf-reports",
    kind: "mcq",
    prompt:
      "Data Import Wizard vs Data Loader: Wizard es mejor cuando…",
    options: [
      "Siempre cargas millones de filas",
      "Cargas sencillas/pequeñas con interfaz guiada",
      "Nunca importas Contacts",
      "Solo exportas metadata",
    ],
    answerIndex: 1,
    explanation: "Wizard = simple; Loader = volumen/control.",
    difficulty: 2,
  },
  {
    id: "ex-65",
    topicId: "sf-sales",
    kind: "mcq",
    prompt:
      "Opportunity Product añade…",
    options: [
      "Solo un layout",
      "Líneas de producto/cantidad/precio a la Opportunity",
      "Un permission set",
      "Una queue",
    ],
    answerIndex: 1,
    explanation: "Productos de oportunidad = detalle comercial del deal.",
    difficulty: 2,
  },
];
