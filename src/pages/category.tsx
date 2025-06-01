import { MangaCard } from "@/components/manga-card";
import { Button } from "@/components/ui/button";
import LIBRARY_HOOKS from "@/hooks/use-library";
import { cn } from "@/lib/utils";
import { useParams } from "react-router";
import { useGrid } from "@/hooks/settings/use-grid";

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

function LoadingSkeleton({ grid }: { grid: number }) {
  return (
    <div
      className={cn(
        "grid gap-4",
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

export default function Category() {
  const { grid } = useGrid();
  const { title } = useParams<{ title: string }>();
  const { data, isLoading, error, refetch, isRefetching } =
    LIBRARY_HOOKS.useFetchCategory(title);

  return (
    <>
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

        {data && (
          <div
            className={cn(
              "grid gap-4 p-4",
              grid === 6 && "grid-cols-6",
              grid === 8 && "grid-cols-8",
              grid === 12 && "grid-cols-12",
              grid === 16 && "grid-cols-16",
            )}
          >
            {data.entries.map((entry) => (
              <MangaCard
                key={`${entry.source}-${entry.id}`}
                source={entry.source}
                id={entry.id}
                title={entry.title}
                coverUrl={entry.cover_url}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
