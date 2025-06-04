use std::{
    fs::{self, File},
    path::PathBuf,
};
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

#[allow(dead_code)]
pub fn get_extensions_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let extensions_dir = get_app_data_dir(app_handle)?.join("extensions");
    fs::create_dir_all(&extensions_dir)
        .map_err(|e| format!("Failed to create extensions directory: {}", e))?;
    Ok(extensions_dir)
}

#[allow(dead_code)]
pub fn get_extensions_manifest_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let path = get_extensions_dir(app_handle)?.join("extensions.json");

    if !path.exists() {
        File::create(&path).map_err(|e| format!("Failed to create extensions.json: {}", e))?;
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
