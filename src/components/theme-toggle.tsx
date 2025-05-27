import {
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8"
      onClick={() => {
        theme === "dark" && setTheme("light");
        theme === "light" && setTheme("system");
        theme === "system" && setTheme("dark");
      }}
    >
      {theme === "light" && <SunIcon className="size-4" />}
      {theme === "dark" && <MoonIcon className="size-4" />}
      {theme === "system" &&
        (isMobile ? (
          <DevicePhoneMobileIcon />
        ) : (
          <ComputerDesktopIcon className="size-4" />
        ))}

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
