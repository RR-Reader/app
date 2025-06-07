import type { MangaEntry } from "./manga";

interface CategoryMeta {
  title: string;
  slug: string;
  sort_by: string;
  sort_order: "asc" | "desc";
};

interface Category {
  title: string;
  slug: string;
  entries: MangaEntry[];
  sort_by: string;
  sort_order: "asc" | "desc";
};

interface Library {
  categories: CategoryMeta[];
};

export type { Category, CategoryMeta, Library };
