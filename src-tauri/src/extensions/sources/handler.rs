use std::sync::Arc;

use tauri::{command, State};

use super::batoto::page::get_batoto_page;
use crate::{
    error::SourceError,
    structs::{ExplorePage, Manga},
    EntryCache, MangaCache,
};

use super::batoto::manga::get_batoto_manga;

#[command]
pub async fn load_explore_pages(
    cache: State<'_, EntryCache>,
    source: &str,
    limit: u64,
) -> Result<Vec<ExplorePage>, SourceError> {
    let mut pages: Vec<ExplorePage> = Vec::new();

    match source {
        "batoto" => {
            let page = get_batoto_page(cache, &limit).await?;
            pages.push(page);
        }
        _ => return Err(SourceError::Unexpected("Unsupported source".to_string())),
    }

    Ok(pages)
}

#[command]
pub async fn load_manga_source(
    cache: State<'_, MangaCache>,
    source: &str,
    id: &str,
) -> Result<Arc<Manga>, SourceError> {
    match source {
        "batoto" => get_batoto_manga(cache, id.to_string()).await,
        _ => return Err(SourceError::Unexpected("Unsupported source".to_string())),
    }
}
