import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSidebar, SidebarTrigger } from "./ui/sidebar";
import { Minus, Square, X } from "lucide-react";

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { state, isMobile } = useSidebar();

  function handleMinimize(): void {
    appWindow.minimize();
  }

  function handleToggleMaximize(): void {
    appWindow.toggleMaximize();
  }

  function handleClose(): void {
    appWindow.close();
  }

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

  return (
    <header
      className="items-center-2 bg-sidebar fixed top-0 right-0 z-50 flex h-8 items-center justify-between pl-2 transition-[left,width] duration-200 ease-linear"
      style={{
        left: getLeftOffset(),
        width: `calc(100% - ${getLeftOffset()})`,
      }}
      data-tauri-drag-region
    >
      <SidebarTrigger />

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
