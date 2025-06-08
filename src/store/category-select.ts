import { create } from "zustand";

interface LibraryItemSelectState {
  selectedItems: string[];
  toggleItem: (item: string) => void;
  clearSelection: () => void;
}

export const useLibraryItemSelect = create<LibraryItemSelectState>((set) => ({
  selectedItems: [],
  toggleItem: (item: string) =>
    set((state) => {
      const updatedItems = state.selectedItems.includes(item)
        ? state.selectedItems.filter((c) => c !== item)
        : [...state.selectedItems, item];

      return { selectedItems: updatedItems };
    }),
  clearSelection: () => set({ selectedItems: [] }),
}));
