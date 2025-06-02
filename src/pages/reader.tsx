import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus,
  ArrowRightLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  LucideIcon,
} from "lucide-react";

import { usePreferences } from "@/hooks/settings/use-settings";

import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Option } from "@/types";
import { useParams } from "react-router";

function useFetchPages(source: Option<string>, id: Option<string>) {
  return useQuery({
    queryKey: ["reader-pages", source, id],
    queryFn: async () => {
      try {
        const pages = await invoke<string[]>("load_manga_chapter", {
          source,
          id,
        });
        return pages;
      } catch (error) {
        console.error("Failed to fetch reader pages:", error);
        throw error;
      }
    },
  });
}

function ReaderMenu() {
  const { preferences } = usePreferences();

  const currentReaderMode = preferences?.reader_display.page_layout;
  const isVertical = currentReaderMode === "vertical-scroll";

  const [PrevIcon, NextIcon]: [LucideIcon, LucideIcon] = isVertical
    ? [ArrowDown, ArrowUp]
    : [ArrowLeft, ArrowRight];

  return (
    <div className="group fixed right-5 bottom-0">
      <Card
        className={cn(
          "bg-sidebar mb-5 items-center gap-2 p-2 transition-all",
          isVertical ? "h-fit w-14 flex-col" : "h-14 w-fit flex-row",
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <ArrowRightLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isVertical ? "left" : "top"}>
              <p>Change orientation</p>
            </TooltipContent>
          </Tooltip>

          <div className={cn(isVertical ? "space-y-2" : "flex")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Minus />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "left" : "top"}>
                Decrease Zoom
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "left" : "top"}>
                Increase Zoom
              </TooltipContent>
            </Tooltip>
          </div>

          <div className={cn(isVertical ? "space-y-2" : "flex")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  {isVertical ? <NextIcon /> : <PrevIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "left" : "top"}>
                Previous Page
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  {isVertical ? <PrevIcon /> : <NextIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "left" : "top"}>
                Next Page
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </Card>
    </div>
  );
}

export default function Reader() {
  const { source, chapterId: id } = useParams<{
    source: string;
    chapterId: string;
  }>();

  const { data: pages } = useFetchPages(source, id);

  const { preferences } = usePreferences();
  const isVertical =
    preferences?.reader_display.page_layout === "vertical-scroll";

  console.log("Pages:", pages);

  return (
    <>
      <ReaderMenu />
      <div
        className={cn(
          "mt-4 flex-1 overflow-y-auto p-4",
          isVertical
            ? "flex flex-col items-center"
            : "flex flex-row gap-4 overflow-x-auto",
        )}
      >
        {pages &&
          pages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Page ${index + 1}`}
              className="h-auto max-w-full"
              style={{
                maxWidth: isVertical ? "40rem" : "60rem",
              }}
            />
          ))}
      </div>
    </>
  );
}
