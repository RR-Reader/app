import { useSettings } from "./use-settings";

export function useGrid() {
  const { settings, updateSetting } = useSettings();

  const grid = settings?.layout_appearance?.grid_size || 8;

  const setGrid = (newGrid: string) => {
    updateSetting({
      section: "layout_appearance",
      key: "grid",
      value: newGrid,
    });
  };

  return { grid, setGrid };
}
