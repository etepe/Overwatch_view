import { create } from 'zustand';
import { Viewer, Cartesian3, Math as CesiumMath } from 'cesium';

interface ViewState {
  currentView: 'globe' | 'region' | 'facility';
  viewer: Viewer | null;
  setViewer: (viewer: Viewer) => void;
  setCurrentView: (view: 'globe' | 'region' | 'facility') => void;
  flyTo: (lon: number, lat: number, alt: number) => void;
}

export const useViewStore = create<ViewState>((set, get) => ({
  currentView: 'globe',
  viewer: null,

  setViewer: (viewer: Viewer) => {
    set({ viewer });
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  flyTo: (lon: number, lat: number, alt: number) => {
    const { viewer } = get();
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat, alt),
      orientation: {
        pitch: CesiumMath.toRadians(-60),
      },
    });
  },
}));
