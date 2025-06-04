import type { Chapter, Manga, MangaEntry, Option } from "@/types";
import { invoke } from "@tauri-apps/api/core";

interface MangaAPI {
  searchManga: (query: string) => Promise<MangaEntry[]>;
  getMangaDetails: (
    id: Option<string>,
    source: Option<string>,
  ) => Promise<Manga>;
  getMangaChapter: (
    id: Option<string>,
    source: Option<string>,
  ) => Promise<Chapter[]>;
}

class MangaAPIImpl implements MangaAPI {
  async searchManga(query: string): Promise<MangaEntry[]> {
    if (!query || typeof query !== "string") {
      throw new Error("Query must be a non-empty string");
    }
    try {
      return await invoke<MangaEntry[]>("search_manga", { query });
    } catch (error) {
      throw new Error(`Failed to search manga: ${error}`);
    }
  }
  async getMangaDetails(
    id: Option<string>,
    source: Option<string>,
  ): Promise<Manga> {
    if (!id || typeof id !== "string") {
      throw new Error("Manga ID must be a non-empty string");
    }

    if (source && typeof source !== "string") {
      throw new Error("Source must be a string if provided");
    }

    try {
      console.log("Fetching manga details for ID:", id, "Source:", source);
      const result = invoke<Manga>("load_manga_source", { id, source });
      console.log("Manga details fetched successfully:", result);
      return result;
    } catch (error) {
      throw new Error(`Failed to get manga details for ID '${id}': ${error}`);
    }
  }
  async getMangaChapter(
    id: Option<string>,
    source: Option<string>,
  ): Promise<Chapter[]> {
    if (!id || typeof id !== "string") {
      throw new Error("Manga ID must be a non-empty string");
    }

    if (source && typeof source !== "string") {
      throw new Error("Source must be a string if provided");
    }

    try {
      return await invoke<Chapter[]>("get_manga_chapters", { id, source });
    } catch (error) {
      throw new Error(`Failed to get chapters for manga ID '${id}': ${error}`);
    }
  }
}

const mangaAPI: MangaAPI = new MangaAPIImpl();
export { type MangaAPI, MangaAPIImpl, mangaAPI };
