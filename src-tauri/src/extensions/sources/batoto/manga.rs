use super::client::BatotoClient;
use crate::{structs::Manga, MangaCache};
use std::sync::Arc;
use tauri::State;

pub async fn get_batoto_manga(
    cache: State<'_, MangaCache>,
    identifier: String,
) -> Result<Arc<Manga>, String> {
    let client: BatotoClient = BatotoClient::new();
    let res: Arc<Manga> = client.get_manga_details(cache, &identifier).await?;

    Ok(res)
}
