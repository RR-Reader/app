// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod error;
mod extensions;
mod library;
mod preferences;
mod settings;
mod source;
mod structs;
mod utils;

use crate::extensions::sources::handler::{load_explore_pages, load_manga_source};
use structs::{Manga, MangaEntry};
use moka::future::Cache;
use std::sync::Arc;

pub type EntryCache = Cache<String, Arc<MangaEntry>>;
pub type MangaCache = Cache<String, Arc<Manga>>;
pub type ChapterCache = Cache<String, Arc<str>>;

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
            load_explore_pages,
            load_manga_source,
            settings::get_cache_stats,
            settings::clean_manga_cache,
            library::load_library,
            library::create_category,
            library::add_manga_to_category,
            library::get_category_by_slug,
            library::find_category_for_manga,
            library::is_manga_in_library,
            library::remove_manga_from_category,
            preferences::load_preferences,
            preferences::update_preference,
            preferences::reset_preferences,
            preferences::get_preference_section,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
