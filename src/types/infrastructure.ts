export interface Pipeline {
  id: string;
  name: string;
  country: string;
  type: 'oil_pipeline' | 'gas_pipeline';
  capacity_mbpd?: number;
  capacity_bcf_day?: number;
  status: 'operational' | 'disrupted' | 'offline' | 'limited';
  is_bypass: boolean;
  bypass_for?: string;
  coordinates: Array<{ lat: number; lon: number }>;
  description: string;
}

export interface Chokepoint {
  id: string;
  name: string;
  coordinates: { lat: number; lon: number };
  width_km: number;
  pre_crisis_traffic_pct: number;
  post_crisis_traffic_pct: number;
  transit_drop_pct: number;
  daily_oil_transit_mbpd: number;
  global_oil_share_pct: number;
  global_lng_share_pct: number;
  description: string;
  zone_radius_km: number;
}
