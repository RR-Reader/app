import { Manga } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

const useQueryMangaInfo = (
  identifier: string | undefined,
  source: string | undefined,
) =>
  useQuery<Manga>({
    queryKey: ["manga_details", source, identifier],
    queryFn: () => invoke<Manga>("load_source_chapter", { identifier, source }),
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!identifier && !!source,
  });

const MANGA_HOOKS = {
  useQueryMangaInfo,
};

export default MANGA_HOOKS;
