// Tipos de filas de BD (subconjunto pragmático, alineado a supabase/migrations)
import type {
  AssessmentStatus,
  BudgetFlexibility,
  BusinessStage,
  CommercialStatus,
  ContactPreference,
  InterestIntent,
  OwnerType,
  PropertyCondition,
  PropertyStatus,
  PropertyType,
  QualificationStatus,
  SearchHorizon,
  TriStateDemand,
  TriStateOffer,
} from "./constants";

export interface Region {
  id: string;
  code: string;
  name: string;
}

export interface Commune {
  id: string;
  region_id: string;
  name: string;
  slug: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  entrepreneur_context_active: boolean;
  owner_context_active: boolean;
  marketing_opt_in: boolean;
  proactive_opportunities_opt_in: boolean;
  adult_declaration: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntrepreneurProfile {
  user_id: string;
  assessment_status: AssessmentStatus;
  rubro: string | null;
  subrubro: string | null;
  stage: BusinessStage | null;
  business_name: string | null;
  is_first_location: boolean | null;
}

export interface OwnerProfile {
  user_id: string;
  assessment_status: AssessmentStatus;
  owner_type: OwnerType | null;
  contact_preference: ContactPreference | null;
}

export interface ActiveSearch {
  id: string;
  user_id: string;
  region_id: string | null;
  commune_ids: string[];
  sector: string | null;
  territorial_flexibility: boolean | null;
  property_type: PropertyType | null;
  surface_min_m2: number | null;
  surface_max_m2: number | null;
  max_monthly_rent_clp: number | null;
  budget_flexibility: BudgetFlexibility | null;
  gas_extraction: TriStateDemand;
  three_phase_power: TriStateDemand;
  accessibility_required: TriStateDemand;
  parking_required: TriStateDemand;
  storage_required: TriStateDemand;
  terrace_required: TriStateDemand;
  gastronomic_fit_required: TriStateDemand;
  horizon: SearchHorizon | null;
  install_window_note: string | null;
}

export interface PropertyRow {
  id: string;
  owner_user_id: string;
  owner_relationship: OwnerType | null;
  status: PropertyStatus;
  title: string | null;
  description: string | null;
  property_type: PropertyType | null;
  region_id: string | null;
  commune_id: string | null;
  sector: string | null;
  address_full: string | null;
  lat_exact: number | null;
  lng_exact: number | null;
  monthly_rent_clp: number | null;
  rent_is_negotiable: boolean;
  common_expenses_clp: number | null;
  guarantee_clp: number | null;
  surface_m2: number | null;
  bathrooms: number | null;
  condition: PropertyCondition | null;
  available_from: string | null;
  usage_restrictions: string | null;
  has_gas_extraction: TriStateOffer;
  has_three_phase_power: TriStateOffer;
  has_accessibility: TriStateOffer;
  parking_spaces: number | null;
  has_storage: TriStateOffer;
  has_terrace_or_patio: TriStateOffer;
  has_food_service_fitout: TriStateOffer;
  availability_last_confirmed_at: string | null;
  published_at: string | null;
  moderation_locked: boolean;
  moderation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  storage_path: string;
  thumb_path: string;
  position: number;
  width: number | null;
  height: number | null;
}

// Proyección pública (vista public_properties): SOLO campos permitidos
export interface PublicProperty {
  id: string;
  title: string | null;
  description: string | null;
  property_type: PropertyType;
  region_name: string;
  region_code: string;
  commune_name: string;
  commune_slug: string;
  commune_id: string;
  sector: string | null;
  monthly_rent_clp: number | null;
  rent_is_negotiable: boolean;
  common_expenses_clp: number | null;
  guarantee_clp: number | null;
  surface_m2: number | null;
  bathrooms: number | null;
  condition: PropertyCondition | null;
  available_from: string | null;
  usage_restrictions: string | null;
  has_gas_extraction: TriStateOffer;
  has_three_phase_power: TriStateOffer;
  has_accessibility: TriStateOffer;
  parking_spaces: number | null;
  has_storage: TriStateOffer;
  has_terrace_or_patio: TriStateOffer;
  has_food_service_fitout: TriStateOffer;
  lat_public: number | null;
  lng_public: number | null;
  published_at: string;
}

export interface MyInterest {
  id: string;
  property_id: string;
  intent: InterestIntent;
  interest_attempt_count: number;
  last_attempt_at: string;
  created_at: string;
  property_title: string | null;
  property_status: PropertyStatus;
}

export interface AdminInterest {
  id: string;
  user_id: string;
  property_id: string;
  intent: InterestIntent;
  commercial_status: CommercialStatus;
  qualification_status: QualificationStatus;
  rent_snapshot_clp: number | null;
  interest_attempt_count: number;
  last_attempt_at: string;
  assigned_admin_user_id: string | null;
  source: string | null;
  lost_reason: string | null;
  won_evidence: string | null;
  closed_at: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  property_title: string | null;
  property_status: PropertyStatus;
  current_rent_clp: number | null;
  commune_name: string | null;
  assigned_admin_name: string | null;
}

export interface AdminStatus {
  is_admin: boolean;
  aal2: boolean;
  email_verified: boolean;
}
