import { ExplorePage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useGrid } from "./settings/use-grid";

const useFetchExplorePages = (source: string | undefined) => {
  const { grid } = useGrid();

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
