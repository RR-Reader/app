import { CategoryCard } from "@/components/manga-card";
import { Button } from "@/components/ui/button";
import { useCategory } from "@/hooks/use-library";
import { cn } from "@/lib/utils";
import { useParams } from "react-router";
import { Loader2, Trash2, Brush } from "lucide-react";
import { useLibraryItemSelect } from "@/store/category-select";
import React from "react";
import { useCoverStyle } from "@/hooks/settings/use-cover-style";

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

function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-primary text-4xl font-bold">Loading</h1>
        <p className="text-muted-foreground text-sm">Please wait</p>
      </div>
      <Loader2 className="text-primary animate-spin" />
    </div>
  );
}

export default function Category() {
  const { grid } = useCoverStyle();
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error, refetch, isRefetching } = useCategory(slug!);
  const [isSelecting, setIsSelecting] = React.useState<boolean>(false);
  const { selectedItems, clearSelection } = useLibraryItemSelect();

  function CategoryHeader() {
    if (isSelecting) {
      return (
        <header className="flex w-full items-center justify-between px-4 py-2">
          <div className="inline-flex gap-2">
            <h1 className="text-3xl font-semibold">{data?.title}</h1>
            <Button
              variant="outline"
              onClick={() => {
                setIsSelecting(!isSelecting);
                clearSelection();
              }}
            >
              Stop Selecting
            </Button>
          </div>
          <p className="text-muted-foreground">
            {selectedItems.length} items selected
          </p>
        </header>
      );
    }

    return (
      <header className="flex w-full items-center justify-between px-4 py-2">
        <div className="inline-flex gap-2">
          <h1 className="text-3xl font-semibold">{data?.title}</h1>
          <Button
            variant="outline"
            onClick={() => setIsSelecting(!isSelecting)}
          >
            Select
          </Button>
        </div>
        <div className="inline-flex items-center gap-4">
          <Button size="icon" className="size-8" variant="outline">
            <Trash2 />
          </Button>
          <Button size="icon" className="size-8" variant="outline">
            <Brush />
          </Button>
        </div>
      </header>
    );
  }

  return (
    <>
      <div>
        <CategoryHeader />

        {(isLoading || isRefetching) && <Loading />}

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
              grid === 4 && "grid-cols-4",
              grid === 6 && "grid-cols-6",
              grid === 8 && "grid-cols-8",
              grid === 10 && "grid-cols-10",
              grid === 12 && "grid-cols-12",
            )}
          >
            {data.entries.map((entry) => (
              <CategoryCard
                key={`${entry.source}-${entry.id}`}
                source={entry.source}
                id={entry.id}
                title={entry.title}
                coverUrl={entry.cover_url}
                isSelecting={isSelecting}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
{
  /*  */
}
