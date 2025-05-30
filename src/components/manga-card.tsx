import { Search } from "lucide-react";
import { Link } from "react-router";
import { useCoverStyle } from "@/hooks/settings/use-cover-style";
import { useShowTitles } from "@/hooks/settings/use-show-titles";
import { coverVariants, viewMoreVariants } from "@/lib/cover-variants";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

interface CardContextMenuProps {
  identifier?: string;
  children?: React.ReactNode;
}

export function CardContextMenu({ children }: CardContextMenuProps) {
  const { coverStyle, setCoverStyle } = useCoverStyle();
  const { showTitles, setShowTitles } = useShowTitles();

  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Settings</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem
          checked={showTitles}
          onCheckedChange={setShowTitles}
        >
          Show Titles
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Favorite</ContextMenuCheckboxItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Cover Style</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuRadioGroup
              value={coverStyle}
              onValueChange={(value) => {
                setCoverStyle(
                  value as "border" | "rounded" | "square" | "shadow",
                );
              }}
            >
              <ContextMenuRadioItem value="border">Border</ContextMenuRadioItem>
              <ContextMenuRadioItem value="rounded">
                Rounded
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="square">
                Squared
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="shadow">Shadow</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}

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
    <CardContextMenu>
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
    </CardContextMenu>
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
