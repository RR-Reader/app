import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryAPI } from "@/types/api/library";
import { slugify } from "@/lib/utils";
import { Library } from "@/types";

const QUERY_KEYS = {
  LIBRARY: ["library"] as const,
  CATEGORY: (slug: string) => ["category", slug] as const,
  ALL_CATEGORIES: ["categories"] as const,
};

const useLoadLibrary = () =>
  useQuery({
    queryKey: QUERY_KEYS.LIBRARY,
    queryFn: libraryAPI.loadLibrary,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

const useFetchCategory = (slug: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.CATEGORY(slug!),
    queryFn: () => libraryAPI.getCategoryBySlug(slug!),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  });

const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete_category"],
    mutationFn: (name: string) => libraryAPI.deleteCategory(name),
    onSuccess: (_, deletedName) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });

      queryClient.removeQueries({
        queryKey: ["category"],
        predicate: (query) => {
          const [, slug] = query.queryKey;
          return slug === slugify(deletedName);
        },
      });
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

      queryClient.setQueryData<Library>(QUERY_KEYS.LIBRARY, (old) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.map((cat) =>
            cat.title === name
              ? { ...cat, title: newName, slug: slugify(newName) }
              : cat,
          ),
        };
      });

      return { previousLibrary };
    },
    onError: (error: Error, _, context) => {
      console.error("Edit category error:", error.message);

      if (context?.previousLibrary) {
        queryClient.setQueryData(QUERY_KEYS.LIBRARY, context.previousLibrary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
    },
  });
};

const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create_category"],
    mutationFn: ({ categoryName }: { categoryName: string }) =>
      libraryAPI.createCategory(categoryName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
    },
    onError: (error: Error) => {
      console.error("Create category error:", error.message);
    },
  });
};

const useAddMangaToCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["save_manga"],
    mutationFn: ({
      categoryName,
      mangaEntry,
    }: {
      categoryName: string;
      mangaEntry: { identifier: string; title: string; source: string };
    }) => libraryAPI.addMangaToCategory(categoryName, mangaEntry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY });
    },
    onError: (error: Error) => {
      console.error("Add manga to category error:", error.message);
    },
  });
};

function useLibraryWithCategories() {
  const library = useLoadLibrary();
  const categories = library.data?.categories || [];

  return {
    ...library,
    categories,
    categoryCount: categories.length,
    hasCategories: categories.length > 0,
  };
}

const LIBRARY_HOOKS = {
  // Queries
  useLoadLibrary,
  useFetchCategory,

  // Mutations
  useCreateCategory,
  useEditCategory,
  useDeleteCategory,

  // Compound hooks
  useLibraryWithCategories,

  // Constants
  QUERY_KEYS,
};

export default LIBRARY_HOOKS;
