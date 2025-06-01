use super::parser::{
    extract_latest_entries, extract_latest_titles, extract_popular_entries, extract_popular_titles,
    extract_series_details,
};

use crate::{
    error::SourceError,
    source::{EntryExtractor, Source, SourceClient, SourceMethods, SourceResult, TitleExtractor},
    structs::{Manga, MangaEntry},
    utils::get_cached_data,
    EntryCache, MangaCache,
};

use async_trait::async_trait;
use reqwest::Client;
use std::sync::Arc;
use tauri::State;

pub struct BatotoSource {
    data: Source,
}

#[async_trait]
impl SourceMethods for BatotoSource {
    fn new() -> Self {
        BatotoSource {
            data: Source {
                source_client: SourceClient {
                    client: Client::builder()
                        .timeout(std::time::Duration::from_secs(30))
                        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .build()
                        .expect("Failed to build reqwest client"),
                    base_url: "https://battwo.com".to_string(),
                },
            },
        }
    }

    async fn fetch_url(&self, path: Option<String>) -> SourceResult<String> {
        Ok(self
            .data
            .source_client
            .client
            .get(format!(
                "{}/{}",
                &self.data.source_client.base_url,
                path.unwrap_or_default()
            ))
            .send()
            .await?
            .text()
            .await?)
    }

    async fn get_homepage(
        &self,
        cache: &State<'_, EntryCache>,
        limit: &usize,
        extract_titles: TitleExtractor,
        extract_entries: EntryExtractor,
    ) -> SourceResult<Vec<Arc<MangaEntry>>> {
        let html_content = self.fetch_url(None).await?;

        let titles = extract_titles(&html_content, limit)?;

        if titles.is_empty() {
            return Err(SourceError::NotFound("No manga titles found".to_string()));
        }

        let (mut cached, missing) = get_cached_data(&titles, cache).await;

        if !missing.is_empty() {
            let missing_entries = extract_entries(&html_content, &missing, limit)?;
            self.cache_new_entries(missing_entries, cache, &mut cached)
                .await;
        }

        self.order_entries_by_titles(&titles, &cached)
    }

    fn order_entries_by_titles(
        &self,
        titles: &[String],
        cached: &[Arc<MangaEntry>],
    ) -> SourceResult<Vec<Arc<MangaEntry>>> {
        use std::collections::HashMap;

        let entry_map: HashMap<&String, &Arc<MangaEntry>> =
            cached.iter().map(|entry| (&entry.title, entry)).collect();

        let result: Vec<Arc<MangaEntry>> = titles
            .iter()
            .filter_map(|title| entry_map.get(title).map(|&entry| Arc::clone(entry)))
            .collect();

        Ok(result)
    }

    async fn get_manga(&self, cache: &State<'_, MangaCache>, id: &str) -> SourceResult<Arc<Manga>> {
        if let Some(cached) = cache.get(&id.to_string()).await {
            return Ok(cached);
        }

        let html_content = self.fetch_url(Some(format!("series/{}", id))).await?;

        let entry: Manga = extract_series_details(&html_content, id)?;
        let arc_entry: Arc<Manga> = Arc::new(entry);

        cache.insert(id.to_string(), Arc::clone(&arc_entry)).await;

        Ok(arc_entry)
    }
}

impl BatotoSource {
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

    pub async fn get_popular_manga(
        &self,
        cache: &State<'_, EntryCache>,
        limit: &usize,
    ) -> SourceResult<Vec<Arc<MangaEntry>>> {
        self.get_homepage(
            cache,
            limit,
            Box::new(|html_content, limit| extract_popular_titles(html_content, limit)),
            Box::new(|html_content, missing_titles, limit| {
                extract_popular_entries(html_content, missing_titles, limit)
            }),
        )
        .await
    }

    pub async fn get_latest_manga(
        &self,
        cache: &State<'_, EntryCache>,
        limit: &usize,
    ) -> Result<Vec<Arc<MangaEntry>>, SourceError> {
        self.get_homepage(
            cache,
            limit,
            Box::new(|html_content, limit| extract_latest_titles(html_content, limit)),
            Box::new(|html_content, missing_titles, limit| {
                extract_latest_entries(html_content, missing_titles, limit)
            }),
        )
        .await
    }

    pub async fn get_manga_details(
        &self,
        cache: &State<'_, MangaCache>,
        id: &str,
    ) -> SourceResult<Arc<Manga>> {
        self.get_manga(cache, id).await
    }
}
