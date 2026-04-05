import { useMemo } from 'react';
import { useSelectionStore } from '../stores/selectionStore';
import { useDataStore } from '../stores/dataStore';

export interface SupplyMetric {
  loss: number;
  unit: string;
  globalSharePct: number;
  facilityCount: number;
}

export interface SupplyCalculation {
  oil: SupplyMetric;
  lng: SupplyMetric;
  helium: SupplyMetric;
  totalSelected: number;
  totalFacilities: number;
}

export function useSupplyCalculation(): SupplyCalculation {
  const selectedIds = useSelectionStore((s) => s.selectedFacilityIds);
  const facilities = useDataStore((s) => s.facilities);
  const baselines = useDataStore((s) => s.baselines);

  return useMemo(() => {
    const selected = facilities.filter((f) => selectedIds.has(f.id));

    const oilLoss = selected.reduce((sum, f) => {
      let loss = f.post_crisis.supply_loss_mbpd ?? 0;
      if (f.sub_facilities) {
        loss += f.sub_facilities.reduce((s, sf) => s + (sf.supply_loss_mbpd ?? 0), 0);
      }
      return sum + loss;
    }, 0);

    const lngLoss = selected.reduce((sum, f) => {
      return sum + (f.post_crisis.supply_loss_mtpa ?? 0);
    }, 0);

    const heliumLoss = selected.reduce((sum, f) => {
      if (!f.sub_facilities) return sum;
      return (
        sum +
        f.sub_facilities
          .filter((sf) => sf.type === 'helium_plant')
          .reduce((s, sf) => s + (sf.supply_loss_mcm ?? 0), 0)
      );
    }, 0);

    return {
      oil: {
        loss: oilLoss,
        unit: 'Mbpd',
        globalSharePct: baselines.oil_production_mbpd > 0 ? (oilLoss / baselines.oil_production_mbpd) * 100 : 0,
        facilityCount: selected.filter(
          (f) => f.post_crisis.supply_loss_mbpd || f.sub_facilities?.some((sf) => sf.supply_loss_mbpd),
        ).length,
      },
      lng: {
        loss: lngLoss,
        unit: 'MTPA',
        globalSharePct: baselines.lng_capacity_mtpa > 0 ? (lngLoss / baselines.lng_capacity_mtpa) * 100 : 0,
        facilityCount: selected.filter((f) => f.post_crisis.supply_loss_mtpa).length,
      },
      helium: {
        loss: heliumLoss,
        unit: 'M m\u00B3/yr',
        globalSharePct:
          baselines.helium_production_mcm_year > 0
            ? (heliumLoss / baselines.helium_production_mcm_year) * 100
            : 0,
        facilityCount: selected.filter((f) => f.sub_facilities?.some((sf) => sf.type === 'helium_plant')).length,
      },
      totalSelected: selected.length,
      totalFacilities: facilities.length,
    };
  }, [selectedIds, facilities, baselines]);
}
