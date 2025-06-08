import { create } from "zustand";

interface LibraryItemSelectState {
  selectedItems: string[];
  toggleItem: (item: string) => void;
  clearSelection: () => void;
}

export const useLibraryItemSelect = create<LibraryItemSelectState>(
  (set, get) => ({
    selectedItems: [],
    toggleItem: (item: string) => {
      const current = get().selectedItems;
      if (current.includes(item)) {
        set({ selectedItems: current.filter((c) => c !== item) });
      } else {
        set({ selectedItems: [...current, item] });
      }
    },
    clearSelection: () => set({ selectedItems: [] }),
  }),
);
