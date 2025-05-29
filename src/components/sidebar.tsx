import { Link, useNavigate } from "react-router";
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
} from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router";
import {
  type LucideIcon,
  Search,
  Compass,
  LibraryBig,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function SidebarHeader() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    }
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <ShadSidebarHeader
      className={cn("flex-row justify-between px-4 transition-all")}
    >
      <h1 className="text-2xl font-bold">RReader</h1>
      <div className="space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent size-8"
              onClick={handleBack}
              aria-label="Go back"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Go back</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent size-8"
              onClick={handleForward}
              aria-label="Go forward"
            >
              <ChevronRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Go forward</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </ShadSidebarHeader>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  type SidebarPath = {
    title: string;
    items: { name: string; path: string; icon?: LucideIcon }[];
  };

  const isActive = (linkPath: string): boolean => {
    if (linkPath === "/" && pathname === "/") {
      return true;
    }

    if (linkPath === "/explore" && pathname.startsWith("/explore")) {
      return true;
    }

    if (linkPath === "/" && pathname.startsWith("/category")) {
      return true;
    }

    if (linkPath === "/settings" && pathname.startsWith("/settings")) {
      return true;
    }

    return pathname === linkPath;
  };

  const navigationLinks: SidebarPath[] = [
    {
      title: "Content",
      items: [
        { name: "Library", path: "/", icon: LibraryBig },
        {
          name: "Search",
          path: "/search",
          icon: Search,
        },
        {
          name: "Explore",
          path: "/explore",
          icon: Compass,
        },
        {
          name: "Settings",
          path: "/settings",
          icon: SlidersHorizontal,
        },
      ],
    },
  ];

  const data = {
    title: "RReader",
    main: navigationLinks,
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
                      <SidebarMenuButton
                        className={cn(
                          "mb-2 cursor-pointer",
                          !isActive(link.path) && "text-muted-foreground",
                          isActive(link.path) &&
                            "bg-primary hover:bg-primary text-white hover:text-white",
                        )}
                      >
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
