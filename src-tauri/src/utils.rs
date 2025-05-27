use moka::future::Cache;
use scraper::Selector;
use std::{collections::HashMap, sync::Arc};

use crate::structs::MangaEntry;

#[derive(Debug)]
pub enum ScrapingError {
    NetworkError(String),
    ParseError(String),
    SelectorError(String),
}

impl std::fmt::Display for ScrapingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ScrapingError::NetworkError(msg) => write!(f, "Network error: {}", msg),
            ScrapingError::ParseError(msg) => write!(f, "Parse error: {}", msg),
            ScrapingError::SelectorError(msg) => write!(f, "Selector error: {}", msg),
        }
    }
}

impl From<ScrapingError> for String {
    fn from(error: ScrapingError) -> Self {
        error.to_string()
    }
}

pub fn create_selectors(
    selectors: &[(&str, &str)],
) -> Result<HashMap<String, Selector>, ScrapingError> {
    selectors
        .iter()
        .map(|(name, css)| {
            Selector::parse(css)
                .map(|sel| (name.to_string(), sel))
                .map_err(|e| ScrapingError::SelectorError(format!("{name}: {e}")))
        })
        .collect()
}

pub async fn get_cached_data(
    names: &[String],
    cache: &Cache<String, Arc<MangaEntry>>,
) -> (Vec<Arc<MangaEntry>>, Vec<String>) {
    let mut cached = Vec::new();
    let mut missing = Vec::new();

    for name in names {
        if let Some(entry) = cache.get(name).await {
            cached.push(entry);
        } else {
            missing.push(name.clone());
        }
    }

    (cached, missing)
}
