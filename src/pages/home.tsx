"use client";

// import { Link } from "react-router-dom";
import { MangaCard } from "@/components/mangaCard";
import { cn } from "@/lib/utils";
import { type GridValues, useLayoutStore } from "@/stores/layoutStore";
import { invoke } from "@tauri-apps/api/core";
import type { MangaEntry } from "@/types/entries";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

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

const useHomeData = () =>
  useQuery<MangaEntry[]>({
    queryKey: ["popular_releases"],
    queryFn: () => invoke<MangaEntry[]>("get_latest_releases"),
  });

export default function Home() {
  const { grid } = useLayoutStore();

  const gridCols: number = Number.parseInt(grid);

  const {
    data,
    isLoading: loading,
    error,
    refetch,
    isRefetching: isRetrying,
  } = useHomeData();

  console.log("Manga Entries:", data);

  return (
    <div className="h-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Popular Releases</h1>
        {(error || data) && (
          <Button onClick={() => refetch()} variant="ghost" disabled={loading}>
            <ArrowPathIcon />
          </Button>
        )}
      </div>
      <div className="w-full max-w-full">
        {loading && !isRetrying && <LoadingSkeleton grid={grid} />}
        {isRetrying && (
          <div className="col-span-full flex items-center justify-center p-4">
            <div className="flex items-center space-x-2">
              <span className="loading loading-spinner"></span>
            </div>
          </div>
        )}
        {error && !loading && <ErrorFallback error={error} onRetry={refetch} />}
        {data && !loading && data.length === 0 && (
          <div className="col-span-full flex items-center justify-center p-8">
            <p className="text-gray-500">No manga found</p>
          </div>
        )}
        {data && !loading && !isRetrying && (
          <div
            className={cn(
              "grid grid-cols-4 gap-4",
              gridCols === 4 && "grid-cols-4",
              gridCols === 8 && "grid-cols-8",
              gridCols === 12 && "grid-cols-12",
              gridCols === 16 && "grid-cols-16",
            )}
          >
            {data.map((entry, index) => (
              <MangaCard
                key={index}
                coverUrl={entry.cover_url}
                title={entry.title}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
