use super::client::BatotoClient;
use crate::{
    structs::{ExplorePage, ExploreSection},
    EntryCache,
};
use tauri::{command, State};

#[command]
pub async fn get_explore_page(cache: State<'_, EntryCache>) -> Result<ExplorePage, String> {
    let client: BatotoClient = BatotoClient::new();

    let popular_section = ExploreSection {
        title: "Popular Releases".to_string(),
        entries: client.get_popular_manga(&cache, 16).await?,
    };

    let latest_section = ExploreSection {
        title: "Latest Releases".to_string(),
        entries: client.get_latest_manga(&cache, 36).await?,
    };

    Ok(ExplorePage {
        source: "batoto".to_string(),
        sections: vec![popular_section, latest_section],
    })
}
