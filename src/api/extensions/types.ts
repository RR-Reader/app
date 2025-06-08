interface SourceResponse {
  id: string;
  homepage(): Promise<string[]>;
  search(query: string): Promise<string[]>;
  getMangaDetails(mangaId: string): Promise<MangaDetails>;
}

interface SearchParams {
  tags?: string[];
  status?: Status;
}

enum Status {
  Completed = "Completed",
  Ongoing = "Ongoing",
  Hiatus = "Hiatus",
  Cancelled = "Cancelled",
}

interface MangaDetails {
  id: string;
  source: string;
  title: string;
  description: string;
  artists: string[];
  authors: string[];
  tags: string[];
  status: Status;
  coverImage: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
  number: number;
  releaseDate: string;
  pages: string[];
  read: boolean;
}
