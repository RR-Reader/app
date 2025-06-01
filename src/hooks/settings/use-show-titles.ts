import { usePreferences } from "@/hooks/settings/use-settings";

export function useShowTitles() {
  const { preferences, updatePreferences } = usePreferences();

  const showTitles = preferences?.layout_appearance?.show_titles ?? true;

  const setShowTitles = (value: boolean) => {
    updatePreferences({
      section: "layout_appearance",
      key: "show_titles",
      value,
    });
  };

  return { showTitles, setShowTitles };
}
