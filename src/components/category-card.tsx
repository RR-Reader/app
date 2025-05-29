import { Button } from "./ui/button";
import { Pencil, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { useState } from "react";
import { Link } from "react-router";
import { Card } from "./ui/card";

function DeleteDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          className="cursor-pointer transition hover:text-red-400"
          variant="outline"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash size={12} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditDialog({
  defaultValue,
  onSave,
}: {
  defaultValue: string;
  onSave: (newName: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="cursor-pointer transition hover:text-green-400"
          variant="outline"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make changes to the category here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
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
        </form>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryCardProps {
  title: string;
  slug: string;
  entryCount: number;
  onDelete: () => void;
  onEdit: (newName: string) => void;
}

export function CategoryCard({
  title,
  slug,
  entryCount,
  onDelete,
  onEdit,
}: CategoryCardProps) {
  return (
    <Card className="hover:bg-card/40 flex max-h-40 flex-col justify-between px-4 py-2 shadow-md transition-all md:aspect-square md:h-40">
      <Link to={`/category/${slug}`} className="cursor-pointer">
        <h1 className="mb-2 truncate text-lg font-semibold">{title}</h1>
        <div className="text-muted-foreground mb-4 text-sm">
          {entryCount} Entries
        </div>
      </Link>
      <div className="flex justify-end gap-4">
        <DeleteDialog onConfirm={onDelete} />
        <EditDialog defaultValue={title} onSave={onEdit} />
      </div>
    </Card>
  );
}
