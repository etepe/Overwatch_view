import { create } from 'zustand';

interface SelectionState {
  selectedFacilityIds: Set<string>;
  toggleFacility: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedFacilityIds: new Set<string>(),

  toggleFacility: (id: string) => {
    const next = new Set(get().selectedFacilityIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ selectedFacilityIds: next });
  },

  selectAll: (ids: string[]) => {
    set({ selectedFacilityIds: new Set(ids) });
  },

  clearAll: () => {
    set({ selectedFacilityIds: new Set() });
  },

  isSelected: (id: string) => {
    return get().selectedFacilityIds.has(id);
  },
}));
