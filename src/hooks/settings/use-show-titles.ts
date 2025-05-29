import { useSettings } from "@/hooks/settings/use-settings";

export function useShowTitles() {
  const { settings, updateSetting } = useSettings();

  const showTitles = settings?.layout_appearance?.show_titles ?? true;

  const setShowTitles = (value: boolean) => {
    updateSetting({
      section: "layout_appearance",
      key: "show_titles",
      value,
    });
  };

  return { showTitles, setShowTitles };
}
