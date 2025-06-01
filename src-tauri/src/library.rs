use crate::{settings::get_library_path, structs::MangaEntry, utils::slugify};
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use std::{fs, sync::Arc};
use tauri::AppHandle;

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

    fn create_default(app_handle: &AppHandle) -> Result<(), String> {
        let mut default_library: Library = Library::new();
        default_library.categories.push(Category {
            title: "All Titles".to_string(),
            slug: "all-titles".to_string(),
            entries: Vec::new(),
            sort_by: "title".to_string(),
            sort_order: "asc".to_string(),
        });
        default_library.save(app_handle)
    }

    pub fn save(&self, app_handle: &AppHandle) -> Result<(), String> {
        let json =
            to_string_pretty(self).map_err(|e| format!("Failed to serialize library: {}", e))?;

        let library_path = get_library_path(app_handle)?;
        fs::write(library_path, json).map_err(|e| format!("Failed to write library file: {}", e))
    }

    pub fn load(app_handle: &AppHandle) -> Result<Self, String> {
        let library_path = get_library_path(app_handle)?;

        if !library_path.exists() {
            Self::create_default(app_handle)?;
        }

        let raw_library = fs::read_to_string(&library_path)
            .map_err(|e| format!("Failed to read library: {}", e))?;

        from_str::<Library>(&raw_library)
            .map_err(|e| format!("Failed to parse library JSON: {}", e))
    }

    pub fn create_category(
        &mut self,
        category_name: &str,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
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
        self.save(app_handle)
    }

    pub fn add_manga(
        &mut self,
        category_name: &str,
        manga_entry: Arc<MangaEntry>,
        app_handle: &AppHandle,
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
            all_category.entries.sort_by(|a, b| a.title.cmp(&b.title));
        } else {
            return Err("Default category 'All Titles' does not exist".to_string());
        }

        self.save(app_handle)
    }

    pub fn remove_manga(
        &mut self,
        category_name: &str,
        manga_id: &str,
        manga_source: &str,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        println!(
            "Removing manga: category={}, id={}, source={}",
            category_name, manga_id, manga_source
        );

        let mut manga_found = false;

        if let Some(category) = self
            .categories
            .iter_mut()
            .find(|cat| cat.title == category_name)
        {
            let initial_len = category.entries.len();
            category.entries.retain(|entry| {
                let should_keep = !(entry.id == manga_id && entry.source == manga_source);
                if !should_keep {
                    manga_found = true;
                    println!("Found and removing manga from category '{}'", category_name);
                }
                should_keep
            });

            if category.entries.len() == initial_len && !manga_found {
                return Err(format!("Manga not found in category '{}'", category_name));
            }
        } else {
            return Err(format!("Category '{}' does not exist", category_name));
        }

        if category_name != "All Titles" {
            if let Some(all_category) = self
                .categories
                .iter_mut()
                .find(|cat| cat.title == "All Titles")
            {
                all_category
                    .entries
                    .retain(|entry| !(entry.id == manga_id && entry.source == manga_source));
                println!("Also removed from 'All Titles' category");
            }
        }

        self.save(app_handle)
    }

    fn manga_exists(&self, manga_entry: &MangaEntry) -> bool {
        self.categories.iter().any(|cat| {
            cat.entries
                .iter()
                .any(|entry| entry.id == manga_entry.id && entry.source == manga_entry.source)
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
            if category
                .entries
                .iter()
                .any(|entry| entry.id == manga_entry.id && entry.source == manga_entry.source)
            {
                return Ok(category.title.clone());
            }
        }

        Err("Manga entry not found in any category.".to_string())
    }
}

#[tauri::command]
pub fn load_library(app_handle: AppHandle) -> Result<Library, String> {
    Library::load(&app_handle)
}

#[tauri::command]
pub fn get_category_by_slug(slug: String, app_handle: AppHandle) -> Result<Category, String> {
    let library = Library::load(&app_handle)?;
    library.load_category_by_slug(&slug)
}

#[tauri::command]
pub fn is_manga_in_library(manga_entry: MangaEntry, app_handle: AppHandle) -> Result<bool, String> {
    let library: Library = Library::load(&app_handle)?;
    Ok(library.manga_exists(&manga_entry))
}

#[tauri::command]
pub fn create_category(category_name: String, app_handle: AppHandle) -> Result<(), String> {
    let mut library: Library = Library::load(&app_handle)?;
    library.create_category(&category_name, &app_handle)
}

#[tauri::command]
pub fn add_manga_to_category(
    category_name: String,
    manga_entry: MangaEntry,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut library: Library = Library::load(&app_handle)?;
    library.add_manga(&category_name, Arc::new(manga_entry), &app_handle)
}

#[tauri::command]
pub fn remove_manga_from_category(
    category_name: String,
    manga_id: String,
    manga_source: String,
    app_handle: AppHandle,
) -> Result<(), String> {
    println!("Tauri command: remove_manga_from_category called with: category_name={}, manga_id={}, manga_source={}", 
             category_name, manga_id, manga_source);

    if category_name.trim().is_empty()
        || manga_id.trim().is_empty()
        || manga_source.trim().is_empty()
    {
        return Err("Category name, manga ID, and source are required".to_string());
    }

    let mut library = Library::load(&app_handle)?;
    library.remove_manga(&category_name, &manga_id, &manga_source, &app_handle)
}

#[tauri::command]
pub fn find_category_for_manga(
    manga_entry: MangaEntry,
    app_handle: AppHandle,
) -> Result<String, String> {
    let library: Library = Library::load(&app_handle)?;
    library.find_category_for_manga(&manga_entry)
}
