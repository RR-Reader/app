import type { MangaEntry } from "./manga";

type ExploreSection = {
  title: string;
  entries: MangaEntry[];
};

type ExplorePage = {
  source: string;
  sections: ExploreSection[];
};

export type { ExplorePage, ExploreSection };
