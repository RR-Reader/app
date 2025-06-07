import { Card, CardContent } from "@/components/ui/card";
import { SettingItem } from "@/components/settings/settings-item";
import { SettingRenderer } from "@/components/settings/settings-renderer";
import { usePreferences } from "@/hooks/settings/use-settings";
import { BookOpen } from "lucide-react";
import { Stepper } from "@/components/stepper";
import { useState } from "react";

export default function ReaderPreferences() {
  const { preferences, updatePreferences } = usePreferences();
  const [stepNum, setStepNum] = useState(100);

  if (!preferences) return <div>Loading...</div>;

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
              value={preferences.reader_display.page_layout}
              onChange={(value) =>
                updatePreferences({
                  section: "reader_display",
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
              value={preferences.reader_display.zoom_behavior}
              onChange={(value) =>
                updatePreferences({
                  section: "reader_display",
                  key: "zoom_behavior",
                  value,
                })
              }
            />
          </SettingItem>

          {preferences.reader_display.zoom_behavior === "manual" && (
            <SettingItem title="Zoom Level" description="Adjust zoom level">
              <Stepper
                max={200}
                value={stepNum}
                onChange={setStepNum}
                step={25}
              />
            </SettingItem>
          )}

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
              value={preferences.reader_display.reading_direction}
              onChange={(value) =>
                updatePreferences({
                  section: "reader_display",
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
              value={preferences.reader_display.remember_zoom}
              onChange={(value) =>
                updatePreferences({
                  section: "reader_display",
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
              value={preferences.reader_display.show_page_numbers}
              onChange={(value) =>
                updatePreferences({
                  section: "reader_display",
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
              value={preferences.reader_display.background_color}
              onChange={(value) =>
                updatePreferences({
                  section: "reader_display",
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
              value={preferences.reader_display.preload_next}
              onChange={(value) =>
                updatePreferences({
                  section: "reader_display",
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
