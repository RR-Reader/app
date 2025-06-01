use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MangaEntry {
    pub source: String,
    pub id: String,
    pub title: String,
    pub cover_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Manga {
    pub id: String,
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
    pub id: String,
    pub title: String,
    pub released_since: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Chapter {
    pub id: String,
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
