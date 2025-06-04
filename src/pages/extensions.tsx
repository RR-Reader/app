import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { useFetchSourceList } from "@/hooks/use-source-list";
import { open } from "@tauri-apps/plugin-shell";

import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";

import type { SourceEntry } from "@/types";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const randomObject: SourceEntry[] = [
  {
    id: "1",
    name: "Extension One",
    description: "This is the first extension.",
    version: "1.0",
    icon_url: "",
    source_url: "",
    download_url: "",
    tags: ["tag1", "tag2"],
    language: "English",
    content_rating: "Everyone",
  },
  {
    id: "2",
    name: "Extension Two",
    description: "This is the second extension.",
    version: "1.0",
    icon_url: "",
    source_url: "",
    download_url: "",
    tags: ["tag3", "tag4"],
    language: "Spanish",
    content_rating: "Everyone",
  },
  {
    id: "3",
    name: "Extension Three",
    description: "This is the third extension.",
    version: "1.0",
    icon_url: "",
    source_url: "",
    download_url: "",
    tags: ["tag5", "tag6"],
    language: "French",
    content_rating: "Everyone",
  },
  {
    id: "4",
    name: "Extension Four",
    description: "This is the fourth extension.",
    version: "1.0",
    icon_url: "",
    source_url: "",
    download_url: "",
    tags: ["tag7", "tag8"],
    language: "French",
    content_rating: "Everyone",
  },
];

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
              <CardTitle>{entry.name}</CardTitle>
              <CardDescription>{entry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground grid grid-cols-1 text-xs sm:grid-cols-2">
                <p>
                  <strong className="text-black dark:text-white">
                    Version:
                  </strong>{" "}
                  {entry.version}
                </p>
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
                <p>
                  <strong className="text-black dark:text-white">Tags:</strong>{" "}
                  {entry.tags.join(", ")}
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
