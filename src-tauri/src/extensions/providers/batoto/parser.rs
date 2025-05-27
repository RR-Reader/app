use crate::{
    structs::MangaEntry,
    utils::{create_selectors, ScrapingError},
};
use scraper::{Html, Selector};
use std::collections::HashMap;

pub fn extract_latest_titles(
    html_content: &str,
    limit: usize,
) -> Result<Vec<String>, ScrapingError> {
    let document: Html = Html::parse_document(html_content);

    let selector_defs: [(&str, &str); 3] = [
        ("base_tag", "div.series-list"),
        ("item", "div.col.item"),
        ("title", "a.item-title"),
    ];

    let selector_map: HashMap<String, Selector> = create_selectors(&selector_defs)?;

    let mut titles: Vec<String> = Vec::new();

    if let Some(base) = document.select(&selector_map["base_tag"]).next() {
        for item in base.select(&selector_map["item"]) {
            let title: String = item
                .select(&selector_map["title"])
                .next()
                .map(|a| a.text().collect::<String>().trim().to_string())
                .unwrap_or_else(|| "Untitled".to_string());

            if !title.is_empty() && title != "Untitled" {
                titles.push(title);
            }

            if titles.len() >= limit {
                break;
            }
        }
    } else {
        return Err(ScrapingError::ParseError(
            "Could not find base container".to_string(),
        ));
    }

    Ok(titles)
}

pub fn extract_latest_entries(
    html_content: &str,
    missing_titles: &[String],
    limit: usize,
) -> Result<Vec<MangaEntry>, ScrapingError> {
    let document: Html = Html::parse_document(html_content);

    let selector_defs: [(&str, &str); 4] = [
        ("base_tag", "div.series-list"),
        ("item", "div.col.item"),
        ("img", "a.item-cover > img"),
        ("title", "a.item-title"),
    ];

    let selector_map: HashMap<String, Selector> = create_selectors(&selector_defs)?;

    let mut entries: Vec<MangaEntry> = Vec::new();

    if let Some(base) = document.select(&selector_map["base_tag"]).next() {
        for item in base.select(&selector_map["item"]) {
            let title_tag = item.select(&selector_map["title"]).next();

            let (title, title_url) = match title_tag {
                Some(a) => {
                    let title_text = a.text().collect::<String>().trim().to_string();
                    let url = a.value().attr("href").unwrap_or("").to_string();
                    (title_text, url)
                }
                None => continue,
            };

            if missing_titles.contains(&title) {
                let cover_img = item
                    .select(&selector_map["img"])
                    .next()
                    .and_then(|img| img.value().attr("src"))
                    .unwrap_or("")
                    .to_string();

                if title.is_empty() || title_url.is_empty() {
                    continue;
                }

                let entry = MangaEntry {
                    title,
                    url: title_url,
                    cover_url: cover_img,
                };

                entries.push(entry);
            }

            if entries.len() >= limit {
                break;
            }
        }
    } else {
        return Err(ScrapingError::ParseError(
            "Could not find base container".to_string(),
        ));
    }

    Ok(entries)
}

pub fn extract_popular_titles(
    html_content: &str,
    limit: usize,
) -> Result<Vec<String>, ScrapingError> {
    let document = Html::parse_document(html_content);

    let selector_defs: [(&'static str, &'static str); 3] = [
        ("base_tag", "div.home-popular"),
        ("item", "div.col.item"),
        ("title", "a.item-title"),
    ];

    let selector_map: HashMap<String, Selector> = create_selectors(&selector_defs)?;

    let mut titles = Vec::new();

    if let Some(base) = document.select(&selector_map["base_tag"]).next() {
        for item in base.select(&selector_map["item"]) {
            let title = item
                .select(&selector_map["title"])
                .next()
                .map(|a| a.text().collect::<String>().trim().to_string())
                .unwrap_or_else(|| "Untitled".to_string());

            if !title.is_empty() && title != "Untitled" {
                titles.push(title);
            }

            if titles.len() >= limit {
                break;
            }
        }
    } else {
        return Err(ScrapingError::ParseError(
            "Could not find base container".to_string(),
        ));
    }

    Ok(titles)
}

pub fn extract_popular_entries(
    html_content: &str,
    missing_titles: &[String],
    limit: usize,
) -> Result<Vec<MangaEntry>, ScrapingError> {
    let document = Html::parse_document(html_content);

    let selector_defs: [(&'static str, &'static str); 4] = [
        ("base_tag", "div.home-popular"),
        ("item", "div.col.item"),
        ("title", "a.item-title"),
        ("img", "a.item-cover > img"),
    ];

    let selector_map: HashMap<String, Selector> = create_selectors(&selector_defs)?;

    let mut entries = Vec::new();

    if let Some(base) = document.select(&selector_map["base_tag"]).next() {
        for item in base.select(&selector_map["item"]) {
            let title_tag = item.select(&selector_map["title"]).next();

            let (title, title_url) = match title_tag {
                Some(a) => {
                    let title_text = a.text().collect::<String>().trim().to_string();
                    let url = a.value().attr("href").unwrap_or("").to_string();
                    (title_text, url)
                }
                None => continue,
            };

            if missing_titles.contains(&title) {
                let cover_img = item
                    .select(&selector_map["img"])
                    .next()
                    .and_then(|img| img.value().attr("src"))
                    .unwrap_or("")
                    .to_string();

                if title.is_empty() || title_url.is_empty() {
                    continue;
                }

                let entry = MangaEntry {
                    title,
                    url: title_url,
                    cover_url: cover_img,
                };

                entries.push(entry);
            }

            if entries.len() >= limit {
                break;
            }
        }
    } else {
        return Err(ScrapingError::ParseError(
            "Could not find base container".to_string(),
        ));
    }

    Ok(entries)
}
