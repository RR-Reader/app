use crate::EntryCache;
use std::{fs, path::PathBuf};
use tauri::{command, AppHandle, Manager, State};

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

// Commands

#[command]
pub async fn clean_manga_cache(cache: State<'_, EntryCache>) -> Result<(), String> {
    cache.invalidate_all();
    Ok(())
}

#[command]
pub async fn get_cache_stats(cache: State<'_, EntryCache>) -> Result<(u64, u64), String> {
    Ok((cache.entry_count(), cache.weighted_size()))
}

#[command]
pub fn get_app_data_directory(app_handle: AppHandle) -> Result<String, String> {
    get_app_data_dir(&app_handle).map(|path| path.to_string_lossy().to_string())
}

#[command]
pub fn get_manga_images_directory(app_handle: AppHandle) -> Result<String, String> {
    get_manga_images_dir(&app_handle).map(|path| path.to_string_lossy().to_string())
}
