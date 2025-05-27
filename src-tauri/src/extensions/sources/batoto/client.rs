use super::parser::{
    extract_latest_entries, extract_latest_titles, extract_popular_entries, extract_popular_titles,
    extract_series_details, extract_id_from_url,
};
use crate::{
    structs::{Manga, MangaEntry},
    utils::{get_cached_data, ScrapingError},
    {EntryCache, MangaCache},
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

    pub async fn get_popular_manga(
        &self,
        cache: State<'_, EntryCache>,
        limit: usize,
    ) -> Result<Vec<Arc<MangaEntry>>, String> {
        let html_content: String = self
            .client
            .get(&self.base_url)
            .send()
            .await
            .map_err(|e| ScrapingError::NetworkError(format!("Request failed: {}", e)))?
            .text()
            .await
            .map_err(|e| ScrapingError::NetworkError(format!("Failed to read response: {}", e)))?;

        let titles: Vec<String> = extract_popular_titles(&html_content, limit)?;

        if titles.is_empty() {
            return Err("No manga titles found".to_string());
        }

        let (mut cached, missing) = get_cached_data(&titles, &cache).await;

        if missing.is_empty() {
            return Ok(cached);
        }

        let missing_entries: Vec<MangaEntry> =
            extract_popular_entries(&html_content, &missing, limit)?;

        for entry in missing_entries {
            let arc_entry = Arc::new(entry);
            cache
                .insert(arc_entry.title.clone(), Arc::clone(&arc_entry))
                .await;
            cached.push(arc_entry);
        }

        let mut result: Vec<Arc<MangaEntry>> = Vec::with_capacity(titles.len());

        for title in &titles {
            if let Some(entry) = cached.iter().find(|e| &e.title == title) {
                result.push(Arc::clone(entry));
            }
        }

        Ok(result)
    }

    pub async fn get_latest_manga(
        &self,
        cache: State<'_, EntryCache>,
        limit: usize,
    ) -> Result<Vec<Arc<MangaEntry>>, String> {
        let html_content: String = self
            .client
            .get(&self.base_url)
            .send()
            .await
            .map_err(|e| ScrapingError::NetworkError(format!("Request failed: {}", e)))?
            .text()
            .await
            .map_err(|e| ScrapingError::NetworkError(format!("Failed to read response: {}", e)))?;

        let titles: Vec<String> = extract_latest_titles(&html_content, limit)?;

        if titles.is_empty() {
            return Err("No manga titles found".to_string());
        }

        let (mut cached, missing) = get_cached_data(&titles, &cache).await;

        if missing.is_empty() {
            return Ok(cached);
        }

        let missing_entries: Vec<MangaEntry> =
            extract_latest_entries(&html_content, &missing, limit)?;

        for entry in missing_entries {
            let arc_entry = Arc::new(entry);
            cache
                .insert(arc_entry.title.clone(), Arc::clone(&arc_entry))
                .await;
            cached.push(arc_entry);
        }

        let mut result: Vec<Arc<MangaEntry>> = Vec::with_capacity(titles.len());

        for title in &titles {
            if let Some(entry) = cached.iter().find(|e| &e.title == title) {
                result.push(Arc::clone(entry));
            }
        }

        Ok(result)
    }

    pub async fn get_manga_details(
        &self,
        cache: State<'_, MangaCache>,
        url: &str,
    ) -> Result<Arc<Manga>, String> {
        let identifier = extract_id_from_url(url)
            .ok_or_else(|| "Failed to extract series ID from URL".to_string())?;

        if let Some(cached) = cache.get(&identifier).await {
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

        let entry: Manga = extract_series_details(&html_content, &url)?;
        let arc_entry: Arc<Manga> = Arc::new(entry);

        cache.insert(identifier, Arc::clone(&arc_entry)).await;

        Ok(arc_entry)
    }
}
// https://battwo.com/series/189412/divorce-then-a-comeback-with-billions
