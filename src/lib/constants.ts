// Contratos canónicos MiLocal MVP1 — nomenclatura EXACTA del PRD Maestro §15/§4.
// Las máquinas de estado son independientes: nunca mezclarlas.

export const ASSESSMENT_STATUS = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUS)[number];

export const PROPERTY_STATUS = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUS)[number];

export const INTEREST_INTENT = ["CONTACT", "VISIT"] as const;
export type InterestIntent = (typeof INTEREST_INTENT)[number];

export const COMMERCIAL_STATUS = [
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "VISIT_COMPLETED",
  "IN_NEGOTIATION",
  "WON",
  "LOST",
] as const;
export type CommercialStatus = (typeof COMMERCIAL_STATUS)[number];

export const QUALIFICATION_STATUS = [
  "SIN_REVISAR",
  "NO_PERTINENTE",
  "POR_VALIDAR",
  "CALIFICADO",
] as const;
export type QualificationStatus = (typeof QUALIFICATION_STATUS)[number];

export const PROPERTY_TYPE = ["LOCAL_COMERCIAL", "OFICINA", "BODEGA_GALPON", "OTRO"] as const;
export type PropertyType = (typeof PROPERTY_TYPE)[number];

export const OWNER_TYPE = ["PROPIETARIO", "CORREDOR", "REPRESENTANTE"] as const;
export type OwnerType = (typeof OWNER_TYPE)[number];

export const TRI_STATE_DEMAND = ["SI", "NO", "INDIFERENTE"] as const;
export type TriStateDemand = (typeof TRI_STATE_DEMAND)[number];

export const TRI_STATE_OFFER = ["SI", "NO", "NO_SE"] as const;
export type TriStateOffer = (typeof TRI_STATE_OFFER)[number];

export const BUDGET_FLEXIBILITY = ["SIN_FLEXIBILIDAD", "HASTA_10", "HASTA_20", "EVALUA_CASO"] as const;
export type BudgetFlexibility = (typeof BUDGET_FLEXIBILITY)[number];

export const BUSINESS_STAGE = ["IDEA", "EN_MARCHA", "EN_EXPANSION"] as const;
export type BusinessStage = (typeof BUSINESS_STAGE)[number];

export const SEARCH_HORIZON = [
  "INMEDIATO",
  "UNO_TRES_MESES",
  "TRES_SEIS_MESES",
  "MAS_SEIS_MESES",
  "EXPLORANDO",
] as const;
export type SearchHorizon = (typeof SEARCH_HORIZON)[number];

export const PROPERTY_CONDITION = ["EXCELENTE", "BUENO", "REGULAR", "A_REFACCIONAR"] as const;
export type PropertyCondition = (typeof PROPERTY_CONDITION)[number];

export const CONTACT_PREFERENCE = ["TELEFONO", "EMAIL", "WHATSAPP"] as const;
export type ContactPreference = (typeof CONTACT_PREFERENCE)[number];

// ── Etiquetas de presentación (es-CL) ────────────────────────────────────────
export const LABELS = {
  propertyType: {
    LOCAL_COMERCIAL: "Local comercial",
    OFICINA: "Oficina",
    BODEGA_GALPON: "Bodega / Galpón",
    OTRO: "Otro",
  } satisfies Record<PropertyType, string>,
  propertyStatus: {
    DRAFT: "Borrador",
    PUBLISHED: "Publicada",
    UNPUBLISHED: "Pausada",
    ARCHIVED: "Archivada",
  } satisfies Record<PropertyStatus, string>,
  commercialStatus: {
    NEW: "Nueva",
    CONTACTED: "Contactado",
    VISIT_SCHEDULED: "Visita coordinada",
    VISIT_COMPLETED: "Visita realizada",
    IN_NEGOTIATION: "En negociación",
    WON: "Ganada (WON)",
    LOST: "Perdida (LOST)",
  } satisfies Record<CommercialStatus, string>,
  qualification: {
    SIN_REVISAR: "Sin revisar",
    NO_PERTINENTE: "No pertinente",
    POR_VALIDAR: "Por validar",
    CALIFICADO: "Calificado",
  } satisfies Record<QualificationStatus, string>,
  intent: {
    CONTACT: "Quiero que me contacten",
    VISIT: "Quiero coordinar una visita",
  } satisfies Record<InterestIntent, string>,
  ownerType: {
    PROPIETARIO: "Propietario/a",
    CORREDOR: "Corredor/a",
    REPRESENTANTE: "Representante autorizado/a",
  } satisfies Record<OwnerType, string>,
  triDemand: {
    SI: "Sí",
    NO: "No",
    INDIFERENTE: "Indiferente",
  } satisfies Record<TriStateDemand, string>,
  triOffer: {
    SI: "Sí",
    NO: "No",
    NO_SE: "No sé",
  } satisfies Record<TriStateOffer, string>,
  budgetFlexibility: {
    SIN_FLEXIBILIDAD: "Sin flexibilidad",
    HASTA_10: "Hasta un 10% más",
    HASTA_20: "Hasta un 20% más",
    EVALUA_CASO: "Evaluaría según el caso",
  } satisfies Record<BudgetFlexibility, string>,
  businessStage: {
    IDEA: "Idea / proyecto",
    EN_MARCHA: "Negocio en marcha",
    EN_EXPANSION: "En expansión",
  } satisfies Record<BusinessStage, string>,
  horizon: {
    INMEDIATO: "Lo antes posible",
    UNO_TRES_MESES: "En 1 a 3 meses",
    TRES_SEIS_MESES: "En 3 a 6 meses",
    MAS_SEIS_MESES: "En más de 6 meses",
    EXPLORANDO: "Solo estoy explorando",
  } satisfies Record<SearchHorizon, string>,
  condition: {
    EXCELENTE: "Excelente",
    BUENO: "Bueno",
    REGULAR: "Regular",
    A_REFACCIONAR: "A refaccionar",
  } satisfies Record<PropertyCondition, string>,
  contactPreference: {
    TELEFONO: "Teléfono",
    EMAIL: "Correo",
    WHATSAPP: "WhatsApp",
  } satisfies Record<ContactPreference, string>,
} as const;

// Catálogo compartido de 7 atributos: demanda ↔ oferta (PRD Maestro §09)
export const SHARED_ATTRIBUTES = [
  { demand: "gas_extraction", offer: "has_gas_extraction", label: "Salida de gases" },
  { demand: "three_phase_power", offer: "has_three_phase_power", label: "Electricidad trifásica" },
  { demand: "accessibility_required", offer: "has_accessibility", label: "Accesibilidad universal" },
  { demand: "parking_required", offer: "parking_spaces", label: "Estacionamiento" },
  { demand: "storage_required", offer: "has_storage", label: "Bodega" },
  { demand: "terrace_required", offer: "has_terrace_or_patio", label: "Terraza / patio" },
  { demand: "gastronomic_fit_required", offer: "has_food_service_fitout", label: "Acondicionamiento gastronómico" },
] as const;

// Diccionario permitido de eventos de analítica propia (sin PII; /admin excluido)
export const ANALYTICS_EVENTS = [
  "landing_view",
  "cta_busco_local_click",
  "cta_tengo_local_click",
  "assessment_entrepreneur_started",
  "assessment_entrepreneur_completed",
  "assessment_owner_started",
  "assessment_owner_completed",
  "registration_completed",
  "property_published",
  "explore_view",
  "property_view",
  "interest_cta_click",
  "interest_submitted",
] as const;
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export const MAX_PHOTOS = 12;
export const MIN_PHOTOS = 1;
export const MAX_COMMUNES_PER_SEARCH = 3;
export const DRAFT_TTL_DAYS = 7;
export const SITE_NAME = "MiLocal";
