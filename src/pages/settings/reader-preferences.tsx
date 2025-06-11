import { Card, CardContent } from "@/components/ui/card";
import { SettingItem } from "@/components/settings/settings-item";
import { SettingRenderer } from "@/components/settings/settings-renderer";
import { usePreferences } from "@/hooks/use-preferences";
import { BookOpen } from "lucide-react";
import { Stepper } from "@/components/stepper";
import { useState } from "react";

export default function ReaderPreferences() {
  const { preferences, updateReaderPreferences } = usePreferences();
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
              value={preferences.reader_display_preferences.page_layout}
              onChange={(value) =>
                updateReaderPreferences({
                  page_layout: value,
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
              value={preferences.reader_display_preferences.zoom_behavior}
              onChange={(value) =>
                updateReaderPreferences({
                  zoom_behavior: value,
                })
              }
            />
          </SettingItem>

          {preferences.reader_display_preferences.zoom_behavior ===
            "manual" && (
            <SettingItem title="Zoom Level" description="Adjust zoom level">
              <Stepper
                max={200}
                value={preferences.reader_display_preferences.zoom_level || 100}
                onChange={(value) => {
                  updateReaderPreferences({
                    zoom_level: value,
                  });
                }}
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
              value={preferences.reader_display_preferences.reading_direction}
              onChange={(value) =>
                updateReaderPreferences({
                  reading_direction: value,
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
              value={preferences.reader_display_preferences.remember_zoom}
              onChange={(value) =>
                updateReaderPreferences({
                  remember_zoom: value,
                })
              }
            />
          </SettingItem>
        </CardContent>
      </Card>
    </div>
  );
}
