type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

interface SourceInstance {
  homesection(): Promise<Result<HomePage>>;
  search(query: string): Promise<Result<MangaEntry[]>>;
  getManga(id: string): Promise<Result<Manga>>;
  settings: SourceSettings[];
  metadata: SourceMetadata;
}

interface SourceMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  iconUrl: string;
  sourceUrl: string;
  downloadUrl: string;
  tags: string[];
}

interface SourceSettings<T extends SettingsType = SettingsType> {
  name: string;
  description: string;
  type: T;
  default: SettingsValueMap[T];
}

interface HomePage {
  sections: HomeSection[];
}

enum HomeSectionType {
  singleRowNormal = "singleRowNormal",
  singleRowLarge = "singleRowLarge",
  doubleRow = "doubleRow",
  featured = "featured",
}

enum SettingsType {
  select = "select",
  switch = "switch",
  slider = "slider",
  input = "input",
  color = "color",
  folder = "folder",
  stepper = "stepper",
}

type SettingsValueMap = {
  select: string;
  switch: boolean;
  slider: number;
  input: string;
  color: string;
  folder: string;
  stepper: number;
};

interface HomeSection {
  id: string;
  title: string;
  items: MangaEntry[];
  type: HomeSectionType;
}

interface Manga {}
interface MangaEntry {}
