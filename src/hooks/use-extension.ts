import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { extensionsAPI, ExtensionHelpers } from "@/api/extensions";
import { Extension, ExtensionManager } from "@/types/extensions";

const QUERY_KEYS = {
  EXTENSIONS: ["extensions"] as const,
  EXTENSION: (slug: string) => ["extension", slug] as const,
  EXTENSION_EXISTS: (slug: string) => ["extension-exists", slug] as const,
  EXTENSIONS_BY_CAPABILITY: (capability: string) =>
    ["extensions-by-capability", capability] as const,
  EXTENSIONS_BY_LANGUAGE: (languageKey: string) =>
    ["extensions-by-language", languageKey] as const,
  EXTENSION_VALIDATION: (slug: string) =>
    ["extension-validation", slug] as const,
} as const;

const useLoadExtensions = () =>
  useQuery({
    queryKey: QUERY_KEYS.EXTENSIONS,
    queryFn: extensionsAPI.loadExtensions,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

const useFetchExtension = (slug: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.EXTENSION(slug!),
    queryFn: () => extensionsAPI.getExtension(slug!),
    enabled: !!slug,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 1000 * 60 * 2,
  });

const useExtensionExists = (slug: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.EXTENSION_EXISTS(slug!),
    queryFn: () => extensionsAPI.extensionExists(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
  });

const useExtensionsByCapability = (capability: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.EXTENSIONS_BY_CAPABILITY(capability!),
    queryFn: () => extensionsAPI.getExtensionsByCapability(capability!),
    enabled: !!capability,
    staleTime: 1000 * 60 * 2,
  });

const useExtensionsByLanguage = (languageKey: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.EXTENSIONS_BY_LANGUAGE(languageKey!),
    queryFn: () => extensionsAPI.getExtensionsByLanguage(languageKey!),
    enabled: !!languageKey,
    staleTime: 1000 * 60 * 2,
  });

const useValidateExtension = (slug: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.EXTENSION_VALIDATION(slug!),
    queryFn: () => extensionsAPI.validateExtensionStructure(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
  });

const useAddExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add_extension"],
    mutationFn: ({
      name,
      slug,
      version,
      repository,
    }: {
      name: string;
      slug: string;
      version: string;
      repository: string;
    }) => extensionsAPI.addExtension(name, slug, version, repository),
    onMutate: async ({ name, slug, version, repository }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.EXTENSIONS });

      const previousExtensions = queryClient.getQueryData<ExtensionManager>(
        QUERY_KEYS.EXTENSIONS,
      );

      queryClient.setQueryData<ExtensionManager>(
        QUERY_KEYS.EXTENSIONS,
        (old) => {
          if (!old) return old;

          const newExtension: Extension = {
            name,
            slug,
            version,
            repository,
            metadata: undefined,
          };

          return {
            ...old,
            extensions: [...old.extensions, newExtension],
          };
        },
      );

      queryClient.setQueryData(QUERY_KEYS.EXTENSION_EXISTS(slug), true);

      return { previousExtensions };
    },
    onError: (error: Error, variables, context) => {
      console.error("Add extension error:", error.message);
      if (context?.previousExtensions) {
        queryClient.setQueryData(
          QUERY_KEYS.EXTENSIONS,
          context.previousExtensions,
        );
      }
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXTENSION_EXISTS(variables.slug),
      });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXTENSIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXTENSION(variables.slug),
      });
    },
  });
};

const useRemoveExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["remove_extension"],
    mutationFn: ({ slug }: { slug: string }) =>
      extensionsAPI.removeExtension(slug),
    onMutate: async ({ slug }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.EXTENSIONS });

      const previousExtensions = queryClient.getQueryData<ExtensionManager>(
        QUERY_KEYS.EXTENSIONS,
      );

      queryClient.setQueryData<ExtensionManager>(
        QUERY_KEYS.EXTENSIONS,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            extensions: old.extensions.filter((ext) => ext.slug !== slug),
          };
        },
      );

      queryClient.setQueryData(QUERY_KEYS.EXTENSION_EXISTS(slug), false);

      return { previousExtensions };
    },
    onError: (error: Error, variables, context) => {
      console.error("Remove extension error:", error.message);
      if (context?.previousExtensions) {
        queryClient.setQueryData(
          QUERY_KEYS.EXTENSIONS,
          context.previousExtensions,
        );
      }
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXTENSION_EXISTS(variables.slug),
      });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXTENSIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXTENSION(variables.slug),
      });
    },
  });
};

const useUpdateExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update_extension"],
    mutationFn: ({
      slug,
      version,
      repository,
    }: {
      slug: string;
      version?: string;
      repository?: string;
    }) => extensionsAPI.updateExtension(slug, version, repository),
    onMutate: async ({ slug, version, repository }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.EXTENSIONS });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.EXTENSION(slug) });

      const previousExtensions = queryClient.getQueryData<ExtensionManager>(
        QUERY_KEYS.EXTENSIONS,
      );
      const previousExtension = queryClient.getQueryData<Extension>(
        QUERY_KEYS.EXTENSION(slug),
      );

      if (previousExtensions) {
        queryClient.setQueryData<ExtensionManager>(
          QUERY_KEYS.EXTENSIONS,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              extensions: old.extensions.map((ext) =>
                ext.slug === slug
                  ? {
                      ...ext,
                      ...(version && { version }),
                      ...(repository && { repository }),
                    }
                  : ext,
              ),
            };
          },
        );
      }

      if (previousExtension) {
        queryClient.setQueryData<Extension>(
          QUERY_KEYS.EXTENSION(slug),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              ...(version && { version }),
              ...(repository && { repository }),
            };
          },
        );
      }

      return { previousExtensions, previousExtension };
    },
    onError: (error: Error, variables, context) => {
      console.error("Update extension error:", error.message);
      if (context?.previousExtensions) {
        queryClient.setQueryData(
          QUERY_KEYS.EXTENSIONS,
          context.previousExtensions,
        );
      }
      if (context?.previousExtension) {
        queryClient.setQueryData(
          QUERY_KEYS.EXTENSION(variables.slug),
          context.previousExtension,
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXTENSIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXTENSION(variables.slug),
      });
    },
  });
};

const useRefreshExtensionMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["refresh_extension_metadata"],
    mutationFn: ({ slug }: { slug: string }) =>
      extensionsAPI.refreshExtensionMetadata(slug),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXTENSIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXTENSION(slug),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXTENSION_VALIDATION(slug),
      });
    },
    onError: (error: Error) => {
      console.error("Refresh extension metadata error:", error.message);
    },
  });
};

const useRefreshAllMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["refresh_all_metadata"],
    mutationFn: () => extensionsAPI.refreshAllMetadata(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXTENSIONS });
      queryClient.invalidateQueries({ queryKey: ["extension"] });
      queryClient.invalidateQueries({ queryKey: ["extension-validation"] });
    },
    onError: (error: Error) => {
      console.error("Refresh all metadata error:", error.message);
    },
  });
};

const useExtensionsWithHelpers = () => {
  const extensionsQuery = useLoadExtensions();
  const extensions = extensionsQuery.data?.extensions || [];

  return {
    ...extensionsQuery,
    extensions,
    extensionCount: extensions.length,
    hasExtensions: extensions.length > 0,
    getExtensionBySlug: (slug: string) =>
      extensions.find((ext) => ext.slug === slug),
    getExtensionsByCapability: (capability: string) =>
      ExtensionHelpers.filterExtensionsByCapabilities(extensions, [capability]),
    getExtensionsByLanguage: (languageKey: string) =>
      ExtensionHelpers.filterExtensionsByLanguages(extensions, [languageKey]),
    sortExtensions: (
      sortBy?: "name" | "version" | "author",
      order?: "asc" | "desc",
    ) => ExtensionHelpers.sortExtensions(extensions, sortBy, order),
    validExtensions: extensions.filter(ExtensionHelpers.isValidExtension),
  };
};

const useExtensionWithHelpers = (slug: string | undefined) => {
  const extensionQuery = useFetchExtension(slug);
  const extension = extensionQuery.data;

  return {
    ...extensionQuery,
    extension,
    hasCapability: (capability: string) =>
      extension ? ExtensionHelpers.hasCapability(extension, capability) : false,
    supportsLanguage: (languageKey: string) =>
      extension
        ? ExtensionHelpers.supportsLanguage(extension, languageKey)
        : false,
    getSetting: (key: string) =>
      extension ? ExtensionHelpers.getSetting(extension, key) : undefined,
    getCapabilities: () =>
      extension ? ExtensionHelpers.getCapabilities(extension) : [],
    isValid: extension ? ExtensionHelpers.isValidExtension(extension) : false,
  };
};

const useExtensionValidation = (slug: string | undefined) => {
  const validationQuery = useValidateExtension(slug);
  const existsQuery = useExtensionExists(slug);

  return {
    isValid: validationQuery.data ?? false,
    exists: existsQuery.data ?? false,
    isLoading: validationQuery.isLoading || existsQuery.isLoading,
    isError: validationQuery.isError || existsQuery.isError,
    error: validationQuery.error || existsQuery.error,
  };
};

const EXTENSIONS_HOOKS = {
  useLoadExtensions,
  useFetchExtension,
  useExtensionExists,
  useExtensionsByCapability,
  useExtensionsByLanguage,
  useValidateExtension,

  useAddExtension,
  useRemoveExtension,
  useUpdateExtension,
  useRefreshExtensionMetadata,
  useRefreshAllMetadata,

  useExtensionsWithHelpers,
  useExtensionWithHelpers,
  useExtensionValidation,

  QUERY_KEYS,
} as const;

export default EXTENSIONS_HOOKS;
