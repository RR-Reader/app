use crate::settings::get_preferences_path;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use std::fs;
use tauri::{command, AppHandle};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppPreferences {
    pub layout_appearance: LayoutAppearancePreferences,
    pub reader_display: ReaderDisplayPreferences,
    pub library_history: LibraryHistoryPreferences,
    pub storage_caching: StorageCachingPreferences,
    pub system_behavior: SystemBehaviorPreferences,
    pub experimental: ExperimentalPreferences,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LayoutAppearancePreferences {
    pub grid_size: i64,
    pub theme: String,
    pub cover_style: String,
    pub show_titles: bool,
    pub compact_mode: bool,
    pub show_read_indicators: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReaderDisplayPreferences {
    pub page_layout: String,
    pub zoom_behavior: String,
    pub reading_direction: String,
    pub remember_zoom: bool,
    pub show_page_numbers: bool,
    pub background_color: String,
    pub preload_next: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LibraryHistoryPreferences {
    pub enable_history: bool,
    pub max_history_entries: String,
    pub show_recently_read: bool,
    pub default_library_view: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StorageCachingPreferences {
    pub max_cache_size: String,
    pub clear_cache_on_close: bool,
    pub image_quality: String,
    pub download_path: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SystemBehaviorPreferences {
    pub check_new_chapters: bool,
    pub auto_refresh_category: bool,
    pub confirm_removal: bool,
    pub enable_notifications: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExperimentalPreferences {
    pub enable_custom_sources: bool,
    pub enable_debug_logging: bool,
    pub show_fps_counter: bool,
    pub hardware_acceleration: bool,
}

impl Default for LayoutAppearancePreferences {
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

impl Default for ReaderDisplayPreferences {
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

impl Default for LibraryHistoryPreferences {
    fn default() -> Self {
        Self {
            enable_history: true,
            max_history_entries: "100".to_string(),
            show_recently_read: true,
            default_library_view: "grid".to_string(),
        }
    }
}

impl Default for StorageCachingPreferences {
    fn default() -> Self {
        Self {
            max_cache_size: "1000".to_string(),
            clear_cache_on_close: false,
            image_quality: "high".to_string(),
            download_path: None,
        }
    }
}

impl Default for SystemBehaviorPreferences {
    fn default() -> Self {
        Self {
            check_new_chapters: true,
            auto_refresh_category: false,
            confirm_removal: true,
            enable_notifications: true,
        }
    }
}

impl Default for ExperimentalPreferences {
    fn default() -> Self {
        Self {
            enable_custom_sources: false,
            enable_debug_logging: false,
            show_fps_counter: false,
            hardware_acceleration: true,
        }
    }
}

impl Default for AppPreferences {
    fn default() -> Self {
        Self {
            layout_appearance: LayoutAppearancePreferences::default(),
            reader_display: ReaderDisplayPreferences::default(),
            library_history: LibraryHistoryPreferences::default(),
            storage_caching: StorageCachingPreferences::default(),
            system_behavior: SystemBehaviorPreferences::default(),
            experimental: ExperimentalPreferences::default(),
        }
    }
}

impl AppPreferences {
    fn create_default(app_handle: &AppHandle) -> Result<(), String> {
        println!("Creating default preferences...");
        let default_preferences = AppPreferences::default();
        default_preferences.save(app_handle)
    }

    pub fn save(&self, app_handle: &AppHandle) -> Result<(), String> {
        let json = to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize preferences: {}", e))?;

        let preferences_path = get_preferences_path(app_handle)?;
        println!("Saving preferences to: {:?}", preferences_path);

        fs::write(&preferences_path, json)
            .map_err(|e| format!("Failed to write preferences file: {}", e))?;

        println!("Preferences saved successfully");
        Ok(())
    }

    pub fn load(app_handle: &AppHandle) -> Result<Self, String> {
        let preferences_path = get_preferences_path(app_handle)?;
        println!("Looking for preferences at: {:?}", preferences_path);

        if !preferences_path.exists() {
            println!("Preferences file doesn't exist, creating default...");
            Self::create_default(app_handle)?;
        }

        println!("Reading preferences file...");
        let raw_preferences = fs::read_to_string(&preferences_path)
            .map_err(|e| format!("Failed to read preferences: {}", e))?;

        println!("Parsing preferences JSON...");
        let preferences = from_str::<AppPreferences>(&raw_preferences)
            .map_err(|e| format!("Failed to parse preferences JSON: {}", e))?;

        println!("Preferences loaded successfully");
        Ok(preferences)
    }

    pub fn update_preference(
        &mut self,
        section: &str,
        key: &str,
        value: serde_json::Value,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        match section {
            "layout_appearance" => self.update_layout_appearance(key, value)?,
            "reader_display" => self.update_reader_display(key, value)?,
            "library_history" => self.update_library_history(key, value)?,
            "storage_caching" => self.update_storage_caching(key, value)?,
            "system_behavior" => self.update_system_behavior(key, value)?,
            "experimental" => self.update_experimental(key, value)?,
            _ => return Err(format!("Unknown preferences section: {}", section)),
        }
        self.save(app_handle)
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
            _ => return Err(format!("Unknown layout_appearance preference key: {}", key)),
        }
        Ok(())
    }

    fn update_reader_display(&mut self, key: &str, value: serde_json::Value) -> Result<(), String> {
        match key {
            "page_layout" => {
                self.reader_display.page_layout =
                    value.as_str().unwrap_or("single-page").to_string()
            }
            "zoom_behavior" => {
                self.reader_display.zoom_behavior =
                    value.as_str().unwrap_or("fit-width").to_string()
            }
            "reading_direction" => {
                self.reader_display.reading_direction = value.as_str().unwrap_or("ltr").to_string()
            }
            "remember_zoom" => self.reader_display.remember_zoom = value.as_bool().unwrap_or(true),
            "show_page_numbers" => {
                self.reader_display.show_page_numbers = value.as_bool().unwrap_or(true)
            }
            "background_color" => {
                self.reader_display.background_color = value.as_str().unwrap_or("black").to_string()
            }
            "preload_next" => self.reader_display.preload_next = value.as_bool().unwrap_or(true),
            _ => return Err(format!("Unknown reader_display preference key: {}", key)),
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
            _ => return Err(format!("Unknown library_history preference key: {}", key)),
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
            _ => return Err(format!("Unknown storage_caching preference key: {}", key)),
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
            _ => return Err(format!("Unknown system_behavior preference key: {}", key)),
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
            _ => return Err(format!("Unknown experimental preference key: {}", key)),
        }
        Ok(())
    }
}

#[command]
pub fn load_preferences(app_handle: AppHandle) -> Result<AppPreferences, String> {
    AppPreferences::load(&app_handle)
}

#[command]
pub fn update_preference(
    section: String,
    key: String,
    value: serde_json::Value,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut preferences = AppPreferences::load(&app_handle)?;
    preferences.update_preference(&section, &key, value, &app_handle)
}

#[command]
pub fn reset_preferences(app_handle: AppHandle) -> Result<(), String> {
    let default_preferences = AppPreferences::default();
    default_preferences.save(&app_handle)
}

#[command]
pub fn get_preference_section(
    section: String,
    app_handle: AppHandle,
) -> Result<serde_json::Value, String> {
    let preferences = AppPreferences::load(&app_handle)?;

    let section_data = match section.as_str() {
        "layout_appearance" => serde_json::to_value(&preferences.layout_appearance),
        "reader_display" => serde_json::to_value(&preferences.reader_display),
        "library_history" => serde_json::to_value(&preferences.library_history),
        "storage_caching" => serde_json::to_value(&preferences.storage_caching),
        "system_behavior" => serde_json::to_value(&preferences.system_behavior),
        "experimental" => serde_json::to_value(&preferences.experimental),
        _ => return Err(format!("Unknown preferences section: {}", section)),
    };

    section_data.map_err(|e| format!("Failed to serialize section: {}", e))
}
