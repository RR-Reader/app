import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LibraryService } from "@/api/library";
import type {
  Library,
  Category,
  MangaEntry,
  LibraryManifest,
} from "@/api/library/type";

export const libraryKeys = {
  all: ["library"] as const,
  library: () => [...libraryKeys.all, "full"] as const,
  manifest: () => [...libraryKeys.all, "manifest"] as const,
  categories: () => [...libraryKeys.all, "categories"] as const,
  category: (slug: string) => [...libraryKeys.categories(), slug] as const,
} as const;

export function useLibrary() {
  return useQuery({
    queryKey: libraryKeys.library(),
    queryFn: LibraryService.loadLibrary,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useLibraryManifest() {
  return useQuery({
    queryKey: libraryKeys.manifest(),
    queryFn: LibraryService.loadManifest,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCategory(slug: string, enabled = true) {
  return useQuery({
    queryKey: libraryKeys.category(slug),
    queryFn: () => LibraryService.loadCategory(slug),
    enabled: enabled && !!slug,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
  });
}

export function useCategories(slugs: string[]) {
  return useQuery({
    queryKey: [...libraryKeys.categories(), "multiple", slugs.sort()],
    queryFn: async () => {
      const categories = await Promise.all(
        slugs.map((slug) => LibraryService.loadCategory(slug)),
      );
      return categories.filter((cat): cat is Category => cat !== null);
    },
    enabled: slugs.length > 0,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, slug }: { title: string; slug: string }) =>
      LibraryService.createCategory(title, slug),
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Library>(libraryKeys.library(), (old) => {
        if (!old) return { categories: [newCategory] };
        return {
          categories: [...old.categories, newCategory],
        };
      });

      queryClient.setQueryData<LibraryManifest>(
        libraryKeys.manifest(),
        (old) => {
          if (!old)
            return {
              categories: [
                {
                  title: newCategory.title,
                  slug: newCategory.slug,
                  sort_by: newCategory.sort_by,
                  sort_order: newCategory.sort_order,
                },
              ],
            };
          return {
            categories: [
              ...old.categories,
              {
                title: newCategory.title,
                slug: newCategory.slug,
                sort_by: newCategory.sort_by,
                sort_order: newCategory.sort_order,
              },
            ],
          };
        },
      );

      queryClient.setQueryData(
        libraryKeys.category(newCategory.slug),
        newCategory,
      );
    },
  });
}

export function useSaveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: Category) => LibraryService.saveCategory(category),
    onSuccess: (_, category) => {
      queryClient.setQueryData(libraryKeys.category(category.slug), category);

      queryClient.setQueryData<Library>(libraryKeys.library(), (old) => {
        if (!old) return { categories: [category] };

        const existingIndex = old.categories.findIndex(
          (cat) => cat.slug === category.slug,
        );
        const newCategories = [...old.categories];

        if (existingIndex >= 0) {
          newCategories[existingIndex] = category;
        } else {
          newCategories.push(category);
        }

        return { categories: newCategories };
      });

      queryClient.setQueryData<LibraryManifest>(
        libraryKeys.manifest(),
        (old) => {
          if (!old)
            return {
              categories: [
                {
                  title: category.title,
                  slug: category.slug,
                  sort_by: category.sort_by,
                  sort_order: category.sort_order,
                },
              ],
            };

          const existingIndex = old.categories.findIndex(
            (cat) => cat.slug === category.slug,
          );
          const newCategories = [...old.categories];
          const categoryManifest = {
            title: category.title,
            slug: category.slug,
            sort_by: category.sort_by,
            sort_order: category.sort_order,
          };

          if (existingIndex >= 0) {
            newCategories[existingIndex] = categoryManifest;
          } else {
            newCategories.push(categoryManifest);
          }

          return { categories: newCategories };
        },
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => LibraryService.deleteCategory(slug),
    onSuccess: (_, slug) => {
      queryClient.setQueryData<Library>(libraryKeys.library(), (old) => {
        if (!old) return old;
        return {
          categories: old.categories.filter((cat) => cat.slug !== slug),
        };
      });

      queryClient.setQueryData<LibraryManifest>(
        libraryKeys.manifest(),
        (old) => {
          if (!old) return old;
          return {
            categories: old.categories.filter((cat) => cat.slug !== slug),
          };
        },
      );

      queryClient.removeQueries({ queryKey: libraryKeys.category(slug) });
    },
  });
}

export function useAddMangaToCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categorySlug,
      manga,
    }: {
      categorySlug: string;
      manga: MangaEntry;
    }) => LibraryService.addMangaToCategory(categorySlug, manga),
    onSuccess: (_, { categorySlug, manga }) => {
      queryClient.setQueryData<Category>(
        libraryKeys.category(categorySlug),
        (old) => {
          if (!old) return old;

          const existingIndex = old.entries.findIndex(
            (entry) => entry.source === manga.source && entry.id === manga.id,
          );

          const newEntries = [...old.entries];
          if (existingIndex >= 0) {
            newEntries[existingIndex] = manga;
          } else {
            newEntries.push(manga);
          }

          return { ...old, entries: newEntries };
        },
      );

      queryClient.setQueryData<Library>(libraryKeys.library(), (old) => {
        if (!old) return old;

        return {
          categories: old.categories.map((cat) => {
            if (cat.slug !== categorySlug) return cat;

            const existingIndex = cat.entries.findIndex(
              (entry) => entry.source === manga.source && entry.id === manga.id,
            );

            const newEntries = [...cat.entries];
            if (existingIndex >= 0) {
              newEntries[existingIndex] = manga;
            } else {
              newEntries.push(manga);
            }

            return { ...cat, entries: newEntries };
          }),
        };
      });
    },
  });
}

export function useRemoveMangaFromCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categorySlug,
      source,
      id,
    }: {
      categorySlug: string;
      source: string;
      id: string;
    }) => LibraryService.removeMangaFromCategory(categorySlug, source, id),
    onSuccess: (_, { categorySlug, source, id }) => {
      queryClient.setQueryData<Category>(
        libraryKeys.category(categorySlug),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            entries: old.entries.filter(
              (entry) => !(entry.source === source && entry.id === id),
            ),
          };
        },
      );

      queryClient.setQueryData<Library>(libraryKeys.library(), (old) => {
        if (!old) return old;

        return {
          categories: old.categories.map((cat) => {
            if (cat.slug !== categorySlug) return cat;
            return {
              ...cat,
              entries: cat.entries.filter(
                (entry) => !(entry.source === source && entry.id === id),
              ),
            };
          }),
        };
      });
    },
  });
}

export function useRefreshLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
  });
}

export function useFindManga(source: string, id: string) {
  const { data: library } = useLibrary();

  const manga = library?.categories
    .flatMap((cat) => cat.entries)
    .find((entry) => entry.source === source && entry.id === id);

  const categoriesContaining =
    library?.categories
      .filter((cat) =>
        cat.entries.some((entry) => entry.source === source && entry.id === id),
      )
      .map((cat) => ({ title: cat.title, slug: cat.slug })) || [];

  return {
    manga,
    categoriesContaining,
    isFound: !!manga,
  };
}

export function useSearchManga(searchTerm: string) {
  const { data: library } = useLibrary();

  const results =
    library?.categories.flatMap((category) =>
      category.entries
        .filter(
          (manga) =>
            manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manga.source.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((manga) => ({
          ...manga,
          categoryTitle: category.title,
          categorySlug: category.slug,
        })),
    ) || [];

  return {
    results,
    count: results.length,
    isSearching: searchTerm.length > 0,
  };
}

export function useLibraryMethods() {
  const createCategory = useCreateCategory();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();
  const addManga = useAddMangaToCategory();
  const removeManga = useRemoveMangaFromCategory();
  const refreshLibrary = useRefreshLibrary();

  return {
    createCategory: createCategory.mutateAsync,
    saveCategory: saveCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
    addManga: addManga.mutateAsync,
    removeManga: removeManga.mutateAsync,
    refreshLibrary: refreshLibrary.mutateAsync,

    isCreating: createCategory.isPending,
    isSaving: saveCategory.isPending,
    isDeleting: deleteCategory.isPending,
    isAddingManga: addManga.isPending,
    isRemovingManga: removeManga.isPending,
    isRefreshing: refreshLibrary.isPending,

    createError: createCategory.error,
    saveError: saveCategory.error,
    deleteError: deleteCategory.error,
    addMangaError: addManga.error,
    removeMangaError: removeManga.error,
    refreshError: refreshLibrary.error,
  };
}
