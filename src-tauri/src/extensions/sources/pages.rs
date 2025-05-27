use tauri::{command, State};

use super::batoto::page::get_batoto_page;
use crate::{structs::ExplorePage, EntryCache};

#[command]
pub async fn load_explore_pages(
    cache: State<'_, EntryCache>,
    source: &str,
) -> Result<Vec<ExplorePage>, String> {
    let mut pages: Vec<ExplorePage> = Vec::new();

    match source {
        "batoto" => {
            let page = get_batoto_page(cache).await?;
            pages.push(page);
        }
        _ => return Err(format!("Unsupported source: {}", source)),
    }

    Ok(pages)
}
