import { useParams } from "react-router";
import { QUERIES, MUTATIONS } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Star } from "lucide-react";
import { useCoverStyle } from "@/hooks/settings/useCoverStyle";
import { coverVariants } from "@/lib/cover-variants";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { MangaEntry, Category } from "@/types";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface MangaAddProps {
  onAdd: (manga: MangaEntry, category: string) => void;
  manga: MangaEntry;
}

function AddMangaDialog({ manga, onAdd }: MangaAddProps) {
  const { data: library, isLoading: libraryLoading } = QUERIES.useLoadLibrary();
  const categories: Category[] = library?.categories || [];
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory) {
      onAdd(manga, selectedCategory);
      setSelectedCategory(""); // Reset selection
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="shrink-0">
          <Heart className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Library</DialogTitle>
          <DialogDescription>
            Choose which category you want to add "{manga.title}" to.
          </DialogDescription>
        </DialogHeader>

        {libraryLoading ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">
              Loading categories...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Categories</SelectLabel>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.title} value={category.title}>
                          {category.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <DialogClose>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose>
                <Button
                  type="submit"
                  disabled={!selectedCategory || categories.length === 0}
                >
                  Add to Library
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function MangaDetail() {
  const { identifier, source } = useParams<{
    identifier: string;
    source: string;
  }>();
  const { coverStyle } = useCoverStyle();

  const { data, isLoading, error } = QUERIES.useQueryMangaInfo(
    identifier,
    source,
  );
  const { mutate } = MUTATIONS.useAddMangaToCategory();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p>Loading manga details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">Error loading manga details</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            Identifier: {identifier} | Source: {source}
          </p>
        </div>
      </div>
    );
  }

  const mangaEntry: MangaEntry = {
    identifier: identifier!,
    title: data?.title || "Unknown Title",
    source: source!,
    cover_url: data?.cover_url || "",
  };

  const handleAddManga = (manga: MangaEntry, category: string) => {
    mutate(
      {
        categoryName: category,
        mangaEntry: manga,
      },
      {
        onSuccess: () => {
          console.log("Manga added successfully!");
        },
        onError: (error) => {
          console.error("Error adding manga to category:", error);
        },
      },
    );
  };

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-shrink-0">
          <img
            src={data?.cover_url}
            alt={data?.title}
            className={cn(
              coverVariants({ style: coverStyle, type: "image" }),
              "mx-auto h-auto max-h-96 w-full max-w-sm lg:mx-0",
            )}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl leading-tight font-bold">
                {data?.title}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Source: <span className="font-medium">{source}</span>
              </p>
            </div>
            <AddMangaDialog manga={mangaEntry} onAdd={handleAddManga} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data?.authors && data.authors.length > 0 && (
              <div className="space-y-1">
                <p className="text-primary flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="size-4" />
                  Authors
                </p>
                <p className="text-muted-foreground text-sm">
                  {data.authors.join(", ")}
                </p>
              </div>
            )}

            {data?.artists && data.artists.length > 0 && (
              <div className="space-y-1">
                <p className="text-primary flex items-center gap-2 text-sm font-semibold">
                  <Star className="size-4" />
                  Artists
                </p>
                <p className="text-muted-foreground text-sm">
                  {data.artists.join(", ")}
                </p>
              </div>
            )}
          </div>

          {data?.genres && data.genres.length > 0 && (
            <div className="space-y-2">
              <p className="text-primary text-sm font-semibold">Genres</p>
              <div className="flex flex-wrap gap-2">
                {data.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data?.description && (
            <div className="space-y-2">
              <p className="text-primary text-sm font-semibold">Description</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TODO */}
      {/* Chapters Section - Add this later */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Chapters</h2>
        <div className="bg-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Chapter list will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}
