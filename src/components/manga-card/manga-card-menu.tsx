import { useCoverStyle } from "@/hooks/settings/use-cover-style";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuItem,
} from "../ui/context-menu";

import { LayoutGrid, Type, Trash2 } from "lucide-react";

interface CardContextMenuProps {
  id?: string;
  children?: React.ReactNode;
}

export function CardContextMenu({ children }: CardContextMenuProps) {
  const {
    coverStyle,
    setCoverStyle,
    showTitles,
    setShowTitles,
    compactMode,
    setCompactMode,
  } = useCoverStyle();

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => setShowTitles(!showTitles)}>
          <Type />
          Show Titles
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setCompactMode(!compactMode)}>
          <LayoutGrid />
          Compact Mode
        </ContextMenuItem>

        <ContextMenuItem>
          <Trash2 />
          Remove series
        </ContextMenuItem>

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
              <ContextMenuRadioItem value="default">
                Default
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="border">Border</ContextMenuRadioItem>
              <ContextMenuRadioItem value="rounded">
                Rounded
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="shadow">Shadow</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
