import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ArrowRightLeft } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function ReaderMenu() {
  return (
    <Card
      className={cn(
        "bg-sidebar mb-5 h-14 w-fit flex-row items-center justify-start px-4 py-2 transition-all",
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost">
              <ArrowRightLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change orientation</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" />

        <div className="space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase Zoom</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Minus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease Zoom</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Card>
  );
}

export default function Reader() {
  return (
    <div className="group absolute bottom-0 left-1/2 -translate-x-1/2 overflow-y-hidden">
      <ReaderMenu />
    </div>
  );
}
