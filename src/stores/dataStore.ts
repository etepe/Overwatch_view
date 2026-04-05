import { create } from 'zustand';
import type { Facility } from '../types/facility';
import type { Pipeline, Chokepoint } from '../types/infrastructure';

interface GlobalBaselines {
  oil_production_mbpd: number;
  lng_capacity_mtpa: number;
  helium_production_mcm_year: number;
}

interface DataState {
  facilities: Facility[];
  baselines: GlobalBaselines;
  pipelines: Pipeline[];
  chokepoints: Chokepoint[];
  loaded: boolean;
  loadData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  facilities: [],
  baselines: { oil_production_mbpd: 102, lng_capacity_mtpa: 400, helium_production_mcm_year: 190 },
  pipelines: [],
  chokepoints: [],
  loaded: false,

  loadData: async () => {
    const [facRes, infraRes] = await Promise.all([
      fetch('/data/facilities.json'),
      fetch('/data/infrastructure.json'),
    ]);
    const facData = await facRes.json();
    const infraData = await infraRes.json();

    set({
      facilities: facData.facilities,
      baselines: facData.global_baselines,
      pipelines: infraData.pipelines,
      chokepoints: infraData.chokepoints,
      loaded: true,
    });
  },
}));
