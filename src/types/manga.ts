type MangaEntry = {
  id: string;
  source: string;
  title: string;
  cover_url?: string;
};

type Manga = {
  id: string;
  title: string;
  artists: string[];
  authors: string[];
  genres: string[];
  description: string;
  cover_url: string;
  chapters: ChapterEntry[];
};

type ChapterEntry = {
  id: string;
  title: string;
  released_since: string;
};

type Chapter = {
  url: string;
  pages: string[];
};

export type { Chapter, ChapterEntry, Manga, MangaEntry };
