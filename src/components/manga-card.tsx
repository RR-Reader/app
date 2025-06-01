import { Search } from "lucide-react";
import { Link } from "react-router";
import { useCoverStyle } from "@/hooks/settings/use-cover-style";
import { useShowTitles } from "@/hooks/settings/use-show-titles";
import { coverVariants, viewMoreVariants } from "@/lib/cover-variants";
import { cn } from "@/lib/utils";
import { CardContextMenu } from "./context-menus/manga-card-menu";
import { Option } from "@/types";

export function MangaCard({
  coverUrl,
  title,
  id,
  source,
}: {
  coverUrl: string | undefined;
  title: string;
  id: string;
  source: string;
}) {
  const { coverStyle } = useCoverStyle();
  const { showTitles } = useShowTitles();

  return (
    <CardContextMenu>
      <Link to={`/manga/${source}/${id}`}>
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
    </CardContextMenu>
  );
}

export function ViewMoreCard({ source }: { source: Option<string> }) {
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
