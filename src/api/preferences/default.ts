import type { AppPreferences } from "./types";

export const defaultPreferences: AppPreferences = {
  layout_preferences: {
    grid_size: 8,
    theme: "system",
    show_titles: true,
    compact_mode: false,
    show_read_indicator: true,
    cover_style: "default",
  },
  reader_display_preferences: {
    page_layout: "single-page",
    zoom_behavior: "fit-width",
    reading_direction: "ltr",
    zoom_level: 1.0,
    remember_zoom: true,
  },
  library_history_preferences: {
    enabled: true,
    max_entries: 100,
    show_recent: true,
    default_library_view: "grid",
  },
  system_behavior_preferences: {
    update_on_startup: true,
    confirm_removal: true,
    enable_notifications: true,
  },
  experimental_preferences: {
    enable_custom_sources: false,
    enable_debug_logging: false,
    hardware_acceleration: true,
  },
};
