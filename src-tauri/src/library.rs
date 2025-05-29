use crate::{structs::MangaEntry, utils::slugify};
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use std::{fs, path::Path, sync::Arc};

const LIBRARY_PATH: &'static str = "library.json";

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Library {
    pub categories: Vec<Category>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Category {
    pub title: String,
    pub slug: String,
    pub entries: Vec<Arc<MangaEntry>>,
    pub sort_by: String,
    pub sort_order: String,
}

impl Library {
    fn new() -> Self {
        Library {
            categories: Vec::new(),
        }
    }

    fn create_default() -> Result<(), String> {
        let mut default_library: Library = Library::new();
        default_library.categories.push(Category {
            title: "All Titles".to_string(),
            slug: "all-titles".to_string(),
            entries: Vec::new(),
            sort_by: "title".to_string(),
            sort_order: "asc".to_string(),
        });
        default_library.save()
    }

    pub fn save(&self) -> Result<(), String> {
        let json =
            to_string_pretty(self).map_err(|e| format!("Failed to serialize library: {}", e))?;

        fs::write(LIBRARY_PATH, json).map_err(|e| format!("Failed to write library file: {}", e))
    }

    pub fn load() -> Result<Self, String> {
        if !Path::new(LIBRARY_PATH).exists() {
            Self::create_default()?;
        }

        let raw_library = fs::read_to_string(LIBRARY_PATH)
            .map_err(|e| format!("Failed to read library: {}", e))?;

        from_str::<Library>(&raw_library)
            .map_err(|e| format!("Failed to parse library JSON: {}", e))
    }

    pub fn create_category(&mut self, category_name: &str) -> Result<(), String> {
        if self.categories.iter().any(|cat| cat.title == category_name) {
            return Err(format!("Category '{}' already exists", category_name));
        }

        let new_category = Category {
            title: category_name.to_string(),
            slug: slugify(category_name),
            entries: Vec::new(),
            sort_by: "title".to_string(),
            sort_order: "asc".to_string(),
        };

        self.categories.push(new_category);
        self.save()
    }

    pub fn add_manga(
        &mut self,
        category_name: &str,
        manga_entry: Arc<MangaEntry>,
    ) -> Result<(), String> {
        if self.manga_exists(&manga_entry) {
            return Err("Manga already exists in library".to_string());
        }

        if let Some(category) = self
            .categories
            .iter_mut()
            .find(|cat| cat.title == category_name)
        {
            category.entries.push(Arc::clone(&manga_entry));
        } else {
            return Err(format!("Category '{}' does not exist", category_name));
        }

        if let Some(all_category) = self
            .categories
            .iter_mut()
            .find(|cat| cat.title == "All Titles")
        {
            all_category.entries.push(manga_entry);
            all_category.entries.sort_by(|a, b| a.title.cmp(&b.title)); // Sort by title
        } else {
            return Err("Default category 'All Titles' does not exist".to_string());
        }

        self.save()
    }

    fn manga_exists(&self, manga_entry: &MangaEntry) -> bool {
        self.categories.iter().any(|cat| {
            cat.entries.iter().any(|entry| {
                entry.identifier == manga_entry.identifier && entry.source == manga_entry.source
            })
        })
    }

    pub fn load_category_by_slug(&self, slug: &str) -> Result<Category, String> {
        self.categories
            .iter()
            .find(|cat| cat.slug == slug)
            .cloned()
            .ok_or_else(|| format!("Category with slug '{}' not found", slug))
    }

    pub fn find_category_for_manga(&self, manga_entry: &MangaEntry) -> Result<String, String> {
        for category in &self.categories {
            if category.entries.iter().any(|entry| {
                entry.identifier == manga_entry.identifier && entry.source == manga_entry.source
            }) {
                return Ok(category.title.clone());
            }
        }

        Err("Manga entry not found in any category.".to_string())
    }
}

#[tauri::command]
pub fn load_library() -> Result<Library, String> {
    Library::load()
}

#[tauri::command]
pub fn get_category_by_slug(slug: String) -> Result<Category, String> {
    let library = Library::load()?;
    library.load_category_by_slug(&slug)
}

#[tauri::command]
pub fn create_category(category_name: String) -> Result<(), String> {
    let mut library: Library = Library::load()?;
    library.create_category(&category_name)
}

#[tauri::command]
pub fn save_manga(category_name: String, manga_entry: MangaEntry) -> Result<(), String> {
    let mut library: Library = Library::load()?;
    library.add_manga(&category_name, Arc::new(manga_entry))
}

#[tauri::command]
pub fn find_category_for_manga(manga_entry: MangaEntry) -> Result<String, String> {
    let library: Library = Library::load()?;
    library.find_category_for_manga(&manga_entry)
}
