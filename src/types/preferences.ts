import { LucideIcon } from "lucide-react";

type PreferenceType =
  | "select"
  | "switch"
  | "slider"
  | "input"
  | "color"
  | "folder"
  | "stepper";

interface PreferenceOption {
  value: string;
  label: string;
}

interface Preferences {
  key: string;
  title: string;
  description?: string;
  type: PreferenceType;
  options?: PreferenceOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  defaultValue?: any;
  storeKey?: string;
}

interface PreferencesSection {
  key: string;
  title: string;
  icon: LucideIcon;
  settings: Preferences[];
}

interface AppPreferences {
  layout_appearance: {
    grid_size: number;
    theme: string;
    cover_style: string;
    show_titles: boolean;
    compact_mode: boolean;
    show_read_indicators: boolean;
  };
  reader_display: {
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

export type {
  PreferenceType,
  PreferenceOption,
  Preferences,
  PreferencesSection,
  AppPreferences,
};
