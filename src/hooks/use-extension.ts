import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExtensionsService } from "@/api/extensions";
import type { ExtensionManifest, LoadedExtension } from "@/api/extensions";
import type { SourceProvider } from "@torigen/mounter";

export const extensionsKeys = {
  all: ["extensions"] as const,
  extensions: () => [...extensionsKeys.all, "loaded"] as const,
  manifest: () => [...extensionsKeys.all, "manifest"] as const,
  extension: (extensionId: string) =>
    [...extensionsKeys.all, "extension", extensionId] as const,
  enabled: () => [...extensionsKeys.all, "enabled"] as const,
} as const;

export function useExtensions() {
  return useQuery({
    queryKey: extensionsKeys.extensions(),
    queryFn: ExtensionsService.loadExtensions,
    staleTime: 10 * 60 * 1000, // Extensions don't change often
    gcTime: 30 * 60 * 1000,
  });
}

export function useExtensionsManifest() {
  return useQuery({
    queryKey: extensionsKeys.manifest(),
    queryFn: ExtensionsService.loadManifest,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useExtension(extensionId: string, enabled = true) {
  return useQuery({
    queryKey: extensionsKeys.extension(extensionId),
    queryFn: () => ExtensionsService.getLoadedExtension(extensionId) || null,
    enabled: enabled && !!extensionId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useEnabledExtensions() {
  return useQuery({
    queryKey: extensionsKeys.enabled(),
    queryFn: ExtensionsService.getEnabledExtensions,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useMultipleExtensions(extensionIds: string[]) {
  return useQuery({
    queryKey: [...extensionsKeys.all, "multiple", extensionIds.sort()],
    queryFn: async () => {
      const extensions = extensionIds
        .map((id) => ExtensionsService.getLoadedExtension(id))
        .filter((ext): ext is LoadedExtension => ext !== undefined);
      return extensions;
    },
    enabled: extensionIds.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useReloadExtensions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ExtensionsService.loadExtensions,
    onSuccess: (loadedExtensions) => {
      queryClient.setQueryData(extensionsKeys.extensions(), loadedExtensions);

      loadedExtensions.forEach((extension) => {
        queryClient.setQueryData(
          extensionsKeys.extension(extension.info.id),
          extension,
        );
      });

      const enabledExtensions = loadedExtensions.filter(
        (ext) => ext.info.enabled,
      );
      queryClient.setQueryData(extensionsKeys.enabled(), enabledExtensions);
      queryClient.invalidateQueries({ queryKey: extensionsKeys.manifest() });
    },
  });
}

export function useToggleExtension() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      extensionId,
      enabled,
    }: {
      extensionId: string;
      enabled: boolean;
    }) => ExtensionsService.toggleExtension(extensionId, enabled),
    onSuccess: (_, { extensionId, enabled }) => {
      queryClient.setQueryData<LoadedExtension>(
        extensionsKeys.extension(extensionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            info: { ...old.info, enabled },
          };
        },
      );

      queryClient.setQueryData<LoadedExtension[]>(
        extensionsKeys.extensions(),
        (old) => {
          if (!old) return old;
          return old.map((ext) =>
            ext.info.id === extensionId
              ? { ...ext, info: { ...ext.info, enabled } }
              : ext,
          );
        },
      );

      queryClient.setQueryData<ExtensionManifest>(
        extensionsKeys.manifest(),
        (old) => {
          if (!old) return old;
          return {
            extensions: old.extensions.map((ext) =>
              ext.id === extensionId ? { ...ext, enabled } : ext,
            ),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: extensionsKeys.enabled() });
    },
  });
}

export function useCreateExtensionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (extensionId: string) =>
      ExtensionsService.createExtensionTemplate(extensionId),
    onSuccess: () => {
      // After creating a template, we might want to reload extensions
      // to discover the new template (though it won't be functional yet)
      queryClient.invalidateQueries({ queryKey: extensionsKeys.all });
    },
  });
}

export function useSourceProvider(extensionId: string): SourceProvider | null {
  const { data: extension } = useExtension(extensionId);
  return extension?.source || null;
}

export function useEnabledSourceProviders(): SourceProvider[] {
  const { data: enabledExtensions } = useEnabledExtensions();
  return enabledExtensions?.map((ext) => ext.source) || [];
}

export function useSearchExtensions(searchTerm: string) {
  const { data: extensions } = useExtensions();

  const results =
    extensions?.filter(
      (extension) =>
        extension.info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extension.info.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extension.info.baseUrl.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return {
    results,
    count: results.length,
    isSearching: searchTerm.length > 0,
  };
}

export function useFilterExtensions(
  filter: "all" | "enabled" | "disabled" = "all",
) {
  const { data: extensions } = useExtensions();

  const results =
    extensions?.filter((extension) => {
      switch (filter) {
        case "enabled":
          return extension.info.enabled;
        case "disabled":
          return !extension.info.enabled;
        default:
          return true;
      }
    }) || [];

  return {
    results,
    count: results.length,
    enabledCount: extensions?.filter((ext) => ext.info.enabled).length || 0,
    disabledCount: extensions?.filter((ext) => !ext.info.enabled).length || 0,
    totalCount: extensions?.length || 0,
  };
}

export function useFindExtension(
  predicate: (extension: LoadedExtension) => boolean,
) {
  const { data: extensions } = useExtensions();
  const extension = extensions?.find(predicate);

  return {
    extension,
    isFound: !!extension,
  };
}

export function useExtensionExists(extensionId: string) {
  const { data: extensions } = useExtensions();
  const exists =
    extensions?.some((ext) => ext.info.id === extensionId) || false;

  return {
    exists,
    extension: extensions?.find((ext) => ext.info.id === extensionId),
  };
}

export function useBulkToggleExtensions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      extensionIds,
      enabled,
    }: {
      extensionIds: string[];
      enabled: boolean;
    }) => {
      await Promise.all(
        extensionIds.map((id) =>
          ExtensionsService.toggleExtension(id, enabled),
        ),
      );
    },
    onSuccess: (_, { extensionIds, enabled }) => {
      extensionIds.forEach((extensionId) => {
        queryClient.setQueryData<LoadedExtension>(
          extensionsKeys.extension(extensionId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              info: { ...old.info, enabled },
            };
          },
        );
      });

      queryClient.invalidateQueries({ queryKey: extensionsKeys.extensions() });
      queryClient.invalidateQueries({ queryKey: extensionsKeys.enabled() });
      queryClient.invalidateQueries({ queryKey: extensionsKeys.manifest() });
    },
  });
}

export function useExtensionMethods() {
  const reloadExtensions = useReloadExtensions();
  const toggleExtension = useToggleExtension();
  const createTemplate = useCreateExtensionTemplate();
  const bulkToggle = useBulkToggleExtensions();

  return {
    reloadExtensions: reloadExtensions.mutateAsync,
    toggleExtension: toggleExtension.mutateAsync,
    createTemplate: createTemplate.mutateAsync,
    bulkToggleExtensions: bulkToggle.mutateAsync,

    isReloading: reloadExtensions.isPending,
    isToggling: toggleExtension.isPending,
    isCreatingTemplate: createTemplate.isPending,
    isBulkToggling: bulkToggle.isPending,

    reloadError: reloadExtensions.error,
    toggleError: toggleExtension.error,
    createTemplateError: createTemplate.error,
    bulkToggleError: bulkToggle.error,
  };
}

export function useExtensionStats() {
  const { data: extensions } = useExtensions();

  const stats = {
    total: extensions?.length || 0,
    enabled: extensions?.filter((ext) => ext.info.enabled).length || 0,
    disabled: extensions?.filter((ext) => !ext.info.enabled).length || 0,
    withHomepage:
      extensions?.filter((ext) => ext.source.capabilities.supportsHomepage)
        .length || 0,
    withSearch:
      extensions?.filter((ext) => ext.source.capabilities.supportsSearch)
        .length || 0,
    withViewMore:
      extensions?.filter((ext) => ext.source.capabilities.supportsViewMore)
        .length || 0,
  };

  return stats;
}
