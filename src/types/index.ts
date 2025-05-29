interface MangaEntry {
  source: string;
  identifier: string;
  title: string;
  cover_url?: string;
}

interface Manga {
  identifier: string;
  title: string;
  artists: string[];
  authors: string[];
  genres: string[];
  description: string;
  cover_url: string;
  chapters: ChapterEntry[];
}

interface ChapterEntry {
  title: string;
  url: string;
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
};
