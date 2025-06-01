import { usePreferences } from "./use-settings";

export function useGrid() {
  const { preferences, updatePreferences } = usePreferences();

  const grid = preferences?.layout_appearance?.grid_size || 8;

  const setGrid = (newGrid: number) => {
    updatePreferences({
      section: "layout_appearance",
      key: "grid_size",
      value: newGrid,
    });
  };

  return { grid, setGrid };
}
