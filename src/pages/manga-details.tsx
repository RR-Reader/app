import { useParams } from "react-router";
import { useLibrary } from "@/hooks/use-library";
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

import { CardContextMenu } from "@/components/manga-card/manga-card-menu";

interface MangaAddProps {
  onAdd: (manga: MangaEntry, category: string) => Promise<void>;
  manga: MangaEntry;
  children: React.ReactNode;
}

function AddMangaDialog({ manga, onAdd, children }: MangaAddProps) {
  const { data: library, isLoading: libraryLoading } = useLibrary();
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
  // const { id, source } = useParams<{
  //   id: string;
  //   source: string;
  // }>();
  const { coverStyle } = useCoverStyle();

  return <></>;
}
