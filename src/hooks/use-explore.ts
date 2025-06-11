import { ExplorePage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useCoverStyle } from "@/hooks/settings/use-cover-style";

const useFetchExplorePages = (source: string | undefined) => {
  const { grid } = useCoverStyle();

  const limit = grid - 1;

  return useQuery({
    queryKey: ["explore", source, limit],
    queryFn: () =>
      invoke<ExplorePage[]>("load_explore_pages", {
        source,
        limit,
      }),
    enabled: !!source,
  });
};

const EXPLORE = {
  useFetchExplorePages,
};

export default EXPLORE;
