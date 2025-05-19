import { Outlet, useLocation, matchPath } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Sidebar } from "./sidebar";

export default function Layout() {
  function useCurrentTitle() {
    const { pathname } = useLocation();

    const routes: { path: string; name: string }[] = [
      { path: "/", name: "Home" },
      { path: "/settings", name: "Settings" },
      { path: "/manga/:provider/:identifier", name: "Manga Details" },
    ];

    return (
      routes.find((route) => matchPath(route.path, pathname))?.name ??
      "Page Not Found"
    );
  }

  const currentTitle = useCurrentTitle();

  return (
    <SidebarProvider className="flex">
      <Sidebar />
      <main className="w-full">
        <header className="h-12 flex items-center gap-4 border-b w-full p-2">
          <SidebarTrigger variant={"outline"} />
          <h1 className="text-2xl font-semibold">{currentTitle}</h1>
        </header>
        <div className="p-2">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
