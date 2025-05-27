use super::client::BatotoClient;
use crate::{structs::Manga, MangaCache};
use std::sync::Arc;
use tauri::{command, State};

#[command]
pub async fn get_manga_details(
    cache: State<'_, MangaCache>,
    identifier: String,
) -> Result<Arc<Manga>, String> {
    let client: BatotoClient = BatotoClient::new();
    let res: Arc<Manga> = client.get_manga_details(cache, &identifier).await?;

    Ok(res)
}
