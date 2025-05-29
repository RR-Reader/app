import { ExplorePage, Manga, Library, MangaEntry, Category } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

const QUERIES = {
  useLoadLibrary: () =>
    useQuery({
      queryKey: ["library"],
      queryFn: () => invoke<Library>("load_library"),
      refetchOnWindowFocus: true,
      retry: 1,
    }),

  useQueryMangaInfo: (
    identifier: string | undefined,
    source: string | undefined,
  ) =>
    useQuery<Manga>({
      queryKey: ["manga_details", source, identifier],
      queryFn: () =>
        invoke<Manga>("load_source_chapter", { identifier, source }),
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: !!identifier && !!source,
    }),

  useFetchExplorePages: (source: string | undefined) =>
    useQuery({
      queryKey: ["explore", source],
      queryFn: () =>
        invoke<ExplorePage[]>("load_explore_pages", {
          source,
        }),
      enabled: !!source,
    }),

  useFetchCategory: (slug: string | undefined) =>
    useQuery({
      queryKey: ["category", slug],
      queryFn: () => invoke<Category>("get_category_by_slug", { slug }),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 1,
    }),
};

const MUTATIONS = {
  useCreateCategory: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ["create_category"],
      mutationFn: ({ categoryName }: { categoryName: string }) =>
        invoke("create_category", { categoryName: categoryName }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["library"] });
      },
    });
  },

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

  useDeleteCategory: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ["delete_category"],
      mutationFn: (name: string) => invoke("delete_category", { name }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["library"] });
      },
    });
  },

  useEditCategory: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ["edit_category"],
      mutationFn: ({ name, newName }: { name: string; newName: string }) =>
        invoke("edit_category", { name, newName }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["library"] });
      },
    });
  },
};

export { QUERIES, MUTATIONS };
