use crate::extensions::providers::batoto::config::BASE_URL;
use crate::structs::MangaEntry;
use reqwest::blocking::Client;
use scraper::{Html, Selector};
use std::error::Error;

#[allow(unused)]
pub fn get_popular_releases(client: &Client) -> Result<Vec<MangaEntry>, Box<dyn Error>> {
    let items: Vec<MangaEntry> = vec![];

    let res: String = client.get(BASE_URL).send()?.text()?;

    let document: Html = Html::parse_document(&res);

    let base_tag: Selector = Selector::parse("div.home-popular").unwrap();
    let item_selector: Selector = Selector::parse("div.col.item").unwrap();
    let img_selector: Selector = Selector::parse("a.item-cover > img").unwrap();
    let title_selector: Selector = Selector::parse("a.item-title").unwrap();

    if let Some(base) = document.select(&base_tag).next() {
      for item in base.select(&item_selector) {
        
      }
    }

    Ok(items)
}

#[allow(unused)]
pub fn get_latest_releases(_client: &Client) -> Result<Vec<MangaEntry>, Box<dyn Error>> {
    let items: Vec<MangaEntry> = vec![];

    Ok(items)
}
