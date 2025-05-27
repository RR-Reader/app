use std::sync::Arc;

use crate::{structs::Manga, MangaCache};
use tauri::{command, State};

use super::client::BatotoClient;

#[command]
pub async fn get_manga_details(
    cache: State<'_, MangaCache>,
    identifier: String,
) -> Result<Arc<Manga>, String> {
    let client: BatotoClient = BatotoClient::new();
    let manga_details: Arc<Manga> = client.get_manga_details(cache, &identifier).await?;

    Ok(manga_details)
}
