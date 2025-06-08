import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router";
import { useFetchSourceList } from "@/hooks/use-source-list";
import { FilterSheet } from "@/components/extensions/filter-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import React from "react";
import { cn } from "@/lib/utils";

import { Filter, RefreshCcw } from "lucide-react";
import EXTENSIONS_HOOKS from "@/hooks/use-extension";
import { ExtensionCard } from "@/components/extensions/extension-card";
import { toast } from "sonner";

type SearchOptions =
  | "name"
  | "description"
  | "tags"
  | "language"
  | (string & {});

interface ExtensionWithStatus {
  id: string;
  name: string;
  description: string;
  version: string;
  language: string;
  content_rating: string;
  tags: string[];
  icon_url: string;
  source_url: string;
  download_url: string;
  isInstalled: boolean;
  installedVersion?: string;
  slug?: string;
}

function useExtensionParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchBy, setSearchBy] = React.useState<SearchOptions>("name");
  const plugin = searchParams.get("plugin");

  const {
    extensions: installedExtensions,
    isLoading: isLoadingInstalled,
    refetch: refetchInstalled,
  } = EXTENSIONS_HOOKS.useExtensionsWithHelpers();

  const {
    data: sourceExtensions,
    isRefetching: isRefetchingSource,
    refetch: refetchSource,
  } = useFetchSourceList();

  const addExtensionMutation = EXTENSIONS_HOOKS.useAddExtension();
  const removeExtensionMutation = EXTENSIONS_HOOKS.useRemoveExtension();

  const handleSetParams = (query: string) => {
    setSearchParams({ plugin: query });
  };

  const data: ExtensionWithStatus[] = React.useMemo(() => {
    if (!sourceExtensions) return [];

    return sourceExtensions.map((ext) => {
      const installedExt = installedExtensions.find(
        (installed) =>
          installed.name === ext.name ||
          installed.repository === ext.source_url ||
          installed.repository === ext.download_url,
      );

      return {
        ...ext,
        isInstalled: !!installedExt,
        installedVersion: installedExt?.version,
        slug: installedExt?.slug,
      };
    });
  }, [sourceExtensions, installedExtensions]);

  const filteredData = data.filter((ext) => {
    if (!plugin?.trim()) return true;

    const queryWords = plugin.trim().toLowerCase().split(/\s+/);

    const targetText = (() => {
      switch (searchBy) {
        case "name":
          return ext.name;
        case "description":
          return ext.description;
        case "tags":
          return ext.tags?.join(" ") ?? "";
        case "language":
          return ext.language ?? "";
        default:
          return "";
      }
    })().toLowerCase();

    const targetWords = targetText.split(/\s+/);

    return queryWords.every((q) => targetWords.some((w) => w.startsWith(q)));
  });

  const handleInstallExtension = async (ext: ExtensionWithStatus) => {
    try {
      const slug = ext.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      await addExtensionMutation.mutateAsync({
        name: ext.name,
        slug,
        version: ext.version,
        repository: ext.download_url,
      });

      console.log(`Successfully installed ${ext.name}`);
    } catch (error) {
      console.error(`Failed to install ${ext.name}:`, error);
    }
  };

  const handleRemoveExtension = async (ext: ExtensionWithStatus) => {
    if (!ext.slug) return;

    try {
      await removeExtensionMutation.mutateAsync({
        slug: ext.slug,
      });

      console.log(`Successfully removed ${ext.name}`);
    } catch (error) {
      console.error(`Failed to remove ${ext.name}:`, error);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetchSource(), refetchInstalled()]);
  };

  const isRefetching = isRefetchingSource || isLoadingInstalled;
  const isMutating =
    addExtensionMutation.isPending || removeExtensionMutation.isPending;

  return {
    data: filteredData,
    handleSetParams,
    isRefetching: isRefetching || isMutating,
    refetch: handleRefresh,
    searchBy,
    setSearchBy,
    handleInstallExtension,
    handleRemoveExtension,

    isInstalling: addExtensionMutation.isPending,
    isRemoving: removeExtensionMutation.isPending,
    installError: addExtensionMutation.error,
    removeError: removeExtensionMutation.error,
  };
}

export default function Extensions() {
  const {
    data,
    searchBy,
    setSearchBy,
    handleSetParams,
    isRefetching,
    refetch,
    handleInstallExtension,
    handleRemoveExtension,
    isInstalling,
    isRemoving,
    installError,
    removeError,
  } = useExtensionParams();

  const action = {
    install: handleInstallExtension,
    remove: handleRemoveExtension,
  };

  console.log("Extensions data:", data);

  React.useEffect(() => {
    if (installError) {
      toast.error("Failed to install extension: " + installError.message);
    }
  }, [installError]);

  React.useEffect(() => {
    if (removeError) {
      toast.error("Failed to remove extension: " + removeError.message);
    }
  }, [removeError]);

  return (
    <>
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold">Extensions</h1>
          {(isInstalling || isRemoving) && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              {isInstalling && "Installing..."}
              {isRemoving && "Removing..."}
            </div>
          )}
        </div>
        <div className="inline-flex gap-4">
          <Select value={searchBy} onValueChange={setSearchBy}>
            <SelectTrigger className="hidden w-full max-w-48 sm:flex">
              <SelectValue placeholder="Search by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="tags">Tags</SelectItem>
              <SelectItem value="language">Language</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="hidden max-w-72 sm:flex"
            placeholder="Search extensions..."
            onChange={(e) => handleSetParams(e.target.value)}
          />
          <Button size="icon" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCcw
              className={cn(
                "transition-all duration-200",
                isRefetching && "animate-spin",
              )}
            />
          </Button>
          <FilterSheet
            query={handleSetParams}
            setFilter={setSearchBy}
            filter={searchBy}
          >
            <Button size="icon" className="flex sm:hidden" variant="outline">
              <Filter />
            </Button>
          </FilterSheet>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((entry) => (
          <ExtensionCard key={entry.id} entry={entry} actions={action} />
        ))}
      </div>

      {data.length === 0 && !isRefetching && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">
            No extensions found matching your search.
          </p>
        </div>
      )}

      {data.length === 0 && isRefetching && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <RefreshCcw className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading extensions...</p>
        </div>
      )}
    </>
  );
}
