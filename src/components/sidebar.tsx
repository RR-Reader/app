import { Link } from "react-router-dom";
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader as ShadSidebarHeader,
  useSidebar,
} from "./ui/sidebar";
import { House, Settings2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function SidebarHeader() {
  const { open } = useSidebar();

  return (
    <ShadSidebarHeader
      className={cn("px-4 flex-row transition-all", !open && "justify-center")}
    >
      {open ? (
        <h1 className="text-2xl font-bold">RReader</h1>
      ) : (
        <h1 className="text-2xl font-bold">RR</h1>
      )}
    </ShadSidebarHeader>
  );
}

export function Sidebar() {
  type SidebarPath = {
    title: string;
    items: { name: string; path: string; icon?: LucideIcon }[];
  };

  const sidebarPaths: SidebarPath[] = [
    {
      title: "Content",
      items: [
        { name: "Home", path: "/", icon: House },
        { name: "Settings", path: "/settings", icon: Settings2 },
      ],
    },
  ];

  const data = {
    title: "RReader",
    main: sidebarPaths,
  };

  return (
    <ShadSidebar collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        {data.main.map((item) => (
          <SidebarGroup>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              {item.items.map((link) => (
                <SidebarMenu key={link.name}>
                  <SidebarMenuItem>
                    <Link to={link.path}>
                      <SidebarMenuButton className="cursor-pointer">
                        {link.icon && <link.icon />}
                        {link.name}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </ShadSidebar>
  );
}
