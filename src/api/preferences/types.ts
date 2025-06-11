interface AppPreferences {
  layout_preferences: LayoutPreferences;
  reader_display_preferences: ReaderPreferences;
  library_history_preferences: LibraryHistoryPreferences;
  system_behavior_preferences: SystemBehaviorPreferences;
  experimental_preferences: ExperimentalPreferences;
}

interface LayoutPreferences {
  grid_size: number;
  theme: string;
  show_titles: boolean;
  compact_mode: boolean;
  show_read_indicator: boolean;
  cover_style: string;
}

interface ReaderPreferences {
  page_layout: string;
  zoom_behavior: string;
  reading_direction: string;
  zoom_level?: number;
  remember_zoom: boolean;
}

interface LibraryHistoryPreferences {
  enabled: boolean;
  max_entries: number;
  show_recent: boolean;
  default_library_view: string;
}

interface SystemBehaviorPreferences {
  update_on_startup: boolean;
  confirm_removal: boolean;
  enable_notifications: boolean;
}

interface ExperimentalPreferences {
  enable_custom_sources: boolean;
  enable_debug_logging: boolean;
  hardware_acceleration: boolean;
}

export type {
  AppPreferences,
  LayoutPreferences,
  ReaderPreferences,
  LibraryHistoryPreferences,
  SystemBehaviorPreferences,
  ExperimentalPreferences,
};
