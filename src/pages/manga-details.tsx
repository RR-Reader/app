import { useParams } from "react-router";
import MANGA_HOOKS from "@/hooks/use-manga";
import LIBRARY_HOOKS from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Star, Loader2, Trash2 } from "lucide-react";
import { useCoverStyle } from "@/hooks/settings/use-cover-style";
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
} from "@/components/ui/dialog";
import { MangaEntry, CategoryMeta } from "@/types";
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
import { ChapterTable } from "@/components/chapter-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { CardContextMenu } from "@/components/context-menus/manga-card-menu";

interface MangaAddProps {
  onAdd: (manga: MangaEntry, category: string) => Promise<void>;
  manga: MangaEntry;
  children: React.ReactNode;
}

function AddMangaDialog({ manga, onAdd, children }: MangaAddProps) {
  const { data: library, isLoading: libraryLoading } =
    LIBRARY_HOOKS.useLoadLibrary();
  const categories: CategoryMeta[] = library?.categories || [];
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(manga, selectedCategory);
      setIsOpen(false);
      setSelectedCategory("");
      toast.success(`Added "${manga.title}" to ${selectedCategory}`);
    } catch (error) {
      console.error("Failed to add manga:", error);
      toast.error("Failed to add manga to library");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      setIsOpen(open);
      if (!open) {
        setSelectedCategory("");
      }
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setSelectedCategory("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Library</DialogTitle>
          <DialogDescription>
            Choose which category you want to add "{manga.title}" to.
          </DialogDescription>
        </DialogHeader>

        {libraryLoading ? (
          <div className="py-4 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            <p className="text-muted-foreground mt-2 text-sm">
              Loading categories...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
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
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedCategory || categories.length === 0 || isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Library"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface RemoveMangaDialogProps {
  onRemove: (manga: MangaEntry) => Promise<void>;
  manga: MangaEntry;
  children: React.ReactNode;
}

function RemoveMangaDialog({
  onRemove,
  manga,
  children,
}: RemoveMangaDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(manga);
      toast.success(`Removed "${manga.title}" from library`);
    } catch (error) {
      console.error("Failed to remove manga:", error);
      toast.error("Failed to remove manga from library");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from Library</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove "{manga.title}" from your library?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleRemove} disabled={isRemoving}>
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function MangaDetail() {
  const { id, source } = useParams<{
    id: string;
    source: string;
  }>();
  const { coverStyle } = useCoverStyle();

  const { data, isLoading, error } = MANGA_HOOKS.useQueryMangaInfo(id, source);

  console.log("Manga Data", data);

  const mangaEntry: MangaEntry = {
    id: id!,
    title: data?.title || "Unknown Title",
    source: source!,
    cover_url: data?.cover_url || "",
  };

  const { isInLibrary, category } = LIBRARY_HOOKS.useMangaInLibrary(mangaEntry);

  const { mutateAsync: addMangaToCategory } =
    LIBRARY_HOOKS.useAddMangaToCategory();

  const { mutateAsync: removeMangaFromCategory } =
    LIBRARY_HOOKS.useRemoveMangaFromCategory();

  const handleAddManga = async (manga: MangaEntry, category: string) => {
    return addMangaToCategory({
      categoryName: category,
      mangaEntry: manga,
    });
  };

  const handleRemoveManga = async (manga: MangaEntry) => {
    console.log("Remove manga debug:", {
      category,
      categoryType: typeof category,
      mangaId: manga.id,
      mangaSource: manga.source,
    });

    console.log("Test:", category);

    if (!category) {
      throw new Error("Cannot determine which category to remove manga from");
    }

    if (!category?.trim()) {
      throw new Error("Category name is empty");
    }

    if (!manga.id?.trim()) {
      throw new Error("Manga ID is empty");
    }

    if (!manga.source?.trim()) {
      throw new Error("Manga source is empty");
    }

    return removeMangaFromCategory({
      categoryName: category,
      mangaId: manga.id,
      mangaSource: manga.source,
    });
  };

  const LibraryButton = ({ children }: { children: React.ReactNode }) => {
    if (isInLibrary) {
      return (
        <RemoveMangaDialog onRemove={handleRemoveManga} manga={mangaEntry}>
          {children}
        </RemoveMangaDialog>
      );
    }

    return (
      <AddMangaDialog manga={mangaEntry} onAdd={handleAddManga}>
        {children}
      </AddMangaDialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
          <p>Loading manga details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-primary text-lg font-semibold">
            Error loading manga details
          </p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            Source: {source} | Manga ID: {id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <CardContextMenu>
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
        </CardContextMenu>

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
            <LibraryButton>
              <Button
                size="icon"
                variant={isInLibrary ? "default" : "outline"}
                className="shrink-0"
              >
                <Heart
                  className={cn("size-4", isInLibrary && "fill-current")}
                />
              </Button>
            </LibraryButton>
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
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
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

      {data?.chapters && <ChapterTable data={data?.chapters} />}
    </div>
  );
}
