import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarHeader, useSidebar } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

export function NavHeader() {
  const { state, isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  const NavigationButtons = () => (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent/50 size-8 transition-colors"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          <p>Go back</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent/50 size-8 transition-colors"
            onClick={handleForward}
            aria-label="Go forward"
          >
            <ChevronRight className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          <p>Go forward</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const AppTitle = ({ abbreviated = false }: { abbreviated?: boolean }) => (
    <h1
      className={cn("font-bold transition-all duration-200")}
      title={abbreviated ? "RReader" : undefined}
    >
      {abbreviated ? "RR" : "RReader"}
    </h1>
  );

  if (isMobile) {
    return (
      <SidebarHeader className="mb-2 flex h-8 flex-row items-center justify-between border-b px-4">
        <AppTitle />

        <NavigationButtons />
      </SidebarHeader>
    );
  }

  if (state === "expanded") {
    return (
      <SidebarHeader className="mb-2 flex h-8 flex-row items-center justify-between px-4 py-0 transition-all duration-200">
        <AppTitle />
        <NavigationButtons />
      </SidebarHeader>
    );
  }

  return (
    <SidebarHeader className="mb-2 flex h-8 flex-col items-center justify-center px-2 py-0 transition-all duration-200">
      <AppTitle abbreviated />
    </SidebarHeader>
  );
}
