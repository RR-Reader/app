import { Outlet } from "react-router";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/sidebar";

export default function BaseLayout() {
  return (
    <SidebarProvider draggable className="flex">
      <AppSidebar />
      <main className="relative min-h-screen w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
