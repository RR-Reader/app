use crate::{
    settings::{get_category_path, get_library_path},
    structs::MangaEntry,
    utils::slugify,
};
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use std::{fs, sync::Arc};
use tauri::AppHandle;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Library {
    pub categories: Vec<CategoryMeta>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryMeta {
    pub title: String,
    pub slug: String,
    pub sort_by: String,
    pub sort_order: String,
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
        let library_path = get_library_path(app_handle)?;
        fs::create_dir_all(&library_path)
            .map_err(|e| format!("Failed to create library directory: {}", e))?;

        let mut default_library = Library::new();
        let default_category_meta = CategoryMeta {
            title: "All Titles".to_string(),
            slug: "all-titles".to_string(),
            sort_by: "title".to_string(),
            sort_order: "asc".to_string(),
        };

        let default_category = Category {
            title: default_category_meta.title.clone(),
            slug: default_category_meta.slug.clone(),
            entries: Vec::new(),
            sort_by: default_category_meta.sort_by.clone(),
            sort_order: default_category_meta.sort_order.clone(),
        };

        default_category.save(app_handle)?;
        default_library.categories.push(default_category_meta);
        default_library.save(app_handle)
    }

    pub fn save(&self, app_handle: &AppHandle) -> Result<(), String> {
        let json = to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize library metadata: {}", e))?;

        let library_path = get_library_path(app_handle)?;
        let library_meta_path = library_path.join("library.json");

        fs::create_dir_all(&library_path)
            .map_err(|e| format!("Failed to create library directory: {}", e))?;

        fs::write(library_meta_path, json)
            .map_err(|e| format!("Failed to write library metadata file: {}", e))
    }

    pub fn load(app_handle: &AppHandle) -> Result<Self, String> {
        let library_path = get_library_path(app_handle)?;
        let library_meta_path = library_path.join("library.json");

        if !library_meta_path.exists() {
            Self::create_default(app_handle)?;
        }

        let raw_library = fs::read_to_string(&library_meta_path)
            .map_err(|e| format!("Failed to read library metadata: {}", e))?;

        from_str::<Library>(&raw_library)
            .map_err(|e| format!("Failed to parse library metadata JSON: {}", e))
    }

    pub fn create_category(
        &mut self,
        category_name: &str,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        if self.categories.iter().any(|cat| cat.title == category_name) {
            return Err(format!("Category '{}' already exists", category_name));
        }

        let slug = slugify(category_name);
        let new_category_meta = CategoryMeta {
            title: category_name.to_string(),
            slug: slug.clone(),
            sort_by: "title".to_string(),
            sort_order: "asc".to_string(),
        };

        let new_category = Category {
            title: category_name.to_string(),
            slug: slug.clone(),
            entries: Vec::new(),
            sort_by: "title".to_string(),
            sort_order: "asc".to_string(),
        };

        new_category.save(app_handle)?;

        self.categories.push(new_category_meta);
        self.save(app_handle)
    }

    pub fn add_manga(
        &mut self,
        category_name: &str,
        manga_entry: Arc<MangaEntry>,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        if self.manga_exists(&manga_entry, app_handle)? {
            return Err("Manga already exists in library".to_string());
        }

        let category_meta = self
            .categories
            .iter()
            .find(|cat| cat.title == category_name)
            .ok_or_else(|| format!("Category '{}' does not exist", category_name))?;

        let mut category = Category::load(&category_meta.slug, app_handle)?;
        category.entries.push(Arc::clone(&manga_entry));
        category.save(app_handle)?;

        if category_name != "All Titles" {
            if let Some(all_titles_meta) =
                self.categories.iter().find(|cat| cat.title == "All Titles")
            {
                let mut all_category = Category::load(&all_titles_meta.slug, app_handle)?;
                all_category.entries.push(manga_entry);
                all_category.entries.sort_by(|a, b| a.title.cmp(&b.title));
                all_category.save(app_handle)?;
            } else {
                return Err("Default category 'All Titles' does not exist".to_string());
            }
        }

        Ok(())
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

        let category_meta = self
            .categories
            .iter()
            .find(|cat| cat.title == category_name)
            .ok_or_else(|| format!("Category '{}' does not exist", category_name))?;

        let mut category = Category::load(&category_meta.slug, app_handle)?;
        let initial_len = category.entries.len();
        let mut manga_found = false;

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

        category.save(app_handle)?;

        if category_name != "All Titles" {
            if let Some(all_titles_meta) =
                self.categories.iter().find(|cat| cat.title == "All Titles")
            {
                let mut all_category = Category::load(&all_titles_meta.slug, app_handle)?;
                all_category
                    .entries
                    .retain(|entry| !(entry.id == manga_id && entry.source == manga_source));
                all_category.save(app_handle)?;
                println!("Also removed from 'All Titles' category");
            }
        }

        Ok(())
    }

    fn manga_exists(
        &self,
        manga_entry: &MangaEntry,
        app_handle: &AppHandle,
    ) -> Result<bool, String> {
        for category_meta in &self.categories {
            let category = Category::load(&category_meta.slug, app_handle)?;
            if category
                .entries
                .iter()
                .any(|entry| entry.id == manga_entry.id && entry.source == manga_entry.source)
            {
                return Ok(true);
            }
        }
        Ok(false)
    }

    pub fn load_category_by_slug(
        &self,
        slug: &str,
        app_handle: &AppHandle,
    ) -> Result<Category, String> {
        if !self.categories.iter().any(|cat| cat.slug == slug) {
            return Err(format!("Category with slug '{}' not found", slug));
        }

        Category::load(slug, app_handle)
    }

    pub fn find_category_for_manga(
        &self,
        manga_entry: &MangaEntry,
        app_handle: &AppHandle,
    ) -> Result<String, String> {
        for category_meta in &self.categories {
            let category = Category::load(&category_meta.slug, app_handle)?;
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

impl Category {
    pub fn save(&self, app_handle: &AppHandle) -> Result<(), String> {
        let json =
            to_string_pretty(self).map_err(|e| format!("Failed to serialize category: {}", e))?;

        let category_path = get_category_path(app_handle, &self.slug)?;

        if let Some(parent) = category_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create category directory: {}", e))?;
        }

        fs::write(category_path, json).map_err(|e| format!("Failed to write category file: {}", e))
    }

    pub fn load(slug: &str, app_handle: &AppHandle) -> Result<Self, String> {
        let category_path = get_category_path(app_handle, slug)?;

        if !category_path.exists() {
            return Err(format!("Category file for '{}' does not exist", slug));
        }

        let raw_category = fs::read_to_string(&category_path)
            .map_err(|e| format!("Failed to read category file: {}", e))?;

        from_str::<Category>(&raw_category)
            .map_err(|e| format!("Failed to parse category JSON: {}", e))
    }
}

#[tauri::command]
pub fn load_library(app_handle: AppHandle) -> Result<Library, String> {
    Library::load(&app_handle)
}

#[tauri::command]
pub fn get_category_by_slug(slug: String, app_handle: AppHandle) -> Result<Category, String> {
    let library = Library::load(&app_handle)?;
    library.load_category_by_slug(&slug, &app_handle)
}

#[tauri::command]
pub fn is_manga_in_library(manga_entry: MangaEntry, app_handle: AppHandle) -> Result<bool, String> {
    let library = Library::load(&app_handle)?;
    library.manga_exists(&manga_entry, &app_handle)
}

#[tauri::command]
pub fn create_category(category_name: String, app_handle: AppHandle) -> Result<(), String> {
    let mut library = Library::load(&app_handle)?;
    library.create_category(&category_name, &app_handle)
}

#[tauri::command]
pub fn add_manga_to_category(
    category_name: String,
    manga_entry: MangaEntry,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut library = Library::load(&app_handle)?;
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
    let library = Library::load(&app_handle)?;
    library.find_category_for_manga(&manga_entry, &app_handle)
}
