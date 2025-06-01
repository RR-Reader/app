import { useGrid } from "@/hooks/settings/use-grid";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu";

export function ExploreContextMenu({ children }: { children: React.ReactNode }) {
  const { grid, setGrid } = useGrid();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Settings</ContextMenuLabel>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Grid Columns</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuRadioGroup
              value={grid.toString()}
              onValueChange={(value) => setGrid(Number(value))}
            >
              <ContextMenuRadioItem value="6">6</ContextMenuRadioItem>
              <ContextMenuRadioItem value="8">8</ContextMenuRadioItem>
              <ContextMenuRadioItem value="12">12</ContextMenuRadioItem>
              <ContextMenuRadioItem value="16">16</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
