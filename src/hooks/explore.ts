import { ExplorePage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

const useFetchExplorePages = (source: string | undefined) =>
  useQuery({
    queryKey: ["explore", source],
    queryFn: () =>
      invoke<ExplorePage[]>("load_explore_pages", {
        source,
      }),
    enabled: !!source,
  });

const EXPLORE = {
  useFetchExplorePages,
};

export default EXPLORE;
