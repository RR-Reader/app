import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface FilterSheetProps {
  filter: string;
  children: React.ReactNode;
  setFilter: (value: string) => void;
  query: (value: string) => void;
}

export function FilterSheet({
  children,
  filter,
  setFilter,
  query,
}: FilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Settings</SheetTitle>
          <SheetDescription>
            Add your filter settings here, when the list is too large.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <Label>Query</Label>
          <Input
            className="w-full"
            placeholder="Search extensions..."
            onChange={(e) => query(e.target.value)}
          />
          <Label>Filter By</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Search by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="tags">Tags</SelectItem>
              <SelectItem value="language">Language</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
