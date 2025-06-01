use super::client::BatotoSource;
use crate::{
    source::{SourceMethods, SourceResult},
    structs::Manga,
    MangaCache,
};
use std::sync::Arc;
use tauri::State;

pub async fn get_batoto_manga(
    cache: State<'_, MangaCache>,
    id: String,
) -> SourceResult<Arc<Manga>> {
    let client: BatotoSource = BatotoSource::new();
    let res: Arc<Manga> = client.get_manga_details(&cache, &id).await?;

    Ok(res)
}
