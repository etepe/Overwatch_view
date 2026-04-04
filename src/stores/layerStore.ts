import { create } from 'zustand';

interface LayerInfo {
  enabled: boolean;
  locked: boolean;
}

interface LayerState {
  layers: Record<string, LayerInfo>;
  toggleLayer: (id: string) => void;
  setLayerEnabled: (id: string, enabled: boolean) => void;
}

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: {
    facilities: { enabled: true, locked: false },
    infrastructure: { enabled: true, locked: false },
    airspace: { enabled: false, locked: true },
    commodities: { enabled: false, locked: true },
    satellites: { enabled: false, locked: true },
  },

  toggleLayer: (id: string) => {
    const layer = get().layers[id];
    if (!layer || layer.locked) return;
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...layer, enabled: !layer.enabled },
      },
    }));
  },

  setLayerEnabled: (id: string, enabled: boolean) => {
    const layer = get().layers[id];
    if (!layer || layer.locked) return;
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...layer, enabled },
      },
    }));
  },
}));
