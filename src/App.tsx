import { useEffect, useState, useCallback } from 'react';
import { Globe } from './components/Globe';
import { Header } from './components/Header';
import { LayerPanel } from './components/LayerPanel';
import { SearchBar } from './components/SearchBar';
import { FacilityList } from './components/FacilityList';
import { SupplyDashboard } from './components/SupplyDashboard';
import { FacilityPopup } from './components/FacilityPopup';
import { useDataStore } from './stores/dataStore';
import { useSelectionStore } from './stores/selectionStore';

export default function App() {
  const loadData = useDataStore((s) => s.loadData);
  const loaded = useDataStore((s) => s.loaded);
  const facilities = useDataStore((s) => s.facilities);
  const selectAll = useSelectionStore((s) => s.selectAll);
  const [popupFacilityId, setPopupFacilityId] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Select all facilities once data is loaded
  useEffect(() => {
    if (loaded && facilities.length > 0) {
      selectAll(facilities.map((f) => f.id));
    }
  }, [loaded, facilities, selectAll]);

  const handleFacilityClick = useCallback((id: string) => {
    setPopupFacilityId(id);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Globe onFacilityClick={handleFacilityClick} />
      <Header />
      <SearchBar />
      <LayerPanel />
      {loaded && (
        <>
          <FacilityList onFacilityClick={handleFacilityClick} />
          <SupplyDashboard />
          <FacilityPopup facilityId={popupFacilityId} onClose={() => setPopupFacilityId(null)} />
        </>
      )}
    </div>
  );
}
