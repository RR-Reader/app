import { ExplorePage, Manga } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

const useGetExplorePage = (source: string | undefined) =>
  useQuery({
    queryKey: ["explore", source],
    queryFn: () =>
      invoke<ExplorePage[]>("load_explore_pages", {
        source,
      }),
    enabled: !!source,
  });

const useGetMangaDetails = (
  identifier: string | undefined,
  source: string | undefined,
) => {
  return useQuery<Manga>({
    queryKey: ["manga_details", source, identifier],
    queryFn: () => invoke<Manga>("load_source_chapter", { identifier, source }),
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!identifier && !!source,
  });
};

export { useGetMangaDetails, useGetExplorePage };
