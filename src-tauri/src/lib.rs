// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod extensions;
mod structs;
mod utils;

use crate::structs::MangaEntry;
use moka::future::Cache;
use std::sync::Arc;
use tauri::{command, State};

use crate::extensions::providers::batoto::lists::{get_latest_releases, get_popular_releases};

pub type MangaCache = Cache<String, Arc<MangaEntry>>;

#[command]
async fn clean_manga_cache(cache: State<'_, MangaCache>) -> Result<(), String> {
    cache.invalidate_all();
    Ok(())
}

#[command]
async fn get_cache_stats(cache: State<'_, MangaCache>) -> Result<(u64, u64), String> {
    Ok((cache.entry_count(), cache.weighted_size()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let manga_cache: MangaCache = Cache::builder()
        .max_capacity(1000)
        .time_to_live(std::time::Duration::from_secs(3600))
        .build();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(manga_cache)
        .invoke_handler(tauri::generate_handler![
            clean_manga_cache,
            get_cache_stats,
            get_popular_releases,
            get_latest_releases
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
