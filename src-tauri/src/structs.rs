pub struct MangaEntry {
    pub title: String,
    pub cover_url: String,
    pub url: String,
}

pub struct Manga {
    pub title: String,
    pub author: String,
    pub description: String,
    pub cover_url: String,
    pub url: String,
    pub chapters: Vec<Chapter>,
}

pub struct Chapter {
    pub url: String,
    pub pages: Vec<String>,
}
