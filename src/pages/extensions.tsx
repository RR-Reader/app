import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router";
import { useFetchSourceList } from "@/hooks/use-source-list";
import { open } from "@tauri-apps/plugin-shell";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import React from "react";
import { cn } from "@/lib/utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { RefreshCcw, Download, Trash2, CheckCircle } from "lucide-react";
import { extensionsAPI } from "@/api/extensions";
import { Extension } from "@/types/extensions";

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
  const [installedExtensions, setInstalledExtensions] = React.useState<
    Extension[]
  >([]);
  const [isLoadingInstalled, setIsLoadingInstalled] = React.useState(false);
  const plugin = searchParams.get("plugin");

  const {
    data: sourceExtensions,
    isRefetching,
    refetch,
  } = useFetchSourceList();

  const loadInstalledExtensions = React.useCallback(async () => {
    try {
      setIsLoadingInstalled(true);
      const manager = await extensionsAPI.loadExtensions();
      setInstalledExtensions(manager.extensions);
    } catch (error) {
      console.error("Failed to load installed extensions:", error);
      setInstalledExtensions([]);
    } finally {
      setIsLoadingInstalled(false);
    }
  }, []);

  React.useEffect(() => {
    loadInstalledExtensions();
  }, [loadInstalledExtensions]);

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

      await extensionsAPI.addExtension(
        ext.name,
        slug,
        ext.version,
        ext.download_url,
      );

      await loadInstalledExtensions();

      console.log(`Successfully installed ${ext.name}`);
    } catch (error) {
      console.error(`Failed to install ${ext.name}:`, error);
    }
  };

  const handleRemoveExtension = async (ext: ExtensionWithStatus) => {
    if (!ext.slug) return;

    try {
      await extensionsAPI.removeExtension(ext.slug);

      await loadInstalledExtensions();

      console.log(`Successfully removed ${ext.name}`);
    } catch (error) {
      console.error(`Failed to remove ${ext.name}:`, error);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetch(), loadInstalledExtensions()]);
  };

  return {
    data: filteredData,
    handleSetParams,
    isRefetching: isRefetching || isLoadingInstalled,
    refetch: handleRefresh,
    searchBy,
    setSearchBy,
    handleInstallExtension,
    handleRemoveExtension,
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
  } = useExtensionParams();

  return (
    <>
      <header className="flex items-center justify-between p-4">
        <h1 className="text-3xl font-semibold">Extensions</h1>
        <div className="inline-flex gap-4">
          <Select value={searchBy} onValueChange={setSearchBy}>
            <SelectTrigger className="w-48">
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
            className="max-w-72"
            placeholder="Search extensions..."
            onChange={(e) => handleSetParams(e.target.value)}
          />
          <Button size="icon" onClick={() => refetch()}>
            <RefreshCcw
              className={cn(
                "transition-all duration-200",
                isRefetching && "animate-spin",
              )}
            />
          </Button>
        </div>
      </header>
      <div className="grid w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((entry) => (
          <Card
            key={entry.id}
            className={cn(
              "relative",
              entry.isInstalled &&
                "bg-green-50/50 ring-2 ring-green-500/20 dark:bg-green-950/20",
            )}
          >
            {entry.isInstalled && (
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Installed
                </Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <img
                    src={entry.icon_url || undefined}
                    className="size-6"
                    alt={`${entry.name} icon`}
                  />
                  <CardTitle className="text-base">{entry.name}</CardTitle>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline">{entry.version}</Badge>
                  {entry.isInstalled &&
                    entry.installedVersion !== entry.version && (
                      <Badge variant="secondary" className="text-xs">
                        v{entry.installedVersion}
                      </Badge>
                    )}
                </div>
              </div>
              <CardDescription className="text-sm">
                {entry.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="-mt-4 mb-2 flex flex-wrap items-center gap-1">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="text-muted-foreground grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                <p>
                  <strong className="text-black dark:text-white">
                    Language:
                  </strong>{" "}
                  {entry.language}
                </p>
                <p>
                  <strong className="text-black dark:text-white">
                    Content Rating:
                  </strong>{" "}
                  {entry.content_rating}
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-row justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => open(entry.source_url)}
              >
                <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
              </Button>

              <div className="flex gap-2">
                {entry.isInstalled ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveExtension(entry)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleInstallExtension(entry)}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Install
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">
            No extensions found matching your search.
          </p>
        </div>
      )}
    </>
  );
}
