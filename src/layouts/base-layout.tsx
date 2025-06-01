import { Outlet } from "react-router";
import { SidebarProvider } from "../components/ui/sidebar";
import { Sidebar } from "../components/sidebar";

export default function BaseLayout() {
  return (
    <SidebarProvider draggable className="flex">
      <Sidebar />
      <main className="relative min-h-screen w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
