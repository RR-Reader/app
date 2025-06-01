import { Card, CardContent } from "@/components/ui/card";
import { SettingItem } from "@/components/settings/settings-item";
import { SettingRenderer } from "@/components/settings/settings-renderer";
import { usePreferences } from "@/hooks/settings/use-settings";
import { HardDrive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StorageCaching() {
  const { preferences, updatePreferences } = usePreferences();

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <HardDrive />
          Storage & Caching
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage storage usage and caching behavior.
        </p>
      </div>

      <Card className="p-0">
        <CardContent className="px-4">
          <SettingItem
            title="Maximum cache size"
            description="Limit for cached images and data"
          >
            <SettingRenderer
              setting={{
                key: "max_cache_size",
                title: "Maximum cache size",
                description: "Set the maximum size for cached images and data.",
                type: "select",
                options: [
                  { value: "500", label: "500MB" },
                  { value: "1000", label: "1GB" },
                  { value: "2000", label: "2GB" },
                  { value: "5000", label: "5GB" },
                  { value: "10000", label: "10GB" },
                  { value: "unlimited", label: "Unlimited" },
                ],
              }}
              value={preferences.storage_caching.max_cache_size}
              onChange={(value) =>
                updatePreferences({
                  section: "storage_caching",
                  key: "max_cache_size",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Image quality level"
            description="Quality vs file size trade-off for images"
          >
            <SettingRenderer
              setting={{
                key: "image_quality",
                title: "Image quality level",
                description:
                  "Choose the quality vs file size trade-off for images.",
                type: "select",
                options: [
                  { value: "low", label: "Low (Faster loading)" },
                  { value: "medium", label: "Medium (Balanced)" },
                  { value: "high", label: "High (Best quality)" },
                  { value: "original", label: "Original (No compression)" },
                ],
              }}
              value={preferences.storage_caching.image_quality}
              onChange={(value) =>
                updatePreferences({
                  section: "storage_caching",
                  key: "image_quality",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Download path location"
            description="Where downloaded manga files are saved"
          >
            <SettingRenderer
              setting={{
                key: "download_path",
                title: "Download path location",
                description: "Choose where downloaded manga files are saved.",
                type: "folder",
                placeholder: "Select download folder...",
              }}
              value={preferences.storage_caching.download_path || ""}
              onChange={(value) =>
                updatePreferences({
                  section: "storage_caching",
                  key: "download_path",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Clear cache on close"
            description="Automatically clear cache when app closes"
          >
            <SettingRenderer
              setting={{
                key: "clear_cache_on_close",
                title: "Clear cache on close",
                description: "Automatically clear cache when the app closes.",
                type: "switch",
              }}
              value={preferences.storage_caching.clear_cache_on_close}
              onChange={(value) =>
                updatePreferences({
                  section: "storage_caching",
                  key: "clear_cache_on_close",
                  value,
                })
              }
            />
          </SettingItem>

          <SettingItem
            title="Clear Cache"
            description="Delete all cached images to free up space."
          >
            <Button size="icon" variant="destructive" onClick={() => {}}>
              <Trash2 />
            </Button>
          </SettingItem>
        </CardContent>
      </Card>
    </div>
  );
}
