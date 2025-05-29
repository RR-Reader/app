import { Chapter, Manga, MangaEntry } from "..";

export interface MangaAPI {
  searchManga: (query: string) => Promise<MangaEntry[]>;
  getMangaDetails: (id: string) => Promise<Manga>;
  getMangaChapters: (id: string) => Promise<Chapter[]>;
  downloadChapter: (mangaId: string, chapterId: string) => Promise<void>;
}
