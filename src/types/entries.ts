type MangaEntry = {
  title: string;
  cover_url?: string;
  url: string;
};

type Manga = {
  title: string;
  author: string;
  description: string;
  cover_url: string;
  chapters: ChapterEntry[];
};

type ChapterEntry = {
  title: string;
  url: string;
  released_since: string;
};

type Chapter = {
  url: string;
  pages: string[];
};

export type { MangaEntry, Manga, ChapterEntry, Chapter };
