import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryAPI } from "@/api/library";
import { slugify } from "@/lib/utils";
import { Library, MangaEntry, Category, CategoryMeta } from "@/types";

const QUERY_KEYS = {
  LIBRARY: ["library"] as const,
  CATEGORY: (slug: string) => ["category", slug] as const,
  MANGA_IN_LIBRARY: (id: string, source: string) =>
    ["manga-in-library", id, source] as const,
  MANGA_CATEGORY: (id: string, source: string) =>
    ["manga-category", id, source] as const,
} as const;

const useLoadLibrary = () =>
  useQuery({
    queryKey: QUERY_KEYS.LIBRARY,
    queryFn: libraryAPI.loadLibrary,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

const useFetchCategory = (slug: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.CATEGORY(slug!),
    queryFn: () => libraryAPI.getCategoryBySlug(slug!),
    enabled: !!slug,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 1000 * 60 * 2,
  });

const useIsMangaInLibrary = (mangaEntry: MangaEntry) =>
  useQuery({
    queryKey: QUERY_KEYS.MANGA_IN_LIBRARY(mangaEntry.id, mangaEntry.source),
    queryFn: () => libraryAPI.isMangaInLibrary(mangaEntry),
    enabled: !!(mangaEntry.id && mangaEntry.source),
    staleTime: 1000 * 60 * 2,
  });

const useFindMangaCategory = (mangaEntry: MangaEntry) =>
  useQuery({
    queryKey: QUERY_KEYS.MANGA_CATEGORY(mangaEntry.id, mangaEntry.source),
    queryFn: () => libraryAPI.findCategoryForManga(mangaEntry),
    enabled: !!(mangaEntry.id && mangaEntry.source),
    staleTime: 1000 * 60 * 2,
  });

const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create_category"],
    mutationFn: ({ categoryName }: { categoryName: string }) =>
      libraryAPI.createCategory(categoryName),
    onMutate: async ({ categoryName }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LIBRARY });

      const previousLibrary = queryClient.getQueryData<Library>(
        QUERY_KEYS.LIBRARY,
      );

      queryClient.setQueryData<Library>(QUERY_KEYS.LIBRARY, (old) => {
        if (!old) return old;

        const newCategoryMeta: CategoryMeta = {
          title: categoryName,
          slug: slugify(categoryName),
          sort_by: "title",
          sort_order: "asc",
        };

        return {
          ...old,
          categories: [...old.categories, newCategoryMeta],
        };
      });

      return { previousLibrary };
    },
    onError: (error: Error, _, context) => {
      console.error("Create category error:", error.message);
      if (context?.previousLibrary) {
        queryClient.setQueryData(QUERY_KEYS.LIBRARY, context.previousLibrary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
    },
  });
};

const useAddMangaToCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add_manga_to_category"],
    mutationFn: ({
      categoryName,
      mangaEntry,
    }: {
      categoryName: string;
      mangaEntry: MangaEntry;
    }) => libraryAPI.addMangaToCategory(categoryName, mangaEntry),
    onMutate: async ({ categoryName, mangaEntry }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LIBRARY });

      const categorySlug = slugify(categoryName);
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CATEGORY(categorySlug),
      });

      const allTitlesSlug = slugify("All Titles");
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CATEGORY(allTitlesSlug),
      });

      const previousCategory = queryClient.getQueryData<Category>(
        QUERY_KEYS.CATEGORY(categorySlug),
      );
      const previousAllTitles = queryClient.getQueryData<Category>(
        QUERY_KEYS.CATEGORY(allTitlesSlug),
      );

      if (previousCategory) {
        queryClient.setQueryData<Category>(
          QUERY_KEYS.CATEGORY(categorySlug),
          (old) => {
            if (!old) return old;
            const entryExists = old.entries.some(
              (entry) =>
                entry.id === mangaEntry.id &&
                entry.source === mangaEntry.source,
            );
            if (!entryExists) {
              return { ...old, entries: [...old.entries, mangaEntry] };
            }
            return old;
          },
        );
      }

      if (categoryName !== "All Titles" && previousAllTitles) {
        queryClient.setQueryData<Category>(
          QUERY_KEYS.CATEGORY(allTitlesSlug),
          (old) => {
            if (!old) return old;
            const entryExists = old.entries.some(
              (entry) =>
                entry.id === mangaEntry.id &&
                entry.source === mangaEntry.source,
            );
            if (!entryExists) {
              const newEntries = [...old.entries, mangaEntry];
              newEntries.sort((a, b) => a.title.localeCompare(b.title));
              return { ...old, entries: newEntries };
            }
            return old;
          },
        );
      }

      queryClient.setQueryData(
        QUERY_KEYS.MANGA_IN_LIBRARY(mangaEntry.id, mangaEntry.source),
        true,
      );
      queryClient.setQueryData(
        QUERY_KEYS.MANGA_CATEGORY(mangaEntry.id, mangaEntry.source),
        categoryName,
      );

      return {
        previousCategory,
        previousAllTitles,
        categorySlug,
        allTitlesSlug,
      };
    },
    onError: (error: Error, variables, context) => {
      console.error("Add manga to category error:", error.message);

      if (context?.previousCategory) {
        queryClient.setQueryData(
          QUERY_KEYS.CATEGORY(context.categorySlug),
          context.previousCategory,
        );
      }
      if (context?.previousAllTitles) {
        queryClient.setQueryData(
          QUERY_KEYS.CATEGORY(context.allTitlesSlug),
          context.previousAllTitles,
        );
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MANGA_IN_LIBRARY(
          variables.mangaEntry.id,
          variables.mangaEntry.source,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MANGA_CATEGORY(
          variables.mangaEntry.id,
          variables.mangaEntry.source,
        ),
      });
    },
    onSettled: (_, __, variables) => {
      const categorySlug = slugify(variables.categoryName);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CATEGORY(categorySlug),
      });

      if (variables.categoryName !== "All Titles") {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CATEGORY(slugify("All Titles")),
        });
      }
    },
  });
};

const useRemoveMangaFromCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["remove_manga_from_category"],
    mutationFn: ({
      categoryName,
      mangaId,
      mangaSource,
    }: {
      categoryName: string;
      mangaId: string;
      mangaSource: string;
    }) =>
      libraryAPI.removeMangaFromCategory(categoryName, mangaId, mangaSource),
    onSuccess: (_, { mangaId, mangaSource, categoryName }) => {
      const categorySlug = slugify(categoryName);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CATEGORY(categorySlug),
      });

      if (categoryName !== "All Titles") {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CATEGORY(slugify("All Titles")),
        });
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MANGA_IN_LIBRARY(mangaId, mangaSource),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MANGA_CATEGORY(mangaId, mangaSource),
      });
    },
    onError: (error: Error) => {
      console.error("Remove manga from category error:", error.message);
    },
  });
};

const useLibraryWithCategories = () => {
  const library = useLoadLibrary();
  const categories = library.data?.categories || [];

  return {
    ...library,
    categories,
    categoryCount: categories.length,
    hasCategories: categories.length > 0,
    getCategoryByName: (name: string) =>
      categories.find((cat) => cat.title === name),
    getCategoryBySlug: (slug: string) =>
      categories.find((cat) => cat.slug === slug),
  };
};

const useMangaInLibrary = (mangaEntry: MangaEntry) => {
  const mangaInLibraryQuery = useIsMangaInLibrary(mangaEntry);
  const mangaCategoryQuery = useFindMangaCategory(mangaEntry);

  return {
    isInLibrary: mangaInLibraryQuery.data ?? false,
    category: mangaCategoryQuery.data ?? null,
    isLoading: mangaInLibraryQuery.isLoading || mangaCategoryQuery.isLoading,
    isError: mangaInLibraryQuery.isError || mangaCategoryQuery.isError,
    error: mangaInLibraryQuery.error || mangaCategoryQuery.error,
  };
};

const useCategoryWithManga = (slug: string | undefined) => {
  const categoryQuery = useFetchCategory(slug);

  return {
    ...categoryQuery,
    mangaCount: categoryQuery.data?.entries.length ?? 0,
    hasManga: (categoryQuery.data?.entries.length ?? 0) > 0,
    isEmpty: (categoryQuery.data?.entries.length ?? 0) === 0,
  };
};

const LIBRARY_HOOKS = {
  useLoadLibrary,
  useFetchCategory,
  useIsMangaInLibrary,
  useFindMangaCategory,

  useCreateCategory,
  useAddMangaToCategory,
  useRemoveMangaFromCategory,

  useLibraryWithCategories,
  useMangaInLibrary,
  useCategoryWithManga,

  QUERY_KEYS,
} as const;

export default LIBRARY_HOOKS;
