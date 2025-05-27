use super::client::BatotoClient;
use crate::{structs::MangaEntry, EntryCache};
use std::sync::Arc;
use tauri::{command, State};

#[command]
pub async fn get_popular_releases(
    cache: State<'_, EntryCache>,
) -> Result<Vec<Arc<MangaEntry>>, String> {
    let client: BatotoClient = BatotoClient::new();
    let manga_list: Vec<Arc<MangaEntry>> = client.get_popular_manga(cache, 16).await?;

    Ok(manga_list)
}

#[command]
pub async fn get_latest_releases(
    cache: State<'_, EntryCache>,
) -> Result<Vec<Arc<MangaEntry>>, String> {
    let client: BatotoClient = BatotoClient::new();
    let manga_list: Vec<Arc<MangaEntry>> = client.get_latest_manga(cache, 16).await?;

    Ok(manga_list)
}
