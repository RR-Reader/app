import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryAPI } from "@/types/api/library";
import { slugify } from "@/lib/utils";
import { Library, MangaEntry, Category } from "@/types";

const QUERY_KEYS = {
  LIBRARY: ["library"] as const,
  CATEGORY: (slug: string) => ["category", slug] as const,
  ALL_CATEGORIES: ["categories"] as const,
  MANGA_IN_LIBRARY: (identifier: string, source: string) =>
    ["manga-in-library", identifier, source] as const,
  MANGA_CATEGORY: (identifier: string, source: string) =>
    ["manga-category", identifier, source] as const,
} as const;

// Query Hooks
const useLoadLibrary = () =>
  useQuery({
    queryKey: QUERY_KEYS.LIBRARY,
    queryFn: libraryAPI.loadLibrary,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

const useFetchCategory = (slug: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.CATEGORY(slug!),
    queryFn: () => libraryAPI.getCategoryBySlug(slug!),
    enabled: !!slug,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

const useIsMangaInLibrary = (mangaEntry: MangaEntry) =>
  useQuery({
    queryKey: QUERY_KEYS.MANGA_IN_LIBRARY(
      mangaEntry.identifier,
      mangaEntry.source,
    ),
    queryFn: () => libraryAPI.isMangaInLibrary(mangaEntry),
    enabled: !!(mangaEntry.identifier && mangaEntry.source),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

const useFindMangaCategory = (mangaEntry: MangaEntry) =>
  useQuery({
    queryKey: QUERY_KEYS.MANGA_CATEGORY(
      mangaEntry.identifier,
      mangaEntry.source,
    ),
    queryFn: () => libraryAPI.findCategoryForManga(mangaEntry),
    enabled: !!(mangaEntry.identifier && mangaEntry.source),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

// Mutation Hooks
const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create_category"],
    mutationFn: ({ categoryName }: { categoryName: string }) =>
      libraryAPI.createCategory(categoryName),
    onMutate: async ({ categoryName }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LIBRARY });

      // Snapshot the previous value
      const previousLibrary = queryClient.getQueryData<Library>(
        QUERY_KEYS.LIBRARY,
      );

      // Optimistically update
      queryClient.setQueryData<Library>(QUERY_KEYS.LIBRARY, (old) => {
        if (!old) return old;

        const newCategory: Category = {
          title: categoryName,
          slug: slugify(categoryName),
          entries: [],
          sort_by: "title",
          sort_order: "asc",
        };

        return {
          ...old,
          categories: [...old.categories, newCategory],
        };
      });

      return { previousLibrary };
    },
    onError: (error: Error, _, context) => {
      console.error("Create category error:", error.message);

      // Rollback on error
      if (context?.previousLibrary) {
        queryClient.setQueryData(QUERY_KEYS.LIBRARY, context.previousLibrary);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
    },
  });
};

const useEditCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["edit_category"],
    mutationFn: ({ name, newName }: { name: string; newName: string }) =>
      libraryAPI.editCategory(name, newName),
    onMutate: async ({ name, newName }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LIBRARY });

      const previousLibrary = queryClient.getQueryData<Library>(
        QUERY_KEYS.LIBRARY,
      );

      const oldSlug = slugify(name);
      const newSlug = slugify(newName);

      // Update library data
      queryClient.setQueryData<Library>(QUERY_KEYS.LIBRARY, (old) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.map((cat) =>
            cat.title === name
              ? { ...cat, title: newName, slug: newSlug }
              : cat,
          ),
        };
      });

      // Update category cache if it exists
      const categoryData = queryClient.getQueryData(
        QUERY_KEYS.CATEGORY(oldSlug),
      );
      if (categoryData) {
        queryClient.setQueryData(QUERY_KEYS.CATEGORY(newSlug), {
          ...categoryData,
          title: newName,
          slug: newSlug,
        });
        queryClient.removeQueries({ queryKey: QUERY_KEYS.CATEGORY(oldSlug) });
      }

      return { previousLibrary, oldSlug, newSlug };
    },
    onError: (error: Error, _, context) => {
      console.error("Edit category error:", error.message);

      if (context?.previousLibrary) {
        queryClient.setQueryData(QUERY_KEYS.LIBRARY, context.previousLibrary);
      }

      // Restore old category cache if needed
      if (context?.oldSlug && context?.newSlug) {
        const newCategoryData = queryClient.getQueryData(
          QUERY_KEYS.CATEGORY(context.newSlug),
        );
        if (newCategoryData) {
          queryClient.setQueryData(
            QUERY_KEYS.CATEGORY(context.oldSlug),
            newCategoryData,
          );
          queryClient.removeQueries({
            queryKey: QUERY_KEYS.CATEGORY(context.newSlug),
          });
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
    },
  });
};

const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete_category"],
    mutationFn: (name: string) => libraryAPI.deleteCategory(name),
    onMutate: async (deletedName) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LIBRARY });

      const previousLibrary = queryClient.getQueryData<Library>(
        QUERY_KEYS.LIBRARY,
      );

      // Optimistically remove category
      queryClient.setQueryData<Library>(QUERY_KEYS.LIBRARY, (old) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.filter((cat) => cat.title !== deletedName),
        };
      });

      return { previousLibrary };
    },
    onSuccess: (_, deletedName) => {
      // Remove category-specific queries
      queryClient.removeQueries({
        queryKey: ["category"],
        predicate: (query) => {
          const [, slug] = query.queryKey;
          return slug === slugify(deletedName);
        },
      });
    },
    onError: (error: Error, _, context) => {
      console.error("Delete category error:", error.message);

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

      const previousLibrary = queryClient.getQueryData<Library>(
        QUERY_KEYS.LIBRARY,
      );

      // Optimistically add manga to category and "All Titles"
      queryClient.setQueryData<Library>(QUERY_KEYS.LIBRARY, (old) => {
        if (!old) return old;

        return {
          ...old,
          categories: old.categories.map((cat) => {
            if (cat.title === categoryName || cat.title === "All Titles") {
              const entryExists = cat.entries.some(
                (entry) =>
                  entry.identifier === mangaEntry.identifier &&
                  entry.source === mangaEntry.source,
              );

              if (!entryExists) {
                const newEntries = [...cat.entries, mangaEntry];
                // Sort by title for "All Titles" category
                if (cat.title === "All Titles") {
                  newEntries.sort((a, b) => a.title.localeCompare(b.title));
                }
                return { ...cat, entries: newEntries };
              }
            }
            return cat;
          }),
        };
      });

      // Update manga-in-library cache
      queryClient.setQueryData(
        QUERY_KEYS.MANGA_IN_LIBRARY(mangaEntry.identifier, mangaEntry.source),
        true,
      );

      // Update manga category cache
      queryClient.setQueryData(
        QUERY_KEYS.MANGA_CATEGORY(mangaEntry.identifier, mangaEntry.source),
        categoryName,
      );

      return { previousLibrary };
    },
    onError: (error: Error, variables, context) => {
      console.error("Add manga to category error:", error.message);

      if (context?.previousLibrary) {
        queryClient.setQueryData(QUERY_KEYS.LIBRARY, context.previousLibrary);
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MANGA_IN_LIBRARY(
          variables.mangaEntry.identifier,
          variables.mangaEntry.source,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MANGA_CATEGORY(
          variables.mangaEntry.identifier,
          variables.mangaEntry.source,
        ),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
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
    onSuccess: (_, { mangaId, mangaSource }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
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

// Compound Hooks
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
  // Query hooks
  useLoadLibrary,
  useFetchCategory,
  useIsMangaInLibrary,
  useFindMangaCategory,

  // Mutation hooks
  useCreateCategory,
  useEditCategory,
  useDeleteCategory,
  useAddMangaToCategory,
  useRemoveMangaFromCategory,

  // Compound hooks
  useLibraryWithCategories,
  useMangaInLibrary,
  useCategoryWithManga,

  // Constants
  QUERY_KEYS,
} as const;

export default LIBRARY_HOOKS;
