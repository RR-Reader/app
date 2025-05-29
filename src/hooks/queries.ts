import { ExplorePage, Manga, MangaEntry } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

const MUTATIONS = {
  useAddMangaToCategory: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ["save_manga"],
      mutationFn: ({
        categoryName,
        mangaEntry,
      }: {
        categoryName: string;
        mangaEntry: MangaEntry;
      }) =>
        invoke("save_manga", {
          categoryName,
          mangaEntry,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["library"] });
      },
    });
  },
};

export { MUTATIONS };
