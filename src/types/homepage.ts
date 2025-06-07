import type { MangaEntry } from "./manga";

interface ExploreSection {
  title: string;
  entries: MangaEntry[];
}

interface ExplorePage  {
  source: string;
  sections: ExploreSection[];
};

export type { ExplorePage, ExploreSection };
