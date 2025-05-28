import { matchPath, useLocation, useNavigate } from "react-router";
import { useSidebar } from "./ui/sidebar";
import { ModeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  SidebarClose,
  SidebarOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { useGetExplorePage } from "@/hooks/queries";
import { useParams } from "react-router";

function Header() {
  const { pathname } = useLocation();
  const { setOpen, open } = useSidebar();
  const navigate = useNavigate();

  const { source } = useParams<{ source: string }>();

  const { refetch } = useGetExplorePage(source || undefined);

  const routes: { path: string; name: string }[] = [
    { path: "/", name: "Home" },
    { path: "/explore", name: "Explore" },
    { path: "/explore/:source", name: "Explore" },
    { path: "/search", name: "Search" },
    { path: "/settings", name: "Settings" },
    { path: "/manga/:provider/:identifier", name: "Manga Details" },
  ];

  const currentTitle =
    routes.find((route) => matchPath(route.path, pathname))?.name ??
    "Page Not Found";

  return (
    <header className="h-16 w-full p-2">
      <div className="bg-sidebar border-sidebar-border relative flex h-full w-full items-center justify-between gap-4 rounded-lg border p-2">
        <div className="flex space-x-4">
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

          <div className="space-x-2">
            <Button
              variant={"outline"}
              size="icon"
              className="size-8"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant={"outline"}
              size="icon"
              className="size-8"
              onClick={() => navigate(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <h1 className="absolute inset-x-1/2 -translate-x-1/2 text-2xl font-semibold text-nowrap">
          {currentTitle}
        </h1>

        <div className="flex items-center gap-4">
          {source && (
            <Button onClick={() => refetch()} size="icon" variant="outline">
              <RefreshCcw />
            </Button>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

export { Header };
