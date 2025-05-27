import { Link } from "react-router";
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
import { HomeIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router";

function SidebarHeader() {
  const { open } = useSidebar();

  return (
    <ShadSidebarHeader
      className={cn("flex-row px-4 transition-all", !open && "justify-center")}
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
  const { pathname } = useLocation();
  type SidebarPath = {
    title: string;
    items: { name: string; path: string; icon?: JSX.Element }[];
  };

  const sidebarPaths: SidebarPath[] = [
    {
      title: "Content",
      items: [
        { name: "Home", path: "/", icon: <HomeIcon /> },
        {
          name: "Settings",
          path: "/settings",
          icon: <AdjustmentsHorizontalIcon />,
        },
      ],
    },
  ];

  const data = {
    title: "RReader",
    main: sidebarPaths,
  };

  return (
    <ShadSidebar collapsible="icon" variant="floating">
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
                      <SidebarMenuButton
                        className={cn(
                          "mb-2 cursor-pointer",
                          pathname !== link.path && "text-muted-foreground",
                          pathname === link.path && "bg-accent/50",
                        )}
                      >
                        {link.icon}
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
