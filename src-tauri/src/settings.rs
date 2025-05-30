use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use std::{fs, path::Path};

const SETTINGS_PATH: &'static str = "settings.json";

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppSettings {
    pub layout_appearance: LayoutAppearanceSettings,
    pub reader_preferences: ReaderPreferencesSettings,
    pub library_history: LibraryHistorySettings,
    pub storage_caching: StorageCachingSettings,
    pub system_behavior: SystemBehaviorSettings,
    pub experimental: ExperimentalSettings,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LayoutAppearanceSettings {
    pub grid_size: i64,
    pub theme: String,
    pub cover_style: String,
    pub show_titles: bool,
    pub compact_mode: bool,
    pub show_read_indicators: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReaderPreferencesSettings {
    pub page_layout: String,
    pub zoom_behavior: String,
    pub reading_direction: String,
    pub remember_zoom: bool,
    pub show_page_numbers: bool,
    pub background_color: String,
    pub preload_next: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LibraryHistorySettings {
    pub enable_history: bool,
    pub max_history_entries: String,
    pub show_recently_read: bool,
    pub default_library_view: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StorageCachingSettings {
    pub max_cache_size: String,
    pub clear_cache_on_close: bool,
    pub image_quality: String,
    pub download_path: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SystemBehaviorSettings {
    pub check_new_chapters: bool,
    pub auto_refresh_category: bool,
    pub confirm_removal: bool,
    pub enable_notifications: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExperimentalSettings {
    pub enable_custom_sources: bool,
    pub enable_debug_logging: bool,
    pub show_fps_counter: bool,
    pub hardware_acceleration: bool,
}

impl Default for LayoutAppearanceSettings {
    fn default() -> Self {
        Self {
            grid_size: 12,
            theme: "system".to_string(),
            cover_style: "rounded".to_string(),
            show_titles: true,
            compact_mode: false,
            show_read_indicators: true,
        }
    }
}

impl Default for ReaderPreferencesSettings {
    fn default() -> Self {
        Self {
            page_layout: "single-page".to_string(),
            zoom_behavior: "fit-width".to_string(),
            reading_direction: "ltr".to_string(),
            remember_zoom: true,
            show_page_numbers: true,
            background_color: "black".to_string(),
            preload_next: true,
        }
    }
}

impl Default for LibraryHistorySettings {
    fn default() -> Self {
        Self {
            enable_history: true,
            max_history_entries: "100".to_string(),
            show_recently_read: true,
            default_library_view: "grid".to_string(),
        }
    }
}

impl Default for StorageCachingSettings {
    fn default() -> Self {
        Self {
            max_cache_size: "1000".to_string(),
            clear_cache_on_close: false,
            image_quality: "high".to_string(),
            download_path: None,
        }
    }
}

impl Default for SystemBehaviorSettings {
    fn default() -> Self {
        Self {
            check_new_chapters: true,
            auto_refresh_category: false,
            confirm_removal: true,
            enable_notifications: true,
        }
    }
}

impl Default for ExperimentalSettings {
    fn default() -> Self {
        Self {
            enable_custom_sources: false,
            enable_debug_logging: false,
            show_fps_counter: false,
            hardware_acceleration: true,
        }
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            layout_appearance: LayoutAppearanceSettings::default(),
            reader_preferences: ReaderPreferencesSettings::default(),
            library_history: LibraryHistorySettings::default(),
            storage_caching: StorageCachingSettings::default(),
            system_behavior: SystemBehaviorSettings::default(),
            experimental: ExperimentalSettings::default(),
        }
    }
}

impl AppSettings {
    fn create_default() -> Result<(), String> {
        let default_settings = AppSettings::default();
        default_settings.save()
    }

    pub fn save(&self) -> Result<(), String> {
        let json =
            to_string_pretty(self).map_err(|e| format!("Failed to serialize settings: {}", e))?;

        fs::write(SETTINGS_PATH, json).map_err(|e| format!("Failed to write settings file: {}", e))
    }

    pub fn load() -> Result<Self, String> {
        if !Path::new(SETTINGS_PATH).exists() {
            Self::create_default()?;
        }

        let raw_settings = fs::read_to_string(SETTINGS_PATH)
            .map_err(|e| format!("Failed to read settings: {}", e))?;

        from_str::<AppSettings>(&raw_settings)
            .map_err(|e| format!("Failed to parse settings JSON: {}", e))
    }

    pub fn update_setting(
        &mut self,
        section: &str,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), String> {
        match section {
            "layout_appearance" => self.update_layout_appearance(key, value)?,
            "reader_preferences" => self.update_reader_preferences(key, value)?,
            "library_history" => self.update_library_history(key, value)?,
            "storage_caching" => self.update_storage_caching(key, value)?,
            "system_behavior" => self.update_system_behavior(key, value)?,
            "experimental" => self.update_experimental(key, value)?,
            _ => return Err(format!("Unknown settings section: {}", section)),
        }
        self.save()
    }

    fn update_layout_appearance(
        &mut self,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), String> {
        match key {
            "grid_size" => {
                self.layout_appearance.grid_size = value.as_i64().unwrap_or(12);
            }
            "theme" => {
                self.layout_appearance.theme = value.as_str().unwrap_or("system").to_string()
            }
            "cover_style" => {
                self.layout_appearance.cover_style = value.as_str().unwrap_or("rounded").to_string()
            }
            "show_titles" => self.layout_appearance.show_titles = value.as_bool().unwrap_or(true),
            "compact_mode" => {
                self.layout_appearance.compact_mode = value.as_bool().unwrap_or(false)
            }
            "show_read_indicators" => {
                self.layout_appearance.show_read_indicators = value.as_bool().unwrap_or(true)
            }
            _ => return Err(format!("Unknown layout_appearance setting: {}", key)),
        }
        Ok(())
    }

    fn update_reader_preferences(
        &mut self,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), String> {
        match key {
            "page_layout" => {
                self.reader_preferences.page_layout =
                    value.as_str().unwrap_or("single-page").to_string()
            }
            "zoom_behavior" => {
                self.reader_preferences.zoom_behavior =
                    value.as_str().unwrap_or("fit-width").to_string()
            }
            "reading_direction" => {
                self.reader_preferences.reading_direction =
                    value.as_str().unwrap_or("ltr").to_string()
            }
            "remember_zoom" => {
                self.reader_preferences.remember_zoom = value.as_bool().unwrap_or(true)
            }
            "show_page_numbers" => {
                self.reader_preferences.show_page_numbers = value.as_bool().unwrap_or(true)
            }
            "background_color" => {
                self.reader_preferences.background_color =
                    value.as_str().unwrap_or("black").to_string()
            }
            "preload_next" => {
                self.reader_preferences.preload_next = value.as_bool().unwrap_or(true)
            }
            _ => return Err(format!("Unknown reader_preferences setting: {}", key)),
        }
        Ok(())
    }

    fn update_library_history(
        &mut self,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), String> {
        match key {
            "enable_history" => {
                self.library_history.enable_history = value.as_bool().unwrap_or(true)
            }
            "max_history_entries" => {
                self.library_history.max_history_entries =
                    value.as_str().unwrap_or("100").to_string()
            }
            "show_recently_read" => {
                self.library_history.show_recently_read = value.as_bool().unwrap_or(true)
            }
            "default_library_view" => {
                self.library_history.default_library_view =
                    value.as_str().unwrap_or("grid").to_string()
            }
            _ => return Err(format!("Unknown library_history setting: {}", key)),
        }
        Ok(())
    }

    fn update_storage_caching(
        &mut self,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), String> {
        match key {
            "max_cache_size" => {
                self.storage_caching.max_cache_size = value.as_str().unwrap_or("1000").to_string()
            }
            "clear_cache_on_close" => {
                self.storage_caching.clear_cache_on_close = value.as_bool().unwrap_or(false)
            }
            "image_quality" => {
                self.storage_caching.image_quality = value.as_str().unwrap_or("high").to_string()
            }
            "download_path" => {
                self.storage_caching.download_path = value.as_str().map(|s| s.to_string())
            }
            _ => return Err(format!("Unknown storage_caching setting: {}", key)),
        }
        Ok(())
    }

    fn update_system_behavior(
        &mut self,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), String> {
        match key {
            "check_new_chapters" => {
                self.system_behavior.check_new_chapters = value.as_bool().unwrap_or(true)
            }
            "auto_refresh_category" => {
                self.system_behavior.auto_refresh_category = value.as_bool().unwrap_or(false)
            }
            "confirm_removal" => {
                self.system_behavior.confirm_removal = value.as_bool().unwrap_or(true)
            }
            "enable_notifications" => {
                self.system_behavior.enable_notifications = value.as_bool().unwrap_or(true)
            }
            _ => return Err(format!("Unknown system_behavior setting: {}", key)),
        }
        Ok(())
    }

    fn update_experimental(&mut self, key: &str, value: serde_json::Value) -> Result<(), String> {
        match key {
            "enable_custom_sources" => {
                self.experimental.enable_custom_sources = value.as_bool().unwrap_or(false)
            }
            "enable_debug_logging" => {
                self.experimental.enable_debug_logging = value.as_bool().unwrap_or(false)
            }
            "show_fps_counter" => {
                self.experimental.show_fps_counter = value.as_bool().unwrap_or(false)
            }
            "hardware_acceleration" => {
                self.experimental.hardware_acceleration = value.as_bool().unwrap_or(true)
            }
            _ => return Err(format!("Unknown experimental setting: {}", key)),
        }
        Ok(())
    }
}

#[tauri::command]
pub fn load_settings() -> Result<AppSettings, String> {
    AppSettings::load()
}

#[tauri::command]
pub fn update_setting(
    section: String,
    key: String,
    value: serde_json::Value,
) -> Result<(), String> {
    let mut settings = AppSettings::load()?;
    settings.update_setting(&section, &key, value)
}

#[tauri::command]
pub fn reset_settings() -> Result<(), String> {
    let default_settings = AppSettings::default();
    default_settings.save()
}

#[tauri::command]
pub fn get_setting_section(section: String) -> Result<serde_json::Value, String> {
    let settings = AppSettings::load()?;

    let section_data = match section.as_str() {
        "layout_appearance" => serde_json::to_value(&settings.layout_appearance),
        "reader_preferences" => serde_json::to_value(&settings.reader_preferences),
        "library_history" => serde_json::to_value(&settings.library_history),
        "storage_caching" => serde_json::to_value(&settings.storage_caching),
        "system_behavior" => serde_json::to_value(&settings.system_behavior),
        "experimental" => serde_json::to_value(&settings.experimental),
        _ => return Err(format!("Unknown settings section: {}", section)),
    };

    section_data.map_err(|e| format!("Failed to serialize section: {}", e))
}
