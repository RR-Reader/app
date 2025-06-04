import type { MangaEntry } from "./manga";

type CategoryMeta = {
  title: string;
  slug: string;
  sort_by: string;
  sort_order: "asc" | "desc";
};

type Category = {
  title: string;
  slug: string;
  entries: MangaEntry[];
  sort_by: string;
  sort_order: "asc" | "desc";
};

type Library = {
  categories: CategoryMeta[];
};

export type { Category, CategoryMeta, Library };
