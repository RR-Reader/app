import { Sidebar, SidebarContent, SidebarRail } from "./ui/sidebar";
import { NavMain } from "./nav/nav-main";
import { NavHeader } from "./nav/nav-header";
import React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <NavHeader />
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
