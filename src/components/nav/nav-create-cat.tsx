import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import React from "react";
import { Button } from "../ui/button";
import { useLibraryMethods } from "@/hooks/use-library";
import { slugify } from "@/lib/utils";

export function NavCreateCategoryDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { createCategory } = useLibraryMethods();
  const [categoryName, setCategoryName] = React.useState("");
  const [open, setOpen] = React.useState(false);

  console.log("Value:", categoryName);

  function handleCreateCategory() {
    setOpen(false);
    createCategory({ title: categoryName, slug: slugify(categoryName) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your manga.
          </DialogDescription>
        </DialogHeader>
        <form action="">
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </form>
        <DialogFooter>
          <Button onClick={handleCreateCategory}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
