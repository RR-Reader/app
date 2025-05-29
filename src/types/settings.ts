import {
  Paintbrush,
  BookOpen,
  Library,
  HardDrive,
  Settings as SettingsIcon,
  FlaskRound,
  LucideIcon,
} from "lucide-react";

type SettingType =
  | "select"
  | "switch"
  | "slider"
  | "input"
  | "color"
  | "folder";

export interface SettingOption {
  value: string;
  label: string;
}

export interface Setting {
  key: string;
  title: string;
  description?: string;
  type: SettingType;
  options?: SettingOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  defaultValue?: any;
  storeKey?: string;
}

export interface SettingSection {
  key: string;
  title: string;
  icon: LucideIcon;
  settings: Setting[];
}

export const settingsConfig: SettingSection[] = [
  {
    key: "layoutAppearance",
    title: "Layout & Appearance",
    icon: Paintbrush,
    settings: [
      {
        key: "gridSize",
        title: "Grid Size",
        type: "select",
        options: [
          { value: "6", label: "6" },
          { value: "8", label: "8" },
          { value: "12", label: "12" },
          { value: "16", label: "16" },
        ],
        defaultValue: "12",
        storeKey: "layout",
      },
      {
        key: "theme",
        title: "Theme",
        type: "select",
        options: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ],
        defaultValue: "system",
        storeKey: "theme",
      },
      {
        key: "coverStyle",
        title: "Cover Style",
        type: "select",
        options: [
          { value: "rounded", label: "Rounded" },
          { value: "square", label: "Square" },
          { value: "border", label: "Border" },
          { value: "shadow", label: "Shadow" },
        ],
        defaultValue: "rounded",
        storeKey: "layout",
      },
      {
        key: "showTitles",
        title: "Show titles under covers",
        type: "switch",
        defaultValue: true,
        storeKey: "layout",
      },
      {
        key: "compactMode",
        title: "Compact Mode",
        description: "Smaller margins and fonts",
        type: "switch",
        defaultValue: false,
        storeKey: "layout",
      },
      {
        key: "showReadIndicators",
        title: "Show/hide read/unread indicators",
        type: "switch",
        defaultValue: true,
        storeKey: "layout",
      },
    ],
  },
  {
    key: "readerPreferences",
    title: "Reader Preferences",
    icon: BookOpen,
    settings: [
      {
        key: "pageLayout",
        title: "Page Layout",
        type: "select",
        options: [
          { value: "single-page", label: "Single page" },
          { value: "double-page", label: "Double page" },
          { value: "vertical-scroll", label: "Vertical scroll" },
        ],
        defaultValue: "single-page",
        storeKey: "reader",
      },
      {
        key: "zoomBehavior",
        title: "Zoom Behavior",
        type: "select",
        options: [
          { value: "fit-width", label: "Fit width" },
          { value: "fit-height", label: "Fit height" },
          { value: "manual", label: "Manual" },
        ],
        defaultValue: "fit-width",
        storeKey: "reader",
      },
      {
        key: "readingDirection",
        title: "Default Reading Direction",
        type: "select",
        options: [
          { value: "ltr", label: "Left-to-right" },
          { value: "rtl", label: "Right-to-left" },
        ],
        defaultValue: "ltr",
        storeKey: "reader",
      },
      {
        key: "rememberZoom",
        title: "Remember last zoom level",
        type: "switch",
        defaultValue: true,
        storeKey: "reader",
      },
      {
        key: "showPageNumbers",
        title: "Show page numbers",
        type: "switch",
        defaultValue: true,
        storeKey: "reader",
      },
      {
        key: "backgroundColor",
        title: "Background Color",
        type: "select",
        options: [
          { value: "black", label: "Black" },
          { value: "white", label: "White" },
          { value: "sepia", label: "Sepia" },
          { value: "custom", label: "Custom" },
        ],
        defaultValue: "black",
        storeKey: "reader",
      },
      {
        key: "preloadNext",
        title: "Preload next chapter",
        type: "switch",
        defaultValue: true,
        storeKey: "reader",
      },
    ],
  },
  {
    key: "libraryHistory",
    title: "Library & History",
    icon: Library,
    settings: [
      {
        key: "enableHistory",
        title: "Enable read history",
        type: "switch",
        defaultValue: true,
        storeKey: "library",
      },
      {
        key: "maxHistoryEntries",
        title: "Max read history entries",
        type: "select",
        options: [
          { value: "50", label: "50" },
          { value: "100", label: "100" },
          { value: "unlimited", label: "Unlimited" },
        ],
        defaultValue: "100",
        storeKey: "library",
      },
      {
        key: "showRecentlyRead",
        title: "Show recently read section on home",
        type: "switch",
        defaultValue: true,
        storeKey: "library",
      },
      {
        key: "defaultLibraryView",
        title: "Default library view",
        type: "select",
        options: [
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ],
        defaultValue: "grid",
        storeKey: "library",
      },
    ],
  },
  {
    key: "storageCaching",
    title: "Storage & Caching",
    icon: HardDrive,
    settings: [
      {
        key: "maxCacheSize",
        title: "Maximum cache size",
        type: "select",
        options: [
          { value: "500", label: "500MB" },
          { value: "1000", label: "1GB" },
          { value: "2000", label: "2GB" },
          { value: "unlimited", label: "Unlimited" },
        ],
        defaultValue: "1000",
        storeKey: "storage",
      },
      {
        key: "clearCacheOnClose",
        title: "Clear cache on close",
        type: "switch",
        defaultValue: false,
        storeKey: "storage",
      },
      {
        key: "imageQuality",
        title: "Image quality level",
        type: "select",
        options: [
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ],
        defaultValue: "high",
        storeKey: "storage",
      },
      {
        key: "downloadPath",
        title: "Download path location",
        type: "folder",
        placeholder: "Select folder...",
        storeKey: "storage",
      },
    ],
  },
  {
    key: "systemBehavior",
    title: "System & Behavior",
    icon: SettingsIcon,
    settings: [
      {
        key: "checkNewChapters",
        title: "Check for new chapters on startup",
        type: "switch",
        defaultValue: true,
        storeKey: "system",
      },
      {
        key: "autoRefreshCategory",
        title: "Auto-refresh category when focused",
        type: "switch",
        defaultValue: false,
        storeKey: "system",
      },
      {
        key: "confirmRemoval",
        title: "Confirm before removing manga",
        type: "switch",
        defaultValue: true,
        storeKey: "system",
      },
      {
        key: "enableNotifications",
        title: "Enable notifications",
        description: "New chapter added",
        type: "switch",
        defaultValue: true,
        storeKey: "system",
      },
    ],
  },
  {
    key: "experimental",
    title: "Experimental",
    icon: FlaskRound,
    settings: [
      {
        key: "enableCustomSources",
        title: "Enable custom sources",
        type: "switch",
        defaultValue: false,
        storeKey: "experimental",
      },
      {
        key: "enableDebugLogging",
        title: "Enable debug logging",
        type: "switch",
        defaultValue: false,
        storeKey: "experimental",
      },
      {
        key: "showFpsCounter",
        title: "Show FPS counter in reader",
        description: "For performance testing",
        type: "switch",
        defaultValue: false,
        storeKey: "experimental",
      },
      {
        key: "hardwareAcceleration",
        title: "Use hardware acceleration for images",
        type: "switch",
        defaultValue: true,
        storeKey: "experimental",
      },
    ],
  },
];
