import { usePreferences } from "@/hooks/settings/use-settings";

type CoverStyle = "default" | "rounded" | "border" | "shadow";

export function useCoverStyle() {
  const { preferences, updatePreferences } = usePreferences();

  const coverStyle =
    (preferences?.layout_appearance?.cover_style as CoverStyle) || "rounded";
  const compactMode = preferences?.layout_appearance.compact_mode || false;
  const showTitles = preferences?.layout_appearance.show_titles || false;

  const setLayoutPreferences = (key: string, value: any) => {
    updatePreferences({
      section: "layout_appearance",
      key,
      value,
    });
  };

  const setCoverStyle = (value: string) =>
    setLayoutPreferences("cover_style", value);

  const setCompactMode = (value: boolean) =>
    setLayoutPreferences("compact_mode", value);

  const setShowTitles = (value: boolean) =>
    setLayoutPreferences("show_titles", value);

  return {
    coverStyle,
    setCoverStyle,
    compactMode,
    setCompactMode,
    showTitles,
    setShowTitles,
  };
}
