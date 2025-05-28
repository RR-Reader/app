use crate::structs::Library;
use serde_json::{from_str, to_string_pretty};
use std::{collections::HashMap, fs, path::Path};

const LIBRARY_PATH: &'static str = "library.json";

pub fn get_library() -> Result<Library, String> {
    if !Path::new(LIBRARY_PATH).exists() {
        create_default_library()?;
    }

    let raw_library =
        fs::read_to_string(LIBRARY_PATH).map_err(|e| format!("Failed to read library: {}", e))?;

    let library = from_str::<Library>(&raw_library)
        .map_err(|e| format!("Failed to parse library JSON: {}", e))?;

    Ok(library)
}

fn create_default_library() -> Result<(), String> {
    let default_library: Library = Library {
        categories: HashMap::new(),
    };

    let json = to_string_pretty(&default_library)
        .map_err(|e| format!("Failed to serialize default library: {}", e))?;

    fs::write(LIBRARY_PATH, json).map_err(|e| format!("Failed to write library file: {}", e))
}

fn save_library(library: &Library) -> Result<(), String> {
    let json =
        to_string_pretty(library).map_err(|e| format!("Failed to serialize library: {}", e))?;

    fs::write(LIBRARY_PATH, json).map_err(|e| format!("Failed to write library file: {}", e))
}

fn create_new_category(library: &mut Library, category_name: &str) -> Result<(), String> {
    if library.categories.contains_key(category_name) {
        return Err(format!("Category '{}' already exists", category_name));
    }

    library
        .categories
        .insert(category_name.to_string(), Vec::new());
    save_library(library)
}
