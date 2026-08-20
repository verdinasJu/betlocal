import type { Course } from "@/lib/study/types";

/**
 * Pack inicial: Salesforce Administrator (estudio en español).
 *
 * Preguntas de práctica originales orientadas a conceptos públicos de
 * Trailhead / documentación. No son dumps del examen oficial.
 */
export const SALESFORCE_ADMIN_ES: Course = {
  id: "sf-admin-es",
  title: "Salesforce Administrator",
  shortTitle: "SF Admin",
  language: "es",
  examHint: "Certificación Admin · estudio en español · práctica, no dumps",
  description:
    "Usuarios, seguridad, objetos, automatización, informes y la consola de setup. Pensado para estudiar en el móvil con sesiones cortas.",
  topics: [
    {
      id: "sf-admin-users",
      courseId: "sf-admin-es",
      title: "Usuarios y acceso",
      summary: "Licencias, usuarios, login, congelar vs desactivar.",
      order: 1,
    },
    {
      id: "sf-admin-security",
      courseId: "sf-admin-es",
      title: "Seguridad y sharing",
      summary: "OWD, roles, perfiles, permission sets, sharing rules.",
      order: 2,
    },
    {
      id: "sf-admin-data",
      courseId: "sf-admin-es",
      title: "Objetos y datos",
      summary: "Estándar vs custom, campos, relaciones, validaciones.",
      order: 3,
    },
    {
      id: "sf-admin-auto",
      courseId: "sf-admin-es",
      title: "Automatización",
      summary: "Flow, Process Builder legacy, approval, order of execution.",
      order: 4,
    },
    {
      id: "sf-admin-reports",
      courseId: "sf-admin-es",
      title: "Informes y dashboards",
      summary: "Tipos de report, buckets, joined, dashboards dinámicos.",
      order: 5,
    },
    {
      id: "sf-admin-setup",
      courseId: "sf-admin-es",
      title: "Setup y compañía",
      summary: "Company settings, fiscal year, UI, App Manager.",
      order: 6,
    },
  ],
  cards: [
    // —— Usuarios ——
    {
      id: "sf-u-01",
      topicId: "sf-admin-users",
      kind: "mcq",
      prompt: "¿Qué hace congelar (freeze) un usuario?",
      options: [
        "Borra el usuario y sus datos",
        "Impide el login pero conserva la licencia asignada",
        "Solo desactiva el email",
        "Convierte el usuario en contacto",
      ],
      answerIndex: 1,
      explanation:
        "Freeze bloquea el acceso de inmediato sin liberar la licencia. Deactivate libera la licencia para reasignarla.",
      sourceUrl: "https://trailhead.salesforce.com/content/learn/modules/admin_intro_setup/admin_intro_setup_users",
      sourceLabel: "Trailhead · Users",
      difficulty: 1,
    },
    {
      id: "sf-u-02",
      topicId: "sf-admin-users",
      kind: "tf",
      prompt:
        "Un usuario puede tener varios perfiles a la vez en la misma org.",
      answerTrue: false,
      explanation:
        "Cada usuario tiene un solo perfil. Lo que se apila son permission sets / permission set groups.",
      difficulty: 1,
    },
    {
      id: "sf-u-03",
      topicId: "sf-admin-users",
      kind: "mcq",
      prompt: "¿Para qué sirven principalmente los permission sets?",
      options: [
        "Sustituir por completo a los perfiles",
        "Ampliar permisos sin crear un perfil nuevo por cada variación",
        "Definir la jerarquía de roles",
        "Configurar el OWD de la org",
      ],
      answerIndex: 1,
      explanation:
        "El perfil es la base; los permission sets añaden capacidades (objeto, campo, sistema) de forma modular.",
      difficulty: 1,
    },
    {
      id: "sf-u-04",
      topicId: "sf-admin-users",
      kind: "pair",
      prompt: "Empareja",
      term: "Role hierarchy",
      definition:
        "Abre acceso vertical a registros según el rol del usuario en la jerarquía",
      explanation:
        "La jerarquía de roles afecta al sharing de registros, no sustituye a perfiles.",
      difficulty: 2,
    },
    {
      id: "sf-u-05",
      topicId: "sf-admin-users",
      kind: "mcq",
      prompt:
        "Necesitas que Marketing vea todas las Campaigns pero Sales no. ¿Qué miras primero?",
      options: [
        "Solo validation rules",
        "OWD de Campaign + sharing / roles / teams",
        "Solo page layouts",
        "Solo Flow",
      ],
      answerIndex: 1,
      explanation:
        "La visibilidad de registros empieza en OWD y se abre con roles, sharing rules, teams, manual sharing, etc.",
      difficulty: 2,
    },

    // —— Seguridad ——
    {
      id: "sf-s-01",
      topicId: "sf-admin-security",
      kind: "mcq",
      prompt: "OWD (Organization-Wide Defaults) define…",
      options: [
        "El layout de la página de inicio",
        "El acceso base a registros de un objeto para toda la org",
        "Los campos obligatorios",
        "La API version",
      ],
      answerIndex: 1,
      explanation:
        "OWD es el suelo de sharing (Private, Public Read Only, Public Read/Write, Controlled by Parent…).",
      sourceUrl:
        "https://trailhead.salesforce.com/content/learn/modules/data_security",
      sourceLabel: "Trailhead · Data Security",
      difficulty: 1,
    },
    {
      id: "sf-s-02",
      topicId: "sf-admin-security",
      kind: "tf",
      prompt:
        "Las sharing rules pueden restringir el acceso por debajo del OWD.",
      answerTrue: false,
      explanation:
        "Sharing rules solo abren acceso. Para restringir más, bajas el OWD o usas otros controles (perfil, etc.).",
      difficulty: 2,
    },
    {
      id: "sf-s-03",
      topicId: "sf-admin-security",
      kind: "mcq",
      prompt: "Field-Level Security (FLS) controla…",
      options: [
        "Qué registros ves en una lista",
        "Si un campo es visible/editable según perfil o permission set",
        "El color del tema Lightning",
        "La cuota de almacenamiento",
      ],
      answerIndex: 1,
      explanation:
        "FLS es por campo y perfil/permission set. Es independiente del sharing de registros.",
      difficulty: 1,
    },
    {
      id: "sf-s-04",
      topicId: "sf-admin-security",
      kind: "pair",
      prompt: "Empareja",
      term: "Profile",
      definition:
        "Conjunto base de permisos de objeto, campo, app y sistema de un usuario",
      explanation:
        "Sin perfil no hay usuario usable; los permission sets complementan.",
      difficulty: 1,
    },
    {
      id: "sf-s-05",
      topicId: "sf-admin-security",
      kind: "mcq",
      prompt:
        "Un usuario no ve un campo en la página aunque el layout lo incluye. ¿Causa típica?",
      options: [
        "El OWD está en Public Read/Write",
        "FLS oculta el campo para su perfil",
        "No tiene licencia Salesforce",
        "El fiscal year está roto",
      ],
      answerIndex: 1,
      explanation:
        "Layout ≠ FLS. El layout puede mostrar el hueco, pero FLS decide si el usuario lo ve o edita.",
      difficulty: 2,
    },
    {
      id: "sf-s-06",
      topicId: "sf-admin-security",
      kind: "tf",
      prompt:
        "Con OWD Private en Account, el dueño del registro siempre puede verlo.",
      answerTrue: true,
      explanation:
        "El owner (y quien esté por encima en la role hierarchy, según config) mantiene acceso; el resto parte de Private.",
      difficulty: 1,
    },

    // —— Datos ——
    {
      id: "sf-d-01",
      topicId: "sf-admin-data",
      kind: "mcq",
      prompt: "Una Lookup relationship…",
      options: [
        "Siempre borra el hijo al borrar el padre",
        "Es un enlace opcional/flexible entre objetos; el hijo puede sobrevivir",
        "Solo existe entre User y Account",
        "Sustituye a los validation rules",
      ],
      answerIndex: 1,
      explanation:
        "Master-Detail es más estricta (cascada, seguridad heredada). Lookup es más suelta.",
      difficulty: 1,
    },
    {
      id: "sf-d-02",
      topicId: "sf-admin-data",
      kind: "mcq",
      prompt: "Master-Detail implica, entre otras cosas…",
      options: [
        "Que el detalle no puede existir sin el master",
        "Que no se pueden crear custom objects",
        "Que el OWD del detalle es siempre Public",
        "Que no hay roll-up summary posibles",
      ],
      answerIndex: 0,
      explanation:
        "El detalle depende del master; además permite roll-up summary en el padre.",
      difficulty: 2,
    },
    {
      id: "sf-d-03",
      topicId: "sf-admin-data",
      kind: "tf",
      prompt:
        "Una validation rule puede impedir guardar un registro si una condición se cumple.",
      answerTrue: true,
      explanation:
        "Exacto: si la fórmula evalúa a true, Salesforce muestra el error y bloquea el save.",
      difficulty: 1,
    },
    {
      id: "sf-d-04",
      topicId: "sf-admin-data",
      kind: "pair",
      prompt: "Empareja",
      term: "Record Type",
      definition:
        "Variante de un objeto con procesos, layouts y picklists distintos",
      explanation:
        "Los record types segmentan UX y procesos sin crear otro objeto.",
      difficulty: 2,
    },
    {
      id: "sf-d-05",
      topicId: "sf-admin-data",
      kind: "mcq",
      prompt: "¿Qué diferencia clave hay entre formula field y roll-up summary?",
      options: [
        "Ninguna: son lo mismo",
        "Formula calcula en el mismo registro; roll-up agrega hijos master-detail",
        "Roll-up solo existe en User",
        "Formula requiere Apex siempre",
      ],
      answerIndex: 1,
      explanation:
        "Formula = valores del registro (y lookups relacionados). Roll-up = COUNT/SUM/MIN/MAX de detalles.",
      difficulty: 2,
    },
    {
      id: "sf-d-06",
      topicId: "sf-admin-data",
      kind: "mcq",
      prompt: "Page Layout controla…",
      options: [
        "Qué campos/secciones/botones se muestran en la UI para un perfil/record type",
        "El OWD del objeto",
        "La licencia del usuario",
        "La versión de API",
      ],
      answerIndex: 0,
      explanation:
        "Layouts = presentación. No otorgan permisos de campo por sí solos (ahí entra FLS).",
      difficulty: 1,
    },

    // —— Automatización ——
    {
      id: "sf-a-01",
      topicId: "sf-admin-auto",
      kind: "mcq",
      prompt:
        "Hoy, ¿cuál es la herramienta declarativa recomendada para la mayoría de automatizaciones nuevas?",
      options: [
        "Workflow Rules nuevas",
        "Flow Builder",
        "Solo Apex Triggers",
        "Process Builder para todo",
      ],
      answerIndex: 1,
      explanation:
        "Salesforce empuja Flow como sucesor de Workflow/Process Builder. Apex cuando hace falta código.",
      sourceUrl:
        "https://trailhead.salesforce.com/content/learn/trails/build-flows-with-flow-builder",
      sourceLabel: "Trailhead · Flow",
      difficulty: 1,
    },
    {
      id: "sf-a-02",
      topicId: "sf-admin-auto",
      kind: "tf",
      prompt:
        "Un Record-Triggered Flow puede ejecutarse antes (before) o después (after) de guardar.",
      answerTrue: true,
      explanation:
        "Before para actualizar el mismo registro sin DML extra; after para trabajo relacionado / acciones externas.",
      difficulty: 2,
    },
    {
      id: "sf-a-03",
      topicId: "sf-admin-auto",
      kind: "mcq",
      prompt: "Approval Process sirve para…",
      options: [
        "Importar CSV",
        "Enrutar un registro por pasos de aprobación con criterios y acciones",
        "Crear dashboards",
        "Definir OWD",
      ],
      answerIndex: 1,
      explanation:
        "Clásico en descuentos, vacaciones, gastos: submit → approvers → locked fields / acciones.",
      difficulty: 1,
    },
    {
      id: "sf-a-04",
      topicId: "sf-admin-auto",
      kind: "pair",
      prompt: "Empareja",
      term: "Order of execution",
      definition:
        "Secuencia interna de Salesforce al guardar (validations, flows, commits…)",
      explanation:
        "Importa para depurar por qué una automation ‘no pega’ o pisa a otra.",
      difficulty: 3,
    },
    {
      id: "sf-a-05",
      topicId: "sf-admin-auto",
      kind: "mcq",
      prompt: "¿Cuándo preferirías Apex frente a Flow?",
      options: [
        "Nunca: Flow lo hace todo",
        "Lógica compleja, bulk extremo, o APIs/integraciones que Flow no cubre bien",
        "Solo para cambiar el logo",
        "Solo para crear usuarios",
      ],
      answerIndex: 1,
      explanation:
        "Admin exam espera que sepas el límite: Flow primero; código cuando el caso lo exige.",
      difficulty: 2,
    },

    // —— Informes ——
    {
      id: "sf-r-01",
      topicId: "sf-admin-reports",
      kind: "mcq",
      prompt: "Un Tabular report es…",
      options: [
        "Una tabla simple sin agrupaciones",
        "Siempre un dashboard",
        "Solo para Opportunities",
        "Un tipo de Flow",
      ],
      answerIndex: 0,
      explanation:
        "Tabular = lista. Summary/Matrix agrupan. Joined combina varios report blocks.",
      difficulty: 1,
    },
    {
      id: "sf-r-02",
      topicId: "sf-admin-reports",
      kind: "tf",
      prompt:
        "Los buckets en un report permiten categorizar valores sin crear un campo en el objeto.",
      answerTrue: true,
      explanation:
        "Buckets = agrupación ad hoc en el informe (p. ej. rangos de importe).",
      difficulty: 2,
    },
    {
      id: "sf-r-03",
      topicId: "sf-admin-reports",
      kind: "mcq",
      prompt: "Un dashboard dinámico muestra datos…",
      options: [
        "Siempre del admin que lo creó",
        "Según el usuario que lo está viendo (su acceso)",
        "Solo en Classic",
        "Sin necesidad de running user",
      ],
      answerIndex: 1,
      explanation:
        "Dynamic dashboards respetan el sharing del viewer; los estáticos usan un running user fijo.",
      difficulty: 2,
    },
    {
      id: "sf-r-04",
      topicId: "sf-admin-reports",
      kind: "pair",
      prompt: "Empareja",
      term: "Joined report",
      definition:
        "Informe con varios bloques relacionados en una sola vista",
      explanation:
        "Útil para ver, p. ej., Cases y Opportunities lado a lado con un eje común.",
      difficulty: 2,
    },

    // —— Setup ——
    {
      id: "sf-c-01",
      topicId: "sf-admin-setup",
      kind: "mcq",
      prompt: "Company Information en Setup incluye, entre otras cosas…",
      options: [
        "Solo Apex classes",
        "Licencias, locales, moneda por defecto, info de la org",
        "Solo password policies de un perfil",
        "Solo report folders",
      ],
      answerIndex: 1,
      explanation:
        "Es el ‘carné’ de la org: licencias disponibles, direcciones, default locale/currency…",
      difficulty: 1,
    },
    {
      id: "sf-c-02",
      topicId: "sf-admin-setup",
      kind: "tf",
      prompt:
        "El fiscal year puede ser estándar (gregoriano) o custom según la empresa.",
      answerTrue: true,
      explanation:
        "Custom fiscal years se usan cuando el año fiscal no sigue el calendario civil.",
      difficulty: 1,
    },
    {
      id: "sf-c-03",
      topicId: "sf-admin-setup",
      kind: "mcq",
      prompt: "App Manager sirve para…",
      options: [
        "Gestionar Lightning Apps (navegación, branding, utility items)",
        "Borrar la org",
        "Configurar OWD global de todos los objetos de golpe",
        "Solo instalar AppExchange packages",
      ],
      answerIndex: 0,
      explanation:
        "Desde App Manager creas/editas apps Lightning y su navegación.",
      difficulty: 1,
    },
    {
      id: "sf-c-04",
      topicId: "sf-admin-setup",
      kind: "pair",
      prompt: "Empareja",
      term: "Lightning App",
      definition:
        "Conjunto de items de navegación y utilidades para un grupo de usuarios",
      explanation:
        "No es un objeto: es el ‘escritorio’ Lightning que asignas por perfil.",
      difficulty: 1,
    },
    {
      id: "sf-c-05",
      topicId: "sf-admin-setup",
      kind: "mcq",
      prompt:
        "Password policies y login IP ranges se configuran típicamente a nivel de…",
      options: [
        "Report type",
        "Profile (y a veces org-wide settings relacionados)",
        "Dashboard filter",
        "Bucket field",
      ],
      answerIndex: 1,
      explanation:
        "Muchas políticas de login viven en el perfil; hay también settings de toda la org.",
      difficulty: 2,
    },
  ],
};

export const COURSES: Course[] = [SALESFORCE_ADMIN_ES];

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getDefaultCourse(): Course {
  return SALESFORCE_ADMIN_ES;
}
