import type { MangaEntry } from "./manga";

type Category = {
  title: string;
  slug: string;
  entries: MangaEntry[];
  sort_by: string;
  sort_order: "asc" | "desc";
};

type Library = {
  categories: Category[];
}


export type { Category, Library };