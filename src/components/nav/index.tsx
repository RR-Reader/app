import { Sidebar, SidebarContent } from "../ui/sidebar";
import { NavMain } from "./nav-main";
import { NavHeader } from "./nav-header";
import React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <NavHeader />
      <SidebarContent>
        <NavMain />
      </SidebarContent>
    </Sidebar>
  );
}
