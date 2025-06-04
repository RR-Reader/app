import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarHeader, useSidebar } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

export function NavHeader() {
  const { open } = useSidebar();
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
    <SidebarHeader
      className={cn(
        "flex-row justify-between px-4 transition-all",
        !open && "justify-center",
      )}
    >
      {open && (
        <>
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
              <TooltipContent side="bottom">
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
              <TooltipContent side="bottom">
                <p>Go forward</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </>
      )}
      {!open && <h1 className="text-2xl font-bold">RR</h1>}
    </SidebarHeader>
  );
}
