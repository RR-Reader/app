import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSidebar, SidebarTrigger } from "./ui/sidebar";
import { ChevronLeft, ChevronRight, Minus, Square, X } from "lucide-react";
import { useNavigate } from "react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { state, isMobile } = useSidebar();
  const navigate = useNavigate();

  function handleMinimize(): void {
    appWindow.minimize();
  }

  function handleToggleMaximize(): void {
    appWindow.toggleMaximize();
  }

  function handleClose(): void {
    appWindow.close();
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  const getLeftOffset = () => {
    if (isMobile) {
      return "0px";
    }

    if (state === "expanded") {
      return "16rem";
    } else {
      return "3rem";
    }
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

  return (
    <header
      className="items-center-2 bg-sidebar fixed top-0 right-0 z-50 flex h-8 items-center justify-between transition-[left,width] duration-200 ease-linear"
      style={{
        left: getLeftOffset(),
        width: `calc(100% - ${getLeftOffset()})`,
      }}
      data-tauri-drag-region
    >
      <div className="inline-flex">
        <SidebarTrigger className="size-8" />
        <NavigationButtons />
      </div>

      <div className="flex gap-1">
        <button
          onClick={handleMinimize}
          className="dark:hover:bg-sidebar-border flex size-8 items-center justify-center transition-colors hover:bg-black/10"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleToggleMaximize}
          className="dark:hover:bg-sidebar-border flex size-8 items-center justify-center transition-colors hover:bg-black/10"
        >
          <Square size={14} />
        </button>
        <button
          onClick={handleClose}
          className="flex size-8 items-center justify-center transition-colors hover:bg-red-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </header>
  );
}
