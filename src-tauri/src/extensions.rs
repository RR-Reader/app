use crate::{
    settings::{get_extensions_manifest_path, get_extensions_path},
    utils::clone_repo,
};
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use std::{fs, path::Path};
use tauri::{command, AppHandle};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExtensionManager {
    pub extensions: Vec<Extension>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Extension {
    pub name: String,
    pub slug: String,
    pub version: String,
    pub repository: String,
    pub metadata: Option<ExtensionMetadata>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExtensionMetadata {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub homepage_url: String,
    pub icon_url: String,
    pub language: Language,
    pub intents: Vec<String>,
    pub content_rating: String,
    pub capabilities: Capabilities,
    pub settings: Vec<Setting>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Language {
    pub key: String,
    pub name: String,
    pub flag_code: String,
    pub iso639_1: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Capabilities {
    pub search: bool,
    pub home_sections: bool,
    pub manga_details: bool,
    pub chapter_reading: bool,
    pub manga_tracking: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Setting {
    pub key: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "type")]
    pub setting_type: String,
    pub default: serde_json::Value,
}

impl ExtensionManager {
    pub fn new() -> Self {
        ExtensionManager {
            extensions: Vec::new(),
        }
    }

    fn create_default(app_handle: &AppHandle) -> Result<(), String> {
        let extensions_path = get_extensions_path(app_handle)?;
        fs::create_dir_all(&extensions_path)
            .map_err(|e| format!("Failed to create extensions directory: {}", e))?;

        let default_manager = ExtensionManager::new();
        default_manager.save(app_handle)
    }

    pub fn save(&self, app_handle: &AppHandle) -> Result<(), String> {
        let json = to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize extensions manifest: {}", e))?;

        let manifest_path = get_extensions_manifest_path(app_handle)?;

        let extensions_path = get_extensions_path(app_handle)?;
        fs::create_dir_all(&extensions_path)
            .map_err(|e| format!("Failed to create extensions directory: {}", e))?;

        if let Some(parent) = manifest_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create manifest directory: {}", e))?;
        }

        fs::write(manifest_path, json)
            .map_err(|e| format!("Failed to write extensions manifest file: {}", e))
    }

    pub fn load(app_handle: &AppHandle) -> Result<Self, String> {
        let manifest_path = get_extensions_manifest_path(app_handle)?;

        if !manifest_path.exists() {
            println!("Manifest doesn't exist, creating default...");
            Self::create_default(app_handle)?;
        }

        let raw_manifest = fs::read_to_string(&manifest_path)
            .map_err(|e| format!("Failed to read extensions manifest: {}", e))?;

        if raw_manifest.trim().is_empty() {
            println!("Manifest is empty, creating default...");
            Self::create_default(app_handle)?;
            let raw_manifest = fs::read_to_string(&manifest_path).map_err(|e| {
                format!(
                    "Failed to read extensions manifest after creating default: {}",
                    e
                )
            })?;

            return from_str::<ExtensionManager>(&raw_manifest)
                .map_err(|e| format!("Failed to parse extensions manifest JSON: {}", e));
        }

        from_str::<ExtensionManager>(&raw_manifest)
            .map_err(|e| format!("Failed to parse extensions manifest JSON: {}", e))
    }

    fn load_extension_metadata(slug: &str, app_handle: &AppHandle) -> Option<ExtensionMetadata> {
        let extensions_path = match get_extensions_path(app_handle) {
            Ok(path) => path,
            Err(_) => return None,
        };

        let metadata_path = extensions_path.join(slug).join("metadata.json");

        if !metadata_path.exists() {
            return None;
        }

        let metadata_content = fs::read_to_string(&metadata_path).ok()?;
        from_str::<ExtensionMetadata>(&metadata_content).ok()
    }

    pub fn add_extension(
        &mut self,
        name: String,
        slug: String,
        version: String,
        repository: String,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        if self.extensions.iter().any(|ext| ext.slug == slug) {
            return Err(format!("Extension '{}' already exists", slug));
        }

        let extensions_path = get_extensions_path(app_handle)?;
        fs::create_dir_all(&extensions_path)
            .map_err(|e| format!("Failed to create extensions directory: {}", e))?;

        let target_path = extensions_path.join(&slug);

        if target_path.exists() {
            return Err(format!(
                "Extension directory '{}' already exists at {}.",
                slug,
                target_path.display()
            ));
        }

        clone_repo(&repository, &target_path, app_handle)?;

        let metadata = Self::load_extension_metadata(&slug, app_handle);

        let extension = Extension {
            name,
            slug: slug.clone(),
            version,
            repository: repository.clone(),
            metadata,
        };

        self.extensions.push(extension);
        self.save(app_handle)
    }

    pub fn remove_extension(&mut self, slug: &str, app_handle: &AppHandle) -> Result<(), String> {
        let initial_len = self.extensions.len();
        self.extensions.retain(|ext| ext.slug != slug);

        if self.extensions.len() == initial_len {
            return Err(format!("Extension '{}' not found", slug));
        }

        let extensions_path = get_extensions_path(app_handle)?;
        let extension_path = extensions_path.join(slug);

        if extension_path.exists() {
            fs::remove_dir_all(&extension_path)
                .map_err(|e| format!("Failed to remove extension directory: {}", e))?;
        }

        self.save(app_handle)
    }

    pub fn get_extension(&self, slug: &str) -> Option<&Extension> {
        self.extensions.iter().find(|ext| ext.slug == slug)
    }

    pub fn extension_exists(&self, slug: &str) -> bool {
        self.extensions.iter().any(|ext| ext.slug == slug)
    }

    pub fn update_extension(
        &mut self,
        slug: &str,
        version: Option<String>,
        repository: Option<String>,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        let extension = self
            .extensions
            .iter_mut()
            .find(|ext| ext.slug == slug)
            .ok_or_else(|| format!("Extension '{}' not found", slug))?;

        if let Some(new_version) = version {
            extension.version = new_version;
        }

        if let Some(new_repository) = repository {
            extension.repository = new_repository;
        }

        extension.metadata = Self::load_extension_metadata(slug, app_handle);

        self.save(app_handle)
    }

    pub fn refresh_extension_metadata(
        &mut self,
        slug: &str,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        let extension = self
            .extensions
            .iter_mut()
            .find(|ext| ext.slug == slug)
            .ok_or_else(|| format!("Extension '{}' not found", slug))?;

        extension.metadata = Self::load_extension_metadata(slug, app_handle);
        self.save(app_handle)
    }

    pub fn refresh_all_metadata(&mut self, app_handle: &AppHandle) -> Result<(), String> {
        for extension in &mut self.extensions {
            extension.metadata = Self::load_extension_metadata(&extension.slug, app_handle);
        }
        self.save(app_handle)
    }

    pub fn list_extensions(&self) -> &Vec<Extension> {
        &self.extensions
    }

    pub fn get_extensions_by_capability(&self, capability: &str) -> Vec<&Extension> {
        self.extensions
            .iter()
            .filter(|ext| {
                if let Some(metadata) = &ext.metadata {
                    match capability {
                        "search" => metadata.capabilities.search,
                        "home_sections" => metadata.capabilities.home_sections,
                        "manga_details" => metadata.capabilities.manga_details,
                        "chapter_reading" => metadata.capabilities.chapter_reading,
                        "manga_tracking" => metadata.capabilities.manga_tracking,
                        _ => false,
                    }
                } else {
                    false
                }
            })
            .collect()
    }

    pub fn get_extensions_by_language(&self, language_key: &str) -> Vec<&Extension> {
        self.extensions
            .iter()
            .filter(|ext| {
                if let Some(metadata) = &ext.metadata {
                    metadata.language.key == language_key || metadata.language.key == "Multi"
                } else {
                    false
                }
            })
            .collect()
    }

    pub fn validate_extension_structure(
        &self,
        slug: &str,
        app_handle: &AppHandle,
    ) -> Result<bool, String> {
        let extensions_path = get_extensions_path(app_handle)?;
        let extension_path = extensions_path.join(slug);

        if !extension_path.exists() {
            return Ok(false);
        }

        let required_paths = vec![
            extension_path.join("src"),
            extension_path.join("Cargo.toml"),
            extension_path.join("metadata.json"),
        ];

        for path in required_paths {
            if !path.exists() {
                return Ok(false);
            }
        }

        Ok(true)
    }
}

impl Extension {
    pub fn new(name: String, slug: String, version: String, repository: String) -> Self {
        Self {
            name,
            slug,
            version,
            repository,
            metadata: None,
        }
    }

    pub fn clone(&self, target_dir: &Path, app_handle: &AppHandle) -> Result<(), String> {
        clone_repo(&self.repository, target_dir, app_handle)
    }

    pub fn has_capability(&self, capability: &str) -> bool {
        if let Some(metadata) = &self.metadata {
            match capability {
                "search" => metadata.capabilities.search,
                "home_sections" => metadata.capabilities.home_sections,
                "manga_details" => metadata.capabilities.manga_details,
                "chapter_reading" => metadata.capabilities.chapter_reading,
                "manga_tracking" => metadata.capabilities.manga_tracking,
                _ => false,
            }
        } else {
            false
        }
    }

    pub fn get_setting(&self, key: &str) -> Option<&Setting> {
        self.metadata
            .as_ref()?
            .settings
            .iter()
            .find(|setting| setting.key == key)
    }

    pub fn supports_language(&self, language_key: &str) -> bool {
        if let Some(metadata) = &self.metadata {
            metadata.language.key == language_key || metadata.language.key == "Multi"
        } else {
            false
        }
    }
}

#[command]
pub fn load_extensions(app_handle: AppHandle) -> Result<ExtensionManager, String> {
    ExtensionManager::load(&app_handle)
}

#[command]
pub fn add_extension(
    name: String,
    slug: String,
    version: String,
    repository: String,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut manager = ExtensionManager::load(&app_handle)?;
    manager.add_extension(name, slug, version, repository, &app_handle)
}

#[command]
pub fn remove_extension(slug: String, app_handle: AppHandle) -> Result<(), String> {
    let mut manager = ExtensionManager::load(&app_handle)?;
    manager.remove_extension(&slug, &app_handle)
}

#[command]
pub fn get_extension(slug: String, app_handle: AppHandle) -> Result<Option<Extension>, String> {
    let manager = ExtensionManager::load(&app_handle)?;
    Ok(manager.get_extension(&slug).cloned())
}

#[command]
pub fn extension_exists(slug: String, app_handle: AppHandle) -> Result<bool, String> {
    let manager = ExtensionManager::load(&app_handle)?;
    Ok(manager.extension_exists(&slug))
}

#[command]
pub fn update_extension(
    slug: String,
    version: Option<String>,
    repository: Option<String>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut manager = ExtensionManager::load(&app_handle)?;
    manager.update_extension(&slug, version, repository, &app_handle)
}

#[command]
pub fn list_extensions(app_handle: AppHandle) -> Result<Vec<Extension>, String> {
    let manager = ExtensionManager::load(&app_handle)?;
    Ok(manager.list_extensions().clone())
}

#[command]
pub fn refresh_extension_metadata(slug: String, app_handle: AppHandle) -> Result<(), String> {
    let mut manager = ExtensionManager::load(&app_handle)?;
    manager.refresh_extension_metadata(&slug, &app_handle)
}

#[command]
pub fn refresh_all_metadata(app_handle: AppHandle) -> Result<(), String> {
    let mut manager = ExtensionManager::load(&app_handle)?;
    manager.refresh_all_metadata(&app_handle)
}

#[command]
pub fn get_extensions_by_capability(
    capability: String,
    app_handle: AppHandle,
) -> Result<Vec<Extension>, String> {
    let manager = ExtensionManager::load(&app_handle)?;
    Ok(manager
        .get_extensions_by_capability(&capability)
        .into_iter()
        .cloned()
        .collect())
}

#[command]
pub fn get_extensions_by_language(
    language_key: String,
    app_handle: AppHandle,
) -> Result<Vec<Extension>, String> {
    let manager = ExtensionManager::load(&app_handle)?;
    Ok(manager
        .get_extensions_by_language(&language_key)
        .into_iter()
        .cloned()
        .collect())
}

#[command]
pub fn validate_extension_structure(slug: String, app_handle: AppHandle) -> Result<bool, String> {
    let manager = ExtensionManager::load(&app_handle)?;
    manager.validate_extension_structure(&slug, &app_handle)
}
