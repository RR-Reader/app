use std::sync::Arc;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct MangaEntry {
    pub source: String,
    pub identifier: String,
    pub title: String,
    pub cover_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Manga {
    pub identifier: String,
    pub title: String,
    pub artists: Vec<String>,
    pub authors: Vec<String>,
    pub genres: Vec<String>,
    pub description: String,
    pub cover_url: String,
    pub chapters: Vec<ChapterEntry>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ChapterEntry {
    pub title: String,
    pub url: String,
    pub released_since: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Chapter {
    pub url: String,
    pub pages: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExploreSection {
    pub title: String,
    pub entries: Vec<Arc<MangaEntry>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExplorePage {
    pub source: String,
    pub sections: Vec<ExploreSection>,
}
