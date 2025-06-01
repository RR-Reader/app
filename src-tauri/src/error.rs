use serde::{Deserialize, Serialize};
use reqwest::Error as ReqwestError;
use thiserror::Error;

#[derive(Debug, Error, Serialize, Deserialize)]
pub enum SourceError {
    #[error("Network error: {0}")]
    Network(String),
    #[error("Parsing error: {0}")]
    Parsing(String),
    #[error("API error from source: {0}")]
    ApiError(String),
    #[error("Manga or Chapter not found: {0}")]
    NotFound(String),
    #[error("Source configuration error: {0}")]
    Configuration(String),
    #[error("An unexpected error occurred: {0}")]
    Unexpected(String),
}

impl From<ReqwestError> for SourceError {
    fn from(error: ReqwestError) -> Self {
        SourceError::Network(error.to_string())
    }
}