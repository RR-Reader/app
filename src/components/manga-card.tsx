import { Search } from "lucide-react";
import { Link } from "react-router";
import { useCoverStyle } from "@/hooks/settings/useCoverStyle";
import { useShowTitles } from "@/hooks/settings/useShowTitles";
import { coverVariants, viewMoreVariants } from "@/lib/cover-variants";
import { cn } from "@/lib/utils";

export function MangaCard({
  coverUrl,
  title,
  identifier,
  source,
}: {
  coverUrl: string | undefined;
  title: string;
  identifier: string;
  source: string;
}) {
  const { coverStyle } = useCoverStyle();
  const { showTitles } = useShowTitles();

  return (
    <Link to={`/manga/${source}/${identifier}`}>
      <div>
        <img
          className={cn(coverVariants({ style: coverStyle }))}
          src={coverUrl}
          alt="manga cover"
        />
        {showTitles && (
          <h2 className="line-clamp-2 font-medium overflow-ellipsis">
            {title}
          </h2>
        )}
      </div>
    </Link>
  );
}

export function ViewMoreCard({ source }: { source: string }) {
  const { coverStyle } = useCoverStyle();

  return (
    <Link to={`/manga/${source}`}>
      <div>
        <div className={cn(viewMoreVariants({ style: coverStyle }))}>
          <Search className="size-6" />
        </div>
        <h2 className="line-clamp-2 font-medium overflow-ellipsis">
          View More
        </h2>
      </div>
    </Link>
  );
}
