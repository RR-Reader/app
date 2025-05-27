use crate::{
    structs::{ChapterEntry, Manga, MangaEntry},
    utils::{create_selectors, ScrapingError},
};
use regex::Regex;
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
                let cover_url = item
                    .select(&selector_map["img"])
                    .next()
                    .and_then(|img| img.value().attr("src"))
                    .unwrap_or("")
                    .to_string();

                if title.is_empty() || title_url.is_empty() {
                    continue;
                }

                let identifier = extract_id_from_url(&title_url).ok_or_else(|| {
                    ScrapingError::ParseError("Failed to extract ID from URL".to_string())
                })?;

                let entry = MangaEntry {
                    identifier,
                    title,
                    cover_url,
                    source: "batoto".to_string(),
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
                let cover_url = item
                    .select(&selector_map["img"])
                    .next()
                    .and_then(|img| img.value().attr("src"))
                    .unwrap_or("")
                    .to_string();

                if title.is_empty() || title_url.is_empty() {
                    continue;
                }

                let identifier = extract_id_from_url(&title_url).ok_or_else(|| {
                    ScrapingError::ParseError("Failed to extract ID from URL".to_string())
                })?;

                let entry = MangaEntry {
                    title,
                    identifier,
                    cover_url,
                    source: "batoto".to_string(),
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

pub fn construct_url_from_id(identifier: &str) -> String {
    format!("https://battwo.com/series/{identifier}")
}

pub fn extract_id_from_url(url: &str) -> Option<String> {
    let re = Regex::new(r"/series/(\d+)").unwrap();
    re.captures(url)
        .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
}

pub fn extract_series_details(
    html_content: &str,
    identifier: &str,
) -> Result<Manga, ScrapingError> {
    let document: Html = Html::parse_document(html_content);

    let url: String = construct_url_from_id(identifier);

    let identifier: String =
        extract_id_from_url(&url).expect("Failed to extract series ID from URL");

    let selector_defs: [(&'static str, &'static str); 11] = [
        ("title", "h3.item-title"),
        ("image", "div.attr-cover > img"),
        ("description", "div.limit-html"),
        ("item", "div.attr-item"),
        ("item-label", "div.attr-item > b"),
        ("item-content", "div.attr-item > span"),
        ("chapter-list", "div.main"),
        ("chapter-item", "div.item"),
        ("chapter-title", "a.chapt > b"),
        ("chapter-url", "a.chapt"),
        ("chapter-date", "i.ps-3"),
    ];

    let selector_map: HashMap<String, Selector> = create_selectors(&selector_defs)?;

    let mut genres: Vec<String> = Vec::new();
    let mut authors: Vec<String> = Vec::new();
    let mut artists: Vec<String> = Vec::new();

    let title: String = document
        .select(&selector_map["title"])
        .next()
        .map(|t| t.text().collect::<String>().trim().to_string())
        .unwrap_or_else(|| "Untitled".to_string());

    let cover_url: String = document
        .select(&selector_map["image"])
        .next()
        .and_then(|img| img.value().attr("src"))
        .unwrap_or("")
        .to_string();

    let description: String = document
        .select(&selector_map["description"])
        .next()
        .map(|t| t.text().collect::<String>().trim().to_string())
        .unwrap_or_else(|| "Untitled".to_string());

    for item in document.select(&selector_map["item"]) {
        let label = item
            .select(&selector_map["item-label"])
            .next()
            .map(|e| e.text().collect::<String>().trim().to_lowercase());

        let content = item
            .select(&selector_map["item-content"])
            .next()
            .map(|e| e.text().collect::<String>().trim().to_string());

        match (label.as_deref(), content) {
            (Some(label), Some(data)) if label.contains("author") => {
                authors = data.split('/').map(|s| s.trim().to_string()).collect();
            }
            (Some(label), Some(data)) if label.contains("artist") => {
                artists = data.split('/').map(|s| s.trim().to_string()).collect();
            }
            (Some(label), Some(data)) if label.contains("genre") => {
                genres = data.split(',').map(|s| s.trim().to_string()).collect();
            }
            _ => {}
        }
    }

    let mut chapters: Vec<ChapterEntry> = Vec::new();

    if let Some(base) = document.select(&selector_map["chapter-list"]).next() {
        for item in base.select(&selector_map["chapter-item"]) {
            let title: String = item
                .select(&selector_map["chapter-title"])
                .next()
                .map(|b| b.text().collect::<String>().trim().to_string())
                .unwrap_or_else(|| "Untitled".to_string());

            let url: String = item
                .select(&selector_map["chapter-url"])
                .next()
                .and_then(|a| a.value().attr("href"))
                .unwrap_or("")
                .to_string();

            let released_since = item
                .select(&selector_map["chapter-date"])
                .next()
                .map(|s| s.text().collect::<String>().trim().to_string())
                .unwrap_or_else(|| "Unknown".to_string());

            chapters.push(ChapterEntry {
                title,
                url,
                released_since,
            });
        }
    } else {
        return Err(ScrapingError::ParseError(
            "Could not find chapter list".to_string(),
        ));
    }

    let manga_base = Manga {
        identifier,
        title,
        description,
        artists,
        authors,
        genres,
        cover_url,
        chapters,
    };

    Ok(manga_base)
}
