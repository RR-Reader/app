import { Outlet } from "react-router";
import { SidebarProvider } from "./ui/sidebar";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export default function Layout() {
  return (
    <SidebarProvider className="flex">
      <Sidebar />
      <main className="w-full">
        <Header />
        <div className="p-2">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
