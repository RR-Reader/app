use async_trait::async_trait;
use std::sync::Arc;

use tauri::State;

use crate::{
    error::SourceError,
    structs::{Manga, MangaEntry},
    EntryCache, MangaCache,
};

pub struct SourceClient {
    pub client: reqwest::Client,
    pub base_url: String,
}

pub struct Source {
    pub source_client: SourceClient,
}

pub type SourceResult<T> = Result<T, SourceError>;

pub type TitleExtractor = Box<dyn Fn(&str, &usize) -> SourceResult<Vec<String>> + Send + Sync>;
pub type EntryExtractor =
    Box<dyn Fn(&str, &[String], &usize) -> SourceResult<Vec<MangaEntry>> + Send + Sync>;

#[async_trait]
pub trait SourceMethods {
    fn new() -> Self;
    async fn fetch_url(&self, path: Option<String>) -> SourceResult<String>;
    async fn get_homepage(
        &self,
        cache: &State<'_, EntryCache>,
        limit: &usize,
        extract_titles: TitleExtractor,
        extract_entries: EntryExtractor,
    ) -> SourceResult<Vec<Arc<MangaEntry>>>;
    fn order_entries_by_titles(
        &self,
        titles: &[String],
        cached: &[Arc<MangaEntry>],
    ) -> SourceResult<Vec<Arc<MangaEntry>>>;
    async fn get_manga(&self, cache: &State<'_, MangaCache>, id: &str) -> SourceResult<Arc<Manga>>;
}
