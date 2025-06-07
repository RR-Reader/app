type ExtensionManager = {
  extensions: Extension[];
};

interface Extension {
  name: string;
  slug: string;
  version: string;
  repository: string;
  metadata?: ExtensionMetadata;
}

interface ExtensionMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage_url: string;
  icon_url: string;
  language: Language;
  intents: string[];
  content_rating: string;
  capabilities: Capabilities;
  settings: Setting[];
}

interface Language {
  key: string;
  name: string;
  flag_code: string;
  iso639_1: string;
}

interface Capabilities {
  search: boolean;
  home_sections: boolean;
  manga_details: boolean;
  chapter_reading: boolean;
  manga_tracking: boolean;
}

interface Setting {
  key: string;
  name: string;
  description: string;
  type: string;
  default: any;
}

export type {
  ExtensionManager,
  ExtensionMetadata,
  Extension,
  Language,
  Capabilities,
  Setting,
};
