interface MangaEntry {
  source: string;
  id: string;
  title: string;
  cover_url: string;
}

interface Category {
  title: string;
  slug: string;
  entries: MangaEntry[];
  sort_by: string;
  sort_order: "asc" | "desc";
}

interface CategoryManifest {
  title: string;
  slug: string;
  sort_by: string;
  sort_order: "asc" | "desc";
}

interface LibraryManifest {
  categories: CategoryManifest[];
}

type Library = {
  categories: Category[];
};

export type {
  MangaEntry,
  Category,
  CategoryManifest,
  LibraryManifest,
  Library,
};
