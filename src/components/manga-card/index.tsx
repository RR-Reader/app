import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { useCoverStyle } from "@/hooks/settings/use-cover-style";
import { coverVariants } from "@/lib/cover-variants";
import { CardContextMenu } from "./manga-card-menu";
import { VariantProps } from "class-variance-authority";
import { useLibraryItemSelect } from "@/store/category-select";
import React from "react";

type MangaCardProps = {
  coverUrl: string | undefined;
  title: string;
  id: string;
  source: string;
  size?: number;
  isFavorite?: boolean;
  isSelecting?: boolean;
};

export function CategoryCard({
  coverUrl,
  title,
  id,
  source,
  size = 6,
  isFavorite = true,
  isSelecting = true,
}: MangaCardProps & VariantProps<typeof coverVariants>) {
  const { coverStyle, showTitles, compactMode } = useCoverStyle();

  const { selectedItems } = useLibraryItemSelect();

  const isSelected = selectedItems.includes(id);

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const wrapClass = cn(
      "group relative cursor-pointer",
      size === 4 && "basis-1/4",
      size === 6 && "basis-1/6",
      size === 8 && "basis-1/8",
      size === 10 && "basis-1/10",
      size === 12 && "basis-1/12",
    );

    if (isSelecting) {
      return <button className={wrapClass}>{children}</button>;
    }

    return (
      <Link className={wrapClass} to={`/manga/${source}/${id}`}>
        {children}
      </Link>
    );
  };

  return (
    <CardContextMenu isFavorite={isFavorite}>
      <Wrapper>
        <img
          className={cn(
            coverVariants({ style: coverStyle }),
            isSelecting && isSelected && "ring-primary ring-2",
          )}
          src={coverUrl}
          alt="manga cover"
        />
        {compactMode ? (
          <>
            {showTitles && (
              <div className="absolute right-0 bottom-0 left-0 bg-black/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <h2 className="line-clamp-2 text-sm font-medium text-white">
                  {title}
                </h2>
              </div>
            )}
          </>
        ) : (
          <>
            {showTitles && (
              <h2 className="line-clamp-2 text-sm font-medium overflow-ellipsis">
                {title}
              </h2>
            )}
          </>
        )}
      </Wrapper>
    </CardContextMenu>
  );
}
