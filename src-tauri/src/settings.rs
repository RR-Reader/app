use serde_json::to_string_pretty;
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

use crate::extensions::ExtensionManager;

pub fn get_app_data_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    Ok(app_data_dir)
}

#[allow(dead_code)]
pub fn get_manga_images_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let images_dir = get_app_data_dir(app_handle)?.join("manga_images");
    fs::create_dir_all(&images_dir)
        .map_err(|e| format!("Failed to create manga images directory: {}", e))?;
    Ok(images_dir)
}

#[allow(dead_code)]
pub fn get_cache_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let cache_dir = get_app_data_dir(app_handle)?.join("cache");
    fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("Failed to create cache directory: {}", e))?;
    Ok(cache_dir)
}

pub fn get_extensions_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let extensions_dir = get_app_data_dir(app_handle)?.join("extensions");
    fs::create_dir_all(&extensions_dir)
        .map_err(|e| format!("Failed to create extensions directory: {}", e))?;
    Ok(extensions_dir)
}

pub fn get_extensions_manifest_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let path = get_extensions_path(app_handle)?.join("manifest.json");

    if !path.exists() {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create manifest directory: {}", e))?;
        }

        let default_manager = ExtensionManager::new();
        let default_json = to_string_pretty(&default_manager)
            .map_err(|e| format!("Failed to serialize default manifest: {}", e))?;

        fs::write(&path, default_json)
            .map_err(|e| format!("Failed to create manifest.json with default content: {}", e))?;
    }

    Ok(path)
}

pub fn get_preferences_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    Ok(get_app_data_dir(app_handle)?.join("preferences.json"))
}

pub fn get_library_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    Ok(get_app_data_dir(app_handle)?.join("library"))
}

pub fn get_category_path(app_handle: &AppHandle, category_slug: &str) -> Result<PathBuf, String> {
    let library_path: PathBuf = get_library_path(app_handle)?;
    let category_path: PathBuf = library_path.join(format!("{}.json", category_slug));
    Ok(category_path)
}
