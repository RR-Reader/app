import { MangaCard, ViewMoreCard } from "@/components/manga-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import EXPLORE from "@/hooks/use-explore";
import { useParams, useNavigate } from "react-router";
import { useGrid } from "@/hooks/settings/use-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExploreContextMenu } from "@/components/context-menus/explore-context";
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Header } from "@/components/header";

function ErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center space-y-4 p-8">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold">Failed to Load Manga</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    </div>
  );
}

function LoadingFallback({ grid }: { grid: number }) {
  return (
    <div
      className={cn(
        "grid gap-4 p-4",
        grid === 6 && "grid-cols-6",
        grid === 8 && "grid-cols-8",
        grid === 10 && "grid-cols-10",
        grid === 12 && "grid-cols-12",
        grid === 16 && "grid-cols-16",
      )}
    >
      {Array.from({ length: grid }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="mb-2 aspect-[3/4] rounded-lg bg-gray-200"></div>
          <div className="mb-1 h-4 rounded bg-gray-200"></div>
          <div className="h-3 w-3/4 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}

export default function Explore() {
  const { grid } = useGrid();
  const { source } = useParams<{ source: string }>();
  const { data, isLoading, error, refetch, isRefetching } =
    EXPLORE.useFetchExplorePages(source);

  const navigate = useNavigate();

  type Source = {
    name: string;
    path: string;
  };

  const sourceList: Source[] = [
    { name: "Batoto", path: "batoto" },
    { name: "Mangadex", path: "mangadex" },
    { name: "WeebCentral", path: "weebcentral" },
  ];

  const handleTabChange = (value: string) => {
    navigate(`/explore/${value}`);
  };

  console.log("data", data);

  return (
    <ExploreContextMenu>
      <Tabs value={source} className="flex min-h-screen flex-col gap-0">
        <Header />
        <TabsList className="bg-muted mt-0 w-full justify-start">
          <TabsTrigger
            className="max-w-fit cursor-pointer px-4"
            onClick={() => handleTabChange("")}
            value=""
          >
            Home
          </TabsTrigger>
          {sourceList.map((src) => (
            <TabsTrigger
              key={src.path}
              onClick={() => handleTabChange(src.path)}
              value={src.path}
              className="max-w-fit cursor-pointer px-4"
            >
              {src.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent
          value=""
          className="flex h-full w-full items-center justify-center text-center"
        >
          <h1 className="text-5xl font-semibold">No source selected</h1>
        </TabsContent>

        {data?.map((page) => (
          <TabsContent value={page.source} className="relative">
            {page.sections.map((section) => (
              <>
                <h1 className="my-4 ml-14 text-3xl font-semibold">
                  {section.title}
                </h1>
                <Carousel
                  opts={{ align: "start" }}
                  className="max-w-full overflow-x-hidden"
                >
                  <CarouselContent className="mx-12">
                    {section.entries.map((entry) => (
                      <CarouselItem
                        key={entry.id}
                        className={cn(
                          grid === 6 && "basis-1/6",
                          grid === 8 && "basis-1/8",
                          grid === 12 && "basis-1/12",
                          grid === 16 && "basis-1/16",
                        )}
                      >
                        <MangaCard
                          source={entry.source}
                          id={entry.id}
                          title={entry.title}
                          coverUrl={entry.cover_url}
                          size={grid}
                        />
                      </CarouselItem>
                    ))}
                    <CarouselItem
                      className={cn(
                        grid === 6 && "basis-1/6",
                        grid === 8 && "basis-1/8",
                        grid === 12 && "basis-1/12",
                        grid === 16 && "basis-1/16",
                      )}
                    >
                      <ViewMoreCard source={"batoto"} />
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-1 hidden md:flex" />
                  <CarouselNext className="right-1 hidden md:flex" />
                </Carousel>
              </>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </ExploreContextMenu>
  );
}

{
  /* <>
  <h1 className="my-4 ml-14 text-3xl font-semibold">{section.title}</h1>
  <Carousel opts={{ align: "start" }} className="max-w-full overflow-x-hidden">
    <CarouselContent className="mx-12">
      {section.entries.map((entry) => (
        <CarouselItem
          key={entry.id}
          className={cn(
            grid === 6 && "basis-1/6",
            grid === 8 && "basis-1/8",
            grid === 12 && "basis-1/12",
            grid === 16 && "basis-1/16",
          )}
        >
          <MangaCard
            source={entry.source}
            id={entry.id}
            title={entry.title}
            coverUrl={entry.cover_url}
            size={grid}
          />
        </CarouselItem>
      ))}
      <CarouselItem
        className={cn(
          grid === 6 && "basis-1/6",
          grid === 8 && "basis-1/8",
          grid === 12 && "basis-1/12",
          grid === 16 && "basis-1/16",
        )}
      >
        <ViewMoreCard source={"batoto"} />
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious className="left-1" />
    <CarouselNext className="right-1" />
  </Carousel>
</>; */
}
