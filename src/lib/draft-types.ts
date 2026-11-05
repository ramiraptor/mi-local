// Estructura de los borradores anónimos (localStorage, 7 días)
import type {
  BudgetFlexibility,
  BusinessStage,
  ContactPreference,
  OwnerType,
  PropertyCondition,
  PropertyType,
  SearchHorizon,
  TriStateDemand,
  TriStateOffer,
} from "./constants";

export interface EntrepreneurDraftData {
  // Bloque 1 · Negocio
  rubro: string;
  subrubro: string;
  stage: BusinessStage | "";
  business_name: string;
  is_first_location: boolean | null;
  // Bloque 2 · Ubicación
  region_id: string;
  commune_ids: string[];
  sector: string;
  territorial_flexibility: boolean | null;
  // Bloque 3 · Presupuesto
  max_monthly_rent_clp: number | null;
  budget_flexibility: BudgetFlexibility | "";
  // Bloque 4 · Tipo y superficie
  property_type: PropertyType | "";
  surface_min_m2: number | null;
  surface_max_m2: number | null;
  // Bloque 5 · Necesidades técnicas (triestado demanda)
  gas_extraction: TriStateDemand;
  three_phase_power: TriStateDemand;
  accessibility_required: TriStateDemand;
  parking_required: TriStateDemand;
  storage_required: TriStateDemand;
  terrace_required: TriStateDemand;
  gastronomic_fit_required: TriStateDemand;
  // Bloque 6 · Horizonte
  horizon: SearchHorizon | "";
  install_window_note: string;
  // Bloque 7 · Contacto proactivo (preferencia separada, desmarcada)
  proactive_opt_in: boolean;
  completed: boolean;
}

export interface OwnerDraftData {
  // Bloque 1 · Oferente
  owner_type: OwnerType | "";
  contact_preference: ContactPreference | "";
  owner_relationship: OwnerType | "";
  // Bloque 2 · Inmueble
  property_type: PropertyType | "";
  title: string;
  description: string;
  surface_m2: number | null;
  bathrooms: number | null;
  condition: PropertyCondition | "";
  // Bloque 3 · Ubicación (address_full PRIVADO)
  region_id: string;
  commune_id: string;
  sector: string;
  address_full: string;
  // Bloque 4 · Comercial
  monthly_rent_clp: number | null;
  rent_is_negotiable: boolean;
  common_expenses_clp: number | null;
  guarantee_clp: number | null;
  // Bloque 5 · Disponibilidad
  available_from: string;
  usage_restrictions: string;
  // Bloque 6 · Atributos (triestado oferta; estacionamientos numéricos)
  has_gas_extraction: TriStateOffer;
  has_three_phase_power: TriStateOffer;
  has_accessibility: TriStateOffer;
  parking_spaces: number | null;
  has_storage: TriStateOffer;
  has_terrace_or_patio: TriStateOffer;
  has_food_service_fitout: TriStateOffer;
  completed: boolean;
}

export const EMPTY_ENTREPRENEUR_DRAFT: EntrepreneurDraftData = {
  rubro: "",
  subrubro: "",
  stage: "",
  business_name: "",
  is_first_location: null,
  region_id: "",
  commune_ids: [],
  sector: "",
  territorial_flexibility: null,
  max_monthly_rent_clp: null,
  budget_flexibility: "",
  property_type: "",
  surface_min_m2: null,
  surface_max_m2: null,
  gas_extraction: "INDIFERENTE",
  three_phase_power: "INDIFERENTE",
  accessibility_required: "INDIFERENTE",
  parking_required: "INDIFERENTE",
  storage_required: "INDIFERENTE",
  terrace_required: "INDIFERENTE",
  gastronomic_fit_required: "INDIFERENTE",
  horizon: "",
  install_window_note: "",
  proactive_opt_in: false,
  completed: false,
};

export const EMPTY_OWNER_DRAFT: OwnerDraftData = {
  owner_type: "",
  contact_preference: "",
  owner_relationship: "",
  property_type: "",
  title: "",
  description: "",
  surface_m2: null,
  bathrooms: null,
  condition: "",
  region_id: "",
  commune_id: "",
  sector: "",
  address_full: "",
  monthly_rent_clp: null,
  rent_is_negotiable: false,
  common_expenses_clp: null,
  guarantee_clp: null,
  available_from: "",
  usage_restrictions: "",
  has_gas_extraction: "NO_SE",
  has_three_phase_power: "NO_SE",
  has_accessibility: "NO_SE",
  parking_spaces: null,
  has_storage: "NO_SE",
  has_terrace_or_patio: "NO_SE",
  has_food_service_fitout: "NO_SE",
  completed: false,
};
