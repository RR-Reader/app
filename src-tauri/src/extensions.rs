use crate::settings::get_extensions_manifest_path;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use std::{
    fs::{self, File},
    io::Read,
    path::Path,
};
use tauri::{command, AppHandle};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SourceEntry {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub icon_url: String,
    pub source_url: String,
    pub download_url: String,
    pub tags: Vec<String>,
    pub language: String,
    pub content_rating: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct SourceList(pub Vec<SourceEntry>);

impl SourceList {
    pub fn new() -> Self {
        SourceList(Vec::new())
    }

    pub fn add_source(&mut self, source: SourceEntry) {
        self.0.push(source);
    }

    pub fn remove_source(&mut self, id: &str) {
        self.0.retain(|source| source.id != id);
    }

    pub fn find_source_by_id(&self, id: &str) -> Option<&SourceEntry> {
        self.0.iter().find(|source| source.id == id)
    }
}

#[command]
pub fn load_manifest(app_handle: AppHandle) -> Result<SourceList, String> {
    let path = get_extensions_manifest_path(&app_handle)?;

    if !Path::new(&path).exists() {
        let empty_list = SourceList::new();
        let json = to_string_pretty(&empty_list).map_err(|e| e.to_string())?;
        fs::write(&path, json).map_err(|e| format!("Failed to write empty manifest: {}", e))?;
        return Ok(empty_list);
    }

    let mut file = File::open(&path).map_err(|e| format!("Failed to open manifest: {}", e))?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read manifest: {}", e))?;

    let list: SourceList =
        from_str(&contents).map_err(|e| format!("Failed to parse manifest: {}", e))?;
    Ok(list)
}

#[command]
pub fn save_manifest(app_handle: AppHandle, list: SourceList) -> Result<(), String> {
    let path = get_extensions_manifest_path(&app_handle)?;
    let json =
        to_string_pretty(&list).map_err(|e| format!("Failed to serialize manifest: {}", e))?;
    fs::write(&path, json).map_err(|e| format!("Failed to write manifest: {}", e))?;
    Ok(())
}
