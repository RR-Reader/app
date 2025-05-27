type MangaEntry = {
  source: string;
  identifier: string;
  title: string;
  cover_url?: string;
};

type Manga = {
  identifier: string;
  title: string;
  artists: string[];
  authors: string[];
  genres: string[];
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

type ExploreSection = {
  title: string;
  entries: MangaEntry[];
};

type ExplorePage = {
  source: string;
  sections: ExploreSection[];
};

export type {
  MangaEntry,
  Manga,
  ChapterEntry,
  Chapter,
  ExplorePage,
  ExploreSection,
};
