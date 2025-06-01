type Option<T> = T | undefined;

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

interface ExploreSection {
  title: string;
  entries: MangaEntry[];
}

interface ExplorePage {
  source: string;
  sections: ExploreSection[];
}

interface Library {
  categories: Category[];
}

interface Category {
  title: string;
  slug: string;
  entries: MangaEntry[];
  sort_by: string;
  sort_order: "asc" | "desc";
}

export type {
  MangaEntry,
  Manga,
  ChapterEntry,
  Chapter,
  ExplorePage,
  ExploreSection,
  Library,
  Category,
  Option,
};
