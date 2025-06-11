import { usePreferences } from "@/hooks/use-preferences";

export function useCoverStyle() {
  const { preferences, updateLayoutPreferences } = usePreferences();

  const grid = preferences?.layout_preferences.grid_size!;
  const showTitles = preferences?.layout_preferences.show_titles!;
  const compactMode = preferences?.layout_preferences.compact_mode!;
  const coverStyle = preferences?.layout_preferences.cover_style!;

  const setGrid = (size: number) => {
    updateLayoutPreferences({ grid_size: size });
  };

  const setCompactMode = (compact: boolean) => {
    updateLayoutPreferences({ compact_mode: compact });
  };

  const setShowTitles = (show: boolean) => {
    updateLayoutPreferences({ show_titles: show });
  };

  const setCoverStyle = (style: string) => {
    updateLayoutPreferences({ cover_style: style });
  };

  return {
    grid,
    showTitles,
    compactMode,
    coverStyle,
    setGrid,
    setShowTitles,
    setCompactMode,
    setCoverStyle,
  };
}
