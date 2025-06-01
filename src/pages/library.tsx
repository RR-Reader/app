import { CategoryCard } from "@/components/category-card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LIBRARY_HOOKS from "@/hooks/use-library";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

function CreateCategoryDialog({ children }: { children: React.ReactNode }) {
  const { mutate: createCategory } = LIBRARY_HOOKS.useCreateCategory();

  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) return;

    createCategory(
      { categoryName: value },
      {
        onError: (error) => {
          console.error("Error creating category:", error);
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your manga entries.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button className="w-full" type="submit">
                Create
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Library() {
  const { data, isLoading, isError } = LIBRARY_HOOKS.useLoadLibrary();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return <div>Library not found</div>;
  }

  function handleDelete() {}
  function handleEdit(_test: string) {}

  return (
    <>
      <header className="bg-sidebar border-b-sidebar-border flex border-b px-4 py-2 md:hidden">
        <SidebarTrigger className="size-8" variant="outline" />
      </header>
      <div
        className={cn(
          "grid h-full auto-rows-min gap-4 p-4",
          "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
        )}
      >
        {data.categories.map((category) => (
          <CategoryCard
            key={category.slug}
            title={category.title}
            slug={category.slug}
            entryCount={category.entries.length}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
        <CreateCategoryDialog>
          <Button asChild variant="outline">
            <Card className="group hover:bg-sidebar flex h-full cursor-pointer items-center justify-center border-dashed px-4 py-2 shadow-md transition-all">
              <Plus className="text-muted-foreground group-hover:text-primary size-8 transition-colors" />
            </Card>
          </Button>
        </CreateCategoryDialog>
      </div>
    </>
  );
}
