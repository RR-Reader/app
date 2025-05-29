import { Card, CardContent } from "@/components/ui/card";
import { SettingItem } from "@/components/settings/settings-item";
import { SettingRenderer } from "@/components/settings/settings-renderer";
import { useSettings } from "@/hooks/settings/useSettings";
import { BookOpen } from "lucide-react";

export default function ReaderPreferences() {
  const { settings, updateSetting } = useSettings();

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <BookOpen />
          Reader Preferences
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure how manga pages are displayed and navigated.
        </p>
      </div>

      <Card className="p-0">
        <CardContent className="px-4">
          <SettingItem
            title="Page Layout"
            description="How pages are arranged in the reader"
          >
            <SettingRenderer
              setting={{
                key: "page_layout",
                title: "Page Layout",
                description: "Choose how pages are arranged in the reader.",
                type: "select",
                options: [
                  { value: "single-page", label: "Single page" },
                  { value: "double-page", label: "Double page" },
                  { value: "vertical-scroll", label: "Vertical scroll" },
                ],
              }}
              value={settings.reader_preferences.page_layout}
              onChange={(value) =>
                updateSetting({
                  section: "reader_preferences",
                  key: "page_layout",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Zoom Behavior"
            description="How images are scaled to fit the screen"
          >
            <SettingRenderer
              setting={{
                key: "zoom_behavior",
                title: "Zoom Behavior",
                description: "Choose how images are scaled to fit the screen.",
                type: "select",
                options: [
                  { value: "fit-width", label: "Fit width" },
                  { value: "fit-height", label: "Fit height" },
                  { value: "manual", label: "Manual" },
                ],
              }}
              value={settings.reader_preferences.zoom_behavior}
              onChange={(value) =>
                updateSetting({
                  section: "reader_preferences",
                  key: "zoom_behavior",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Default Reading Direction"
            description="Direction for page navigation"
          >
            <SettingRenderer
              setting={{
                key: "reading_direction",
                title: "Default Reading Direction",
                description:
                  "Choose the default direction for page navigation.",
                type: "select",
                options: [
                  { value: "ltr", label: "Left-to-right" },
                  { value: "rtl", label: "Right-to-left" },
                ],
              }}
              value={settings.reader_preferences.reading_direction}
              onChange={(value) =>
                updateSetting({
                  section: "reader_preferences",
                  key: "reading_direction",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Remember last zoom level"
            description="Save zoom level between reading sessions"
          >
            <SettingRenderer
              setting={{
                key: "remember_zoom",
                title: "Remember last zoom level",
                description: "Save zoom level between reading sessions.",
                type: "switch",
              }}
              value={settings.reader_preferences.remember_zoom}
              onChange={(value) =>
                updateSetting({
                  section: "reader_preferences",
                  key: "remember_zoom",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Show page numbers"
            description="Display current page number in reader"
          >
            <SettingRenderer
              setting={{
                key: "show_page_numbers",
                title: "Show page numbers",
                description: "Display current page number in the reader.",
                type: "switch",
              }}
              value={settings.reader_preferences.show_page_numbers}
              onChange={(value) =>
                updateSetting({
                  section: "reader_preferences",
                  key: "show_page_numbers",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Background Color"
            description="Reader background color"
          >
            <SettingRenderer
              setting={{
                key: "background_color",
                title: "Background Color",
                description: "Choose the background color for the reader.",
                type: "select",
                options: [
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "sepia", label: "Sepia" },
                  { value: "custom", label: "Custom" },
                ],
              }}
              value={settings.reader_preferences.background_color}
              onChange={(value) =>
                updateSetting({
                  section: "reader_preferences",
                  key: "background_color",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Preload next chapter"
            description="Load next chapter in background for faster navigation"
          >
            <SettingRenderer
              setting={{
                key: "preload_next",
                title: "Preload next chapter",
                description:
                  "Load next chapter in background for faster navigation.",
                type: "switch",
              }}
              value={settings.reader_preferences.preload_next}
              onChange={(value) =>
                updateSetting({
                  section: "reader_preferences",
                  key: "preload_next",
                  value,
                })
              }
            />
          </SettingItem>
        </CardContent>
      </Card>
    </div>
  );
}
