use std::sync::Arc;

use tauri::{command, State};

use super::batoto::page::get_batoto_page;
use crate::{
    structs::{ExplorePage, Manga},
    EntryCache,
    MangaCache
};

use super::batoto::manga::get_batoto_manga;

#[command]
pub async fn load_explore_pages(
    cache: State<'_, EntryCache>,
    source: &str,
    limit: u64,
) -> Result<Vec<ExplorePage>, String> {
    let mut pages: Vec<ExplorePage> = Vec::new();

    match source {
        "batoto" => {
            let page = get_batoto_page(cache, &limit).await?;
            pages.push(page);
        }
        _ => return Err(format!("Unsupported source: {}", source)),
    }

    Ok(pages)
}

#[command]
pub async fn load_source_chapter(
    cache: State<'_, MangaCache>,
    source: &str,
    identifier: &str,
) -> Result<Arc<Manga>, String> {
    match source {
        "batoto" => get_batoto_manga(cache, identifier.to_string()).await,
        _ => Err(format!("Unsupported source: {}", source)),
    }
}
