import { Card, CardContent } from "@/components/ui/card";
import { SettingItem } from "@/components/settings/settings-item";
import { SettingRenderer } from "@/components/settings/settings-renderer";
import { usePreferences } from "@/hooks/use-preferences";
import { Settings as SettingsIcon } from "lucide-react";

export default function SystemBehavior() {
  const { preferences, updateSystemBehaviorPreferences } = usePreferences();

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <SettingsIcon />
          System & Behavior
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure app behavior and system integration.
        </p>
      </div>

      <Card className="p-0">
        <CardContent className="px-4">
          <SettingItem
            title="Check for new chapters on startup"
            description="Automatically check for updates when app starts"
          >
            <SettingRenderer
              setting={{
                key: "check_new_chapters",
                title: "Check for new chapters on startup",
                description:
                  "Automatically check for updates when the app starts.",
                type: "switch",
              }}
              value={preferences.system_behavior_preferences.update_on_startup}
              onChange={(value) =>
                updateSystemBehaviorPreferences({
                  update_on_startup: value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Confirm before removing manga"
            description="Show confirmation dialog when removing manga"
          >
            <SettingRenderer
              setting={{
                key: "confirm_removal",
                title: "Confirm before removing manga",
                description: "Show confirmation dialog when removing manga.",
                type: "switch",
              }}
              value={preferences.system_behavior_preferences.confirm_removal}
              onChange={(value) =>
                updateSystemBehaviorPreferences({
                  confirm_removal: value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Enable notifications"
            description="Show system notifications for new chapters"
          >
            <SettingRenderer
              setting={{
                key: "enable_notifications",
                title: "Enable notifications",
                description:
                  "Show system notifications when new chapters are added.",
                type: "switch",
              }}
              value={
                preferences.system_behavior_preferences.enable_notifications
              }
              onChange={(value) =>
                updateSystemBehaviorPreferences({
                  enable_notifications: value,
                })
              }
            />
          </SettingItem>
        </CardContent>
      </Card>
    </div>
  );
}
