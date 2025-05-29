use super::parser::{
    construct_url_from_id, extract_latest_entries, extract_latest_titles, extract_popular_entries,
    extract_popular_titles, extract_series_details,
};
use crate::{
    structs::{Manga, MangaEntry},
    utils::{get_cached_data, ScrapingError},
    EntryCache, MangaCache,
};
use reqwest::Client;
use std::sync::Arc;
use tauri::State;

pub struct BatotoClient {
    base_url: String,
    client: Client,
}

impl BatotoClient {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .build()
            .expect("Failed to build reqwest client");

        Self {
            client,
            base_url: "https://battwo.com".to_string(),
        }
    }

    async fn fetch_homepage(&self) -> Result<String, String> {
        self.client
            .get(&self.base_url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))
    }

    async fn get_entries<TitleExtractor, EntryExtractor>(
        &self,
        cache: &State<'_, EntryCache>,
        limit: usize,
        extract_titles: TitleExtractor,
        extract_entries: EntryExtractor,
    ) -> Result<Vec<Arc<MangaEntry>>, ScrapingError>
    where
        TitleExtractor: Fn(&str, usize) -> Result<Vec<String>, ScrapingError>,
        EntryExtractor: Fn(&str, &[String], usize) -> Result<Vec<MangaEntry>, ScrapingError>,
    {
        let html_content = self
            .fetch_homepage()
            .await
            .map_err(|e| ScrapingError::NetworkError(format!("Failed to fetch homepage: {}", e)))?;

        let titles = extract_titles(&html_content, limit)?;

        if titles.is_empty() {
            return Err(ScrapingError::ParseError(
                "No manga titles found".to_string(),
            ));
        }

        let (mut cached, missing) = get_cached_data(&titles, cache).await;

        if !missing.is_empty() {
            let missing_entries = extract_entries(&html_content, &missing, limit)?;
            self.cache_new_entries(missing_entries, cache, &mut cached)
                .await;
        }

        self.order_entries_by_titles(&titles, &cached)
    }

    async fn cache_new_entries(
        &self,
        entries: Vec<MangaEntry>,
        cache: &State<'_, EntryCache>,
        cached: &mut Vec<Arc<MangaEntry>>,
    ) {
        for entry in entries {
            let arc_entry = Arc::new(entry);
            cache
                .insert(arc_entry.title.clone(), Arc::clone(&arc_entry))
                .await;
            cached.push(arc_entry);
        }
    }

    fn order_entries_by_titles(
        &self,
        titles: &[String],
        cached: &[Arc<MangaEntry>],
    ) -> Result<Vec<Arc<MangaEntry>>, ScrapingError> {
        // Changed return type
        use std::collections::HashMap;

        let entry_map: HashMap<&String, &Arc<MangaEntry>> =
            cached.iter().map(|entry| (&entry.title, entry)).collect();

        let result: Vec<Arc<MangaEntry>> = titles
            .iter()
            .filter_map(|title| entry_map.get(title).map(|&entry| Arc::clone(entry)))
            .collect();

        Ok(result)
    }

    pub async fn get_popular_manga(
        &self,
        cache: &State<'_, EntryCache>,
        limit: usize,
    ) -> Result<Vec<Arc<MangaEntry>>, ScrapingError> {
        self.get_entries(
            cache,
            limit,
            extract_popular_titles,
            extract_popular_entries,
        )
        .await
    }

    pub async fn get_latest_manga(
        &self,
        cache: &State<'_, EntryCache>,
        limit: usize,
    ) -> Result<Vec<Arc<MangaEntry>>, ScrapingError> {
        self.get_entries(cache, limit, extract_latest_titles, extract_latest_entries)
            .await // Convert ScrapingError to String
    }

    pub async fn get_manga_details(
        &self,
        cache: State<'_, MangaCache>,
        identifier: &str,
    ) -> Result<Arc<Manga>, String> {
        let url: String = construct_url_from_id(identifier);

        if let Some(cached) = cache.get(&identifier.to_string()).await {
            return Ok(cached);
        }

        let html_content: String = self
            .client
            .get(url)
            .send()
            .await
            .map_err(|e| ScrapingError::NetworkError(format!("Request failed: {}", e)))?
            .text()
            .await
            .map_err(|e| ScrapingError::NetworkError(format!("Failed to read response: {}", e)))?;

        let entry: Manga = extract_series_details(&html_content, &identifier)?;
        let arc_entry: Arc<Manga> = Arc::new(entry);

        cache
            .insert(identifier.to_string(), Arc::clone(&arc_entry))
            .await;

        Ok(arc_entry)
    }
}
// https://battwo.com/series/189412/divorce-then-a-comeback-with-billions
