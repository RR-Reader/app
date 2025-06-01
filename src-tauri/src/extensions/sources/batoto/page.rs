use super::client::BatotoSource;
use crate::{
    source::{SourceMethods, SourceResult},
    structs::{ExplorePage, ExploreSection},
    EntryCache,
};
use tauri::{command, State};

#[command]
pub async fn get_batoto_page(
    cache: State<'_, EntryCache>,
    limit: &u64,
) -> SourceResult<ExplorePage> {
    let client: BatotoSource = BatotoSource::new();

    let limit_usize = *limit as usize;

    let popular_section = ExploreSection {
        title: "Popular Releases".to_string(),
        entries: client.get_popular_manga(&cache, &limit_usize).await?,
    };

    let latest_section = ExploreSection {
        title: "Latest Releases".to_string(),
        entries: client.get_latest_manga(&cache, &limit_usize).await?,
    };

    Ok(ExplorePage {
        source: "batoto".to_string(),
        sections: vec![popular_section, latest_section],
    })
}
