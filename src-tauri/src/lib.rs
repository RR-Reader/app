// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod extensions;
mod structs;
mod utils;

use crate::structs::{Manga, MangaEntry};
use moka::future::Cache;
use std::sync::Arc;
use tauri::{command, State};

use crate::extensions::sources::batoto::{
    lists::get_explore_page,
    manga::get_manga_details,
};

pub type EntryCache = Cache<String, Arc<MangaEntry>>;
pub type MangaCache = Cache<String, Arc<Manga>>;

#[command]
async fn clean_manga_cache(cache: State<'_, EntryCache>) -> Result<(), String> {
    cache.invalidate_all();
    Ok(())
}

#[command]
async fn get_cache_stats(cache: State<'_, EntryCache>) -> Result<(u64, u64), String> {
    Ok((cache.entry_count(), cache.weighted_size()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let entry_cache: EntryCache = Cache::builder()
        .max_capacity(1000)
        .time_to_live(std::time::Duration::from_secs(3600))
        .build();

    let manga_cache: MangaCache = Cache::builder()
        .max_capacity(1000)
        .time_to_live(std::time::Duration::from_secs(3600))
        .build();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(entry_cache)
        .manage(manga_cache)
        .invoke_handler(tauri::generate_handler![
            clean_manga_cache,
            get_cache_stats,
            get_explore_page,
            get_manga_details
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
