import { Manga } from "@/types";
import { mangaAPI } from "@/api/manga";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEYS = {
  MANGA_DETAILS: ["manga_details"] as const,
  MANGA: (id: string, source: string) => ["manga_details", source, id] as const,
};

const useQueryMangaInfo = (
  id: string | undefined,
  source: string | undefined,
) =>
  useQuery<Manga>({
    queryKey: QUERY_KEYS.MANGA(id!, source!),
    queryFn: () => mangaAPI.getMangaDetails(id, source),
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!id && !!source,
  });

const MANGA_HOOKS = {
  useQueryMangaInfo,
};

export default MANGA_HOOKS;
