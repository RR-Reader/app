import { Outlet } from "react-router";
import { SidebarProvider } from "./ui/sidebar";
import { Sidebar } from "./sidebar";

export default function Layout() {
  return (
    <SidebarProvider className="flex">
      <Sidebar />
      <main className="min-h-screen w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
