// hooks/useSettings.ts
import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AppSettings {
  layout_appearance: {
    grid_size: number;
    theme: string;
    cover_style: string;
    show_titles: boolean;
    compact_mode: boolean;
    show_read_indicators: boolean;
  };
  reader_preferences: {
    page_layout: string;
    zoom_behavior: string;
    reading_direction: string;
    remember_zoom: boolean;
    show_page_numbers: boolean;
    background_color: string;
    preload_next: boolean;
  };
  library_history: {
    enable_history: boolean;
    max_history_entries: string;
    show_recently_read: boolean;
    default_library_view: string;
  };
  storage_caching: {
    max_cache_size: string;
    clear_cache_on_close: boolean;
    image_quality: string;
    download_path?: string;
  };
  system_behavior: {
    check_new_chapters: boolean;
    auto_refresh_category: boolean;
    confirm_removal: boolean;
    enable_notifications: boolean;
  };
  experimental: {
    enable_custom_sources: boolean;
    enable_debug_logging: boolean;
    show_fps_counter: boolean;
    hardware_acceleration: boolean;
  };
}

export function useSettings() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: () => invoke<AppSettings>("load_settings"),
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({
      section,
      key,
      value,
    }: {
      section: string;
      key: string;
      value: any;
    }) => {
      return invoke("update_setting", { section, key, value });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      console.log(
        `Setting ${variables.section}.${variables.key} updated to:`,
        variables.value,
      );
    },
    onError: (error, variables) => {
      console.error(
        `Failed to update ${variables.section}.${variables.key}:`,
        error,
      );
    },
  });

  const resetSettingsMutation = useMutation({
    mutationFn: () => invoke("reset_settings"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSetting: updateSettingMutation.mutate,
    resetSettings: resetSettingsMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
  };
}

export function useSettingSection(section: keyof AppSettings) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings", section],
    queryFn: () => invoke(`get_setting_section`, { section }),
  });

  return { data, isLoading, error };
}
