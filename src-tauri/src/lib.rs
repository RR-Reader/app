mod extensions;
mod library;
mod preferences;
mod settings;
mod structs;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            library::load_library,
            library::create_category,
            library::is_manga_in_library,
            library::get_category_by_slug,
            library::add_manga_to_category,
            library::find_category_for_manga,
            library::remove_manga_from_category,
            preferences::load_preferences,
            preferences::update_preference,
            preferences::reset_preferences,
            preferences::get_preference_section,
            extensions::add_extension,
            extensions::remove_extension,
            extensions::load_extensions,
            extensions::get_extension,
            extensions::extension_exists,
            extensions::update_extension,
            extensions::list_extensions,
            extensions::refresh_extension_metadata,
            extensions::refresh_all_metadata,
            extensions::get_extensions_by_capability,
            extensions::get_extensions_by_language,
            extensions::validate_extension_structure
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
