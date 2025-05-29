import { useSettings } from "@/hooks/settings/useSettings";

type CoverStyle = "rounded" | "square" | "border" | "shadow";

export function useCoverStyle() {
  const { settings, updateSetting } = useSettings();

  const coverStyle =
    (settings?.layout_appearance?.cover_style as CoverStyle) || "rounded";

  const setCoverStyle = (newStyle: string) => {
    updateSetting({
      section: "layout_appearance",
      key: "cover_style",
      value: newStyle,
    });
  };

  return { coverStyle, setCoverStyle };
}
