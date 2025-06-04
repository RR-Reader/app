import { Search } from "lucide-react";
import { Link } from "react-router";
import { useCoverStyle } from "@/hooks/settings/use-cover-style";
import { useShowTitles } from "@/hooks/settings/use-show-titles";
import { coverVariants, viewMoreVariants } from "@/lib/cover-variants";
import { cn } from "@/lib/utils";
import { CardContextMenu } from "./context-menus/manga-card-menu";
import { Option } from "@/types";
import { VariantProps } from "class-variance-authority";

type MangaCardProps = {
  coverUrl: string | undefined;
  title: string;
  id: string;
  source: string;
  size?: number;
};

export function MangaCard({
  coverUrl,
  title,
  id,
  source,
  size = 6,
}: MangaCardProps & VariantProps<typeof coverVariants>) {
  const { coverStyle } = useCoverStyle();
  const { showTitles } = useShowTitles();

  return (
    <CardContextMenu>
      <Link
        className={cn(
          size === 6 && "basis-1/6",
          size === 8 && "basis-1/8",
          size === 12 && "basis-1/12",
          size === 16 && "basis-1/16",
        )}
        to={`/manga/${source}/${id}`}
      >
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
      </Link>
    </CardContextMenu>
  );
}

export function ViewMoreCard({ source }: { source: Option<string> }) {
  const { coverStyle } = useCoverStyle();

  return (
    <Link to={`/manga/${source}`} className="">
      <div className={cn(viewMoreVariants({ style: coverStyle }))}>
        <Search className="size-6" />
      </div>
      <h2 className="line-clamp-2 font-medium overflow-ellipsis">View More</h2>
    </Link>
  );
}
