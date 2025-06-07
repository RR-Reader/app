use crate::settings::get_extensions_path;
use git2::Repository;
use std::path::{Path, PathBuf};
use tauri::AppHandle;

pub fn slugify(title: &str) -> String {
    title
        .to_lowercase()
        .replace(' ', "-")
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-')
        .collect()
}

pub fn clone_repo(repo_url: &str, target_dir: &Path, app_handle: &AppHandle) -> Result<(), String> {
    let base_path: PathBuf = get_extensions_path(app_handle)
        .map_err(|e| format!("Failed to get extensions path: {e}"))?;

    let target_path: PathBuf = base_path.join(target_dir);

    if target_path.exists() {
        return Err(format!("Source '{}' already exists.", target_dir.display()));
    }

    println!("Cloning source {repo_url} into {}", target_path.display());
    Repository::clone(repo_url, target_path)
        .map_err(|e| format!("Failed to clone '{repo_url}': {e}"))?;
    Ok(())
}
