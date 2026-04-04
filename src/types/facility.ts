export type FacilityStatus = 'operational' | 'damaged' | 'destroyed' | 'offline' | 'unknown';
export type FacilityType =
  | 'lng_terminal'
  | 'oil_terminal'
  | 'gas_processing'
  | 'refinery'
  | 'nuclear_plant'
  | 'nuclear_facility'
  | 'desalination';

export interface SubFacility {
  name: string;
  type: string;
  capacity: string;
  status: FacilityStatus;
  global_share_pct?: number;
  supply_loss?: string;
  supply_loss_mcm?: number;
  supply_loss_mbpd?: number;
}

export interface Facility {
  id: string;
  name: string;
  country: string;
  coordinates: { lat: number; lon: number };
  type: FacilityType;
  status: FacilityStatus;
  pre_crisis: {
    capacity_mtpa?: number;
    capacity_mbpd?: number;
    capacity_mcm_day?: number;
    capacity_bpd?: number;
    capacity_mw?: number;
    export_mbpd?: number;
    global_share_pct?: number;
    storage_mbbls?: number;
    domestic_share_pct?: number;
    products: string[];
    description: string;
  };
  post_crisis: {
    damage_level: 'minor' | 'moderate' | 'severe' | 'critical';
    remaining_capacity_pct: number;
    estimated_repair_months: number;
    supply_loss_mbpd?: number;
    supply_loss_mtpa?: number;
    supply_loss_mcm_day?: number;
    notes?: string;
  };
  sub_facilities?: SubFacility[];
}
