import { useCoverStyle } from "@/hooks/settings/use-cover-style";
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
} from "../ui/context-menu";
import { useShowTitles } from "@/hooks/settings/use-show-titles";

interface CardContextMenuProps {
  id?: string;
  children?: React.ReactNode;
}

export function CardContextMenu({ children }: CardContextMenuProps) {
  const { coverStyle, setCoverStyle } = useCoverStyle();
  const { showTitles, setShowTitles } = useShowTitles();

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
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
