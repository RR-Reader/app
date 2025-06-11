import { Card, CardContent } from "@/components/ui/card";
import { SettingItem } from "@/components/settings/settings-item";
import { SettingRenderer } from "@/components/settings/settings-renderer";
import { usePreferences } from "@/hooks/use-preferences";
import { Paintbrush } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function LayoutAppearance() {
  const { preferences, updateLayoutPreferences } = usePreferences();
  const { setTheme, theme } = useTheme();

  if (!preferences) return <div>Loading...</div>;

  const handleThemeChange = (value: string) => {
    console.log("Theme change requested:", value);
    setTheme(value as "light" | "dark" | "system");
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Paintbrush />
          Layout & Appearance
        </h1>
        <p className="text-muted-foreground mt-2">
          Customize how your library and manga covers are displayed.
        </p>
      </div>

      <Card className="p-0">
        <CardContent className="px-4">
          <SettingItem
            title="Grid Size"
            description="Number of columns in library view"
          >
            <SettingRenderer
              setting={{
                key: "grid_size",
                title: "Grid Size",
                description:
                  "Choose how many columns to display in library view.",
                type: "select",
                options: [
                  { value: "4", label: "4" },
                  { value: "6", label: "6" },
                  { value: "8", label: "8" },
                  { value: "10", label: "10" },
                  { value: "12", label: "12" },
                ],
              }}
              value={preferences.layout_preferences.grid_size}
              onChange={(value) => {
                updateLayoutPreferences({
                  grid_size: Number(value),
                });
              }}
            />
          </SettingItem>

          <SettingItem
            title="Theme"
            description="Choose the overall theme for the app"
          >
            <SettingRenderer
              setting={{
                key: "theme",
                title: "Theme",
                description: "Choose the overall theme for the app.",
                type: "select",
                options: [
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System" },
                ],
              }}
              value={theme}
              onChange={handleThemeChange}
            />
          </SettingItem>

          <SettingItem
            title="Cover Style"
            description="Visual style for manga cover images"
          >
            <SettingRenderer
              setting={{
                key: "cover_style",
                title: "Cover Style",
                description: "Choose the visual style for manga cover images.",
                type: "select",
                options: [
                  { value: "default", label: "Default" },
                  { value: "rounded", label: "Rounded" },
                  { value: "border", label: "Border" },
                  { value: "shadow", label: "Shadow" },
                ],
              }}
              value={preferences.layout_preferences.cover_style}
              onChange={(value) =>
                updateLayoutPreferences({
                  cover_style: value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Show titles under covers"
            description="Display manga titles below cover images"
          >
            <SettingRenderer
              setting={{
                key: "show_titles",
                title: "Show titles under covers",
                description: "Display manga titles below cover images.",
                type: "switch",
              }}
              value={preferences.layout_preferences.show_titles}
              onChange={(value) =>
                updateLayoutPreferences({
                  show_titles: value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Compact Mode"
            description="Smaller margins and fonts for denser layout"
          >
            <SettingRenderer
              setting={{
                key: "compact_mode",
                title: "Compact Mode",
                description:
                  "Use smaller margins and fonts for a denser layout.",
                type: "switch",
              }}
              value={preferences.layout_preferences.compact_mode}
              onChange={(value) =>
                updateLayoutPreferences({
                  compact_mode: value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Show read/unread indicators"
            description="Display visual indicators for read and unread manga"
          >
            <SettingRenderer
              setting={{
                key: "show_read_indicators",
                title: "Show read/unread indicators",
                description:
                  "Display visual indicators for read and unread manga.",
                type: "switch",
              }}
              value={preferences.layout_preferences.show_read_indicator}
              onChange={(value) =>
                updateLayoutPreferences({
                  show_read_indicator: value,
                })
              }
            />
          </SettingItem>
        </CardContent>
      </Card>
    </div>
  );
}
