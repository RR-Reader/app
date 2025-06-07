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
import LIBRARY_HOOKS from "@/hooks/use-library";

export function NavCreateCategoryDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mutate } = LIBRARY_HOOKS.useCreateCategory();
  const [categoryName, setCategoryName] = React.useState("");
  const [open, setOpen] = React.useState(false);

  console.log("Value:", categoryName);

  function handleCreateCategory() {
    setOpen(false);
    mutate({ categoryName });
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
