import { usePreferences } from "@/hooks/settings/use-settings";

type CoverStyle = "rounded" | "square" | "border" | "shadow";

export function useCoverStyle() {
  const { preferences, updatePreferences } = usePreferences();

  const coverStyle =
    (preferences?.layout_appearance?.cover_style as CoverStyle) || "rounded";

  const setCoverStyle = (newStyle: string) => {
    updatePreferences({
      section: "layout_appearance",
      key: "cover_style",
      value: newStyle,
    });
  };

  return { coverStyle, setCoverStyle };
}
