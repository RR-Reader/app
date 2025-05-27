import { MangaCard } from "@/components/mangaCard";
import { cn } from "@/lib/utils";
import { type GridValues, useLayoutStore } from "@/stores/layoutStore";
import { invoke } from "@tauri-apps/api/core";
import type { ExplorePage, ExploreSection } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

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

function LoadingSkeleton({ grid }: { grid: GridValues }) {
  const skeletonCount = Number.parseInt(grid) || 6;

  return (
    <div
      className={cn(
        "grid gap-4",
        skeletonCount === 6 && "grid-cols-6",
        skeletonCount === 8 && "grid-cols-8",
        skeletonCount === 10 && "grid-cols-10",
        skeletonCount === 12 && "grid-cols-12",
        skeletonCount === 16 && "grid-cols-16",
      )}
    >
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="mb-2 aspect-[3/4] rounded-lg bg-gray-200"></div>
          <div className="mb-1 h-4 rounded bg-gray-200"></div>
          <div className="h-3 w-3/4 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}

const getExplorePage = () =>
  useQuery({
    queryKey: ["latest_releases"],
    queryFn: () => invoke<ExplorePage>("get_explore_page"),
  });

export default function Explore() {
  const { grid } = useLayoutStore();

  const { data, isLoading, error, refetch, isRefetching } = getExplorePage();

  return (
    <div className="h-full overflow-hidden">
      {(isLoading || isRefetching) && <LoadingSkeleton grid={grid} />}

      {error && (
        <ErrorFallback
          error={error as Error}
          onRetry={() => {
            refetch();
          }}
        />
      )}

      {data &&
        !isLoading &&
        data?.sections.map((section) => (
          <div>
            <h1 className="mt-2 mb-4 text-3xl font-bold">{section.title}</h1>
            <div
              className={cn(
                "grid gap-4",
                grid === "8" && "grid-cols-8",
                grid === "12" && "grid-cols-12",
                grid === "16" && "grid-cols-16",
              )}
            >
              {section.entries.map((entry) => (
                <MangaCard
                  source={entry.source}
                  identifier={entry.identifier}
                  title={entry.title}
                  coverUrl={entry.cover_url}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
