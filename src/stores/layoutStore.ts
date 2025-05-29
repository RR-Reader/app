import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GridValues = "6" | "8" | "12" | "16" | (string & {});

interface LayoutState {
  grid: GridValues;
  setGrid: (value: GridValues) => void;
}

export const useLayoutStore = create(
  persist<LayoutState>(
    (set) => ({
      grid: "12",
      setGrid: (value) => set({ grid: value }),
    }),
    {
      name: "layout-settings",
    },
  ),
);
