interface MangaEntry {
  id: string;
  source: string;
  title: string;
  cover_url?: string;
}

interface Manga {
  id: string;
  title: string;
  artists: string[];
  authors: string[];
  genres: string[];
  description: string;
  cover_url: string;
  chapters: ChapterEntry[];
}

interface ChapterEntry {
  id: string;
  title: string;
  released_since: string;
}

interface Chapter {
  url: string;
  pages: string[];
}

export type { Chapter, ChapterEntry, Manga, MangaEntry };
