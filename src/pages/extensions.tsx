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
import { RefreshCcw } from "lucide-react";

type SearchOptions =
  | "name"
  | "description"
  | "tags"
  | "language"
  | (string & {});

export default function Extensions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchBy, setSearchBy] = React.useState<SearchOptions>("name");

  const { data, isRefetching, refetch } = useFetchSourceList();

  const plugin = searchParams.get("plugin");

  const handleSetParams = (query: string) => {
    setSearchParams({ plugin: query });
  };

  if (!data) {
    return;
  }

  const filteredExtensions = data.filter((ext) => {
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

  return (
    <>
      <header className="flex items-center justify-between p-4">
        <h1 className="text-3xl font-semibold">Extensions</h1>
        <div className="inline-flex gap-4">
          <Select value={searchBy} onValueChange={setSearchBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="test" />
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
            placeholder="Search"
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
        {filteredExtensions.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <img src={entry.icon_url} className="size-6" />
                  <CardTitle>{entry.name}</CardTitle>
                </div>
                <Badge variant="outline">{entry.version}</Badge>
              </div>
              <CardDescription>{entry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="-mt-4 mb-2 flex flex-wrap items-center gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>

              <div className="text-muted-foreground grid grid-cols-1 text-xs sm:grid-cols-2">
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
            <CardFooter className="flex flex-row justify-end gap-4">
              <Button variant="outline" onClick={() => open(entry.source_url)}>
                <FontAwesomeIcon icon={faGithub} />
              </Button>

              <Button onClick={() => open(entry.download_url)}>Install</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
