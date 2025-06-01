use moka::future::Cache;
use scraper::Selector;
use std::{collections::HashMap, sync::Arc};


use crate::{structs::MangaEntry, error::SourceError};

pub fn create_selectors(
    selectors: &[(&str, &str)],
) -> Result<HashMap<String, Selector>, SourceError> {
    selectors
        .iter()
        .map(|(name, css)| {
            Selector::parse(css)
                .map(|sel| (name.to_string(), sel))
                .map_err(|e| SourceError::Parsing(format!("{name}: {e}")))
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

pub fn slugify(title: &str) -> String {
    title
        .to_lowercase()
        .replace(' ', "-")
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-')
        .collect()
}
