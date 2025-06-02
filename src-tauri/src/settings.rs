use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

pub fn get_app_data_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    Ok(app_data_dir)
}

pub fn get_manga_images_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let images_dir = get_app_data_dir(app_handle)?.join("manga_images");
    fs::create_dir_all(&images_dir)
        .map_err(|e| format!("Failed to create manga images directory: {}", e))?;
    Ok(images_dir)
}

pub fn get_cache_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let cache_dir = get_app_data_dir(app_handle)?.join("cache");
    fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("Failed to create cache directory: {}", e))?;
    Ok(cache_dir)
}

pub fn get_preferences_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    Ok(get_app_data_dir(app_handle)?.join("preferences.json"))
}

pub fn get_library_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    Ok(get_app_data_dir(app_handle)?.join("library.json"))
}
