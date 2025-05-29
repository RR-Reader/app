// pages/settings/Experimental.tsx
import { Card, CardContent } from "@/components/ui/card";
import { SettingItem } from "@/components/settings/settings-item";
import { SettingRenderer } from "@/components/settings/settings-renderer";
import { useSettings } from "@/hooks/settings/use-settings";
import { FlaskRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Experimental() {
  const { settings, updateSetting } = useSettings();

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <FlaskRound />
          Experimental
        </h1>
        <p className="text-muted-foreground mt-2">
          Experimental features that may be unstable or change in future
          versions.
        </p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          These features are experimental and may cause instability. Use at your
          own risk.
        </AlertDescription>
      </Alert>

      <Card className="p-0">
        <CardContent className="px-4">
          <SettingItem
            title="Enable custom sources"
            description="Allow loading manga from custom source plugins"
          >
            <SettingRenderer
              setting={{
                key: "enable_custom_sources",
                title: "Enable custom sources",
                description: "Allow loading manga from custom source plugins.",
                type: "switch",
              }}
              value={settings.experimental.enable_custom_sources}
              onChange={(value) =>
                updateSetting({
                  section: "experimental",
                  key: "enable_custom_sources",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Enable debug logging"
            description="Show detailed logs for troubleshooting"
          >
            <SettingRenderer
              setting={{
                key: "enable_debug_logging",
                title: "Enable debug logging",
                description: "Show detailed logs for troubleshooting issues.",
                type: "switch",
              }}
              value={settings.experimental.enable_debug_logging}
              onChange={(value) =>
                updateSetting({
                  section: "experimental",
                  key: "enable_debug_logging",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Show FPS counter in reader"
            description="Display performance metrics for testing"
          >
            <SettingRenderer
              setting={{
                key: "show_fps_counter",
                title: "Show FPS counter in reader",
                description:
                  "Display performance metrics for testing purposes.",
                type: "switch",
              }}
              value={settings.experimental.show_fps_counter}
              onChange={(value) =>
                updateSetting({
                  section: "experimental",
                  key: "show_fps_counter",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Use hardware acceleration for images"
            description="GPU acceleration for image rendering (may cause issues)"
          >
            <SettingRenderer
              setting={{
                key: "hardware_acceleration",
                title: "Use hardware acceleration for images",
                description:
                  "Use GPU acceleration for image rendering (may cause issues on some systems).",
                type: "switch",
              }}
              value={settings.experimental.hardware_acceleration}
              onChange={(value) =>
                updateSetting({
                  section: "experimental",
                  key: "hardware_acceleration",
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
