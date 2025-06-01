import { usePreferences } from "@/hooks/settings/use-settings";
import { useEffect } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const { preferences, updatePreferences, isLoading, isUpdating } =
    usePreferences();

  const theme = (preferences?.layout_appearance?.theme as Theme) || "system";

  useEffect(() => {
    if (isLoading || isUpdating) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme, isLoading, isUpdating]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    updatePreferences({
      section: "layout_appearance",
      key: "theme",
      value: newTheme,
    });
  };

  return {
    theme,
    setTheme,
    isLoading: isLoading || isUpdating,
  };
}
