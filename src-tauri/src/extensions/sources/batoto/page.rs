use super::client::BatotoClient;
use crate::{
    structs::{ExplorePage, ExploreSection},
    EntryCache,
};
use tauri::{command, State};

#[command]
pub async fn get_batoto_page(cache: State<'_, EntryCache>) -> Result<ExplorePage, String> {
    let client: BatotoClient = BatotoClient::new();

    let popular_section = ExploreSection {
        title: "Popular Releases".to_string(),
        entries: client.get_popular_manga(&cache, 11).await?,
    };

    let latest_section = ExploreSection {
        title: "Latest Releases".to_string(),
        entries: client.get_latest_manga(&cache, 23).await?,
    };

    Ok(ExplorePage {
        source: "batoto".to_string(),
        sections: vec![popular_section, latest_section],
    })
}
