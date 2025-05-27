import { matchPath, useLocation } from "react-router";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { useSidebar } from "./ui/sidebar";
import { useLayoutStore } from "@/stores/layoutStore";
import { ModeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { SidebarClose, SidebarOpen } from "lucide-react";

function Header() {
  const { pathname } = useLocation();
  const { setOpen, open } = useSidebar();

  const routes: { path: string; name: string }[] = [
    { path: "/", name: "Home" },
    { path: "/settings", name: "Settings" },
    { path: "/manga/:provider/:identifier", name: "Manga Details" },
  ];

  const currentTitle =
    routes.find((route) => matchPath(route.path, pathname))?.name ??
    "Page Not Found";
  const { grid, setGrid } = useLayoutStore();
  const gridOptions = ["8", "12", "16"];

  return (
    <header className="h-16 w-full p-2">
      <div className="bg-sidebar border-sidebar-border flex h-full w-full items-center gap-4 rounded-lg border p-2">
        <Button
          variant={"outline"}
          size="icon"
          className="size-8"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <SidebarClose className="size-4" />
          ) : (
            <SidebarOpen className="size-4" />
          )}
        </Button>

        <Separator orientation="vertical" />

        <h1 className="text-2xl font-semibold">{currentTitle}</h1>

        <Separator orientation="vertical" />

        {pathname === "/" && (
          <div>
            <Select value={grid} onValueChange={setGrid}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grid Layout" defaultValue={"8"} />
              </SelectTrigger>
              <SelectContent>
                {gridOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}

export { Header };
