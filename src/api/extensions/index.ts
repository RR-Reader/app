import {
  BaseDirectory,
  writeTextFile,
  readTextFile,
  exists,
  readDir,
  mkdir,
} from "@tauri-apps/plugin-fs";
import type { SourceProvider } from "@torigen/mounter";

interface ExtensionManifest {
  extensions: ExtensionInfo[];
}

interface ExtensionInfo {
  id: string;
  name: string;
  iconUrl: string;
  baseUrl: string;
  version?: string;
  author?: string;
  description?: string;
  enabled: boolean;
}

interface LoadedExtension {
  info: ExtensionInfo;
  source: SourceProvider;
  directoryPath: string;
}

class ExtensionsService {
  private static readonly EXTENSIONS_DIR = "extensions";
  private static readonly MANIFEST_FILE = "manifest.json";
  private static loadedExtensions: Map<string, LoadedExtension> = new Map();

  static async ensureExtensionsDirectory(): Promise<void> {
    const dirExists = await exists(ExtensionsService.EXTENSIONS_DIR, {
      baseDir: BaseDirectory.AppData,
    });

    if (!dirExists) {
      await mkdir(ExtensionsService.EXTENSIONS_DIR, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });

      const defaultManifest: ExtensionManifest = {
        extensions: [],
      };

      await writeTextFile(
        `${ExtensionsService.EXTENSIONS_DIR}/${ExtensionsService.MANIFEST_FILE}`,
        JSON.stringify(defaultManifest, null, 2),
        {
          baseDir: BaseDirectory.AppData,
        },
      );
    }
  }

  static async loadExtensions(): Promise<LoadedExtension[]> {
    await ExtensionsService.ensureExtensionsDirectory();
    const loadedExtensions: LoadedExtension[] = [];

    try {
      const extensionDirs = await readDir(ExtensionsService.EXTENSIONS_DIR, {
        baseDir: BaseDirectory.AppData,
      });

      for (const dir of extensionDirs) {
        if (dir.isDirectory && dir.name !== ExtensionsService.MANIFEST_FILE) {
          try {
            const extension = await ExtensionsService.loadSingleExtension(
              dir.name,
            );
            if (extension) {
              loadedExtensions.push(extension);
              ExtensionsService.loadedExtensions.set(
                extension.info.id,
                extension,
              );
            }
          } catch (error) {
            console.error(`Failed to load extension ${dir.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load extensions:", error);
    }

    await ExtensionsService.updateManifestFromLoaded(loadedExtensions);

    return loadedExtensions;
  }

  private static async loadSingleExtension(
    dirName: string,
  ): Promise<LoadedExtension | null> {
    const extensionPath = `${ExtensionsService.EXTENSIONS_DIR}/${dirName}`;
    const indexPath = `${extensionPath}/index.ts`;

    const indexExists = await exists(indexPath, {
      baseDir: BaseDirectory.AppData,
    });

    if (!indexExists) {
      console.warn(`Extension ${dirName} missing index.ts file`);
      return null;
    }

    try {
      const sourceProvider =
        await ExtensionsService.importExtension(extensionPath);

      if (
        !sourceProvider ||
        !ExtensionsService.isValidSourceProvider(sourceProvider)
      ) {
        console.error(
          `Extension ${dirName} does not export a valid SourceProvider`,
        );
        return null;
      }

      const extensionInfo: ExtensionInfo = {
        id: sourceProvider.info.id,
        name: sourceProvider.info.name,
        iconUrl: sourceProvider.info.iconUrl,
        baseUrl: sourceProvider.info.baseUrl,
        enabled: true,
      };

      return {
        info: extensionInfo,
        source: sourceProvider,
        directoryPath: extensionPath,
      };
    } catch (error) {
      console.error(`Failed to load extension ${dirName}:`, error);
      return null;
    }
  }

  private static async importExtension(
    extensionPath: string,
  ): Promise<SourceProvider | null> {
    try {
      const { appDataDir } = await import("@tauri-apps/api/path");
      const appData = await appDataDir();
      const absolutePath = `${appData}/${extensionPath}/index.ts`;

      const fileUrl = `file://${absolutePath}`;
      const extensionModule = await import(fileUrl);

      return extensionModule.default;
    } catch (error) {
      console.error(`Failed to import extension from ${extensionPath}:`, error);
      return null;
    }
  }

  static async loadManifest(): Promise<ExtensionManifest> {
    await ExtensionsService.ensureExtensionsDirectory();

    try {
      const manifestPath = `${ExtensionsService.EXTENSIONS_DIR}/${ExtensionsService.MANIFEST_FILE}`;
      const content = await readTextFile(manifestPath, {
        baseDir: BaseDirectory.AppData,
      });
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to load extensions manifest:", error);
      return { extensions: [] };
    }
  }

  private static async updateManifestFromLoaded(
    extensions: LoadedExtension[],
  ): Promise<void> {
    try {
      const manifest = await ExtensionsService.loadManifest();
      for (const extension of extensions) {
        const existingIndex = manifest.extensions.findIndex(
          (ext) => ext.id === extension.info.id,
        );

        if (existingIndex >= 0) {
          manifest.extensions[existingIndex] = {
            ...extension.info,
            enabled: manifest.extensions[existingIndex].enabled,
          };
        } else {
          manifest.extensions.push(extension.info);
        }
      }

      const loadedIds = new Set(extensions.map((ext) => ext.info.id));
      manifest.extensions = manifest.extensions.filter((ext) =>
        loadedIds.has(ext.id),
      );

      const manifestPath = `${ExtensionsService.EXTENSIONS_DIR}/${ExtensionsService.MANIFEST_FILE}`;
      await writeTextFile(manifestPath, JSON.stringify(manifest, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
    } catch (error) {
      console.error("Failed to update extensions manifest:", error);
    }
  }

  static async toggleExtension(
    extensionId: string,
    enabled: boolean,
  ): Promise<void> {
    try {
      const manifest = await ExtensionsService.loadManifest();
      const extensionIndex = manifest.extensions.findIndex(
        (ext) => ext.id === extensionId,
      );

      if (extensionIndex >= 0) {
        manifest.extensions[extensionIndex].enabled = enabled;

        const manifestPath = `${ExtensionsService.EXTENSIONS_DIR}/${ExtensionsService.MANIFEST_FILE}`;
        await writeTextFile(manifestPath, JSON.stringify(manifest, null, 2), {
          baseDir: BaseDirectory.AppData,
        });
      }
    } catch (error) {
      console.error(`Failed to toggle extension ${extensionId}:`, error);
      throw error;
    }
  }

  static getLoadedExtension(extensionId: string): LoadedExtension | undefined {
    return ExtensionsService.loadedExtensions.get(extensionId);
  }

  static getEnabledExtensions(): LoadedExtension[] {
    return Array.from(ExtensionsService.loadedExtensions.values()).filter(
      (ext) => ext.info.enabled,
    );
  }

  static getAllLoadedExtensions(): LoadedExtension[] {
    return Array.from(ExtensionsService.loadedExtensions.values());
  }

  private static isValidSourceProvider(obj: any): obj is SourceProvider {
    return (
      obj &&
      typeof obj === "object" &&
      obj.info &&
      typeof obj.info.id === "string" &&
      typeof obj.info.name === "string" &&
      typeof obj.info.baseUrl === "string" &&
      obj.capabilities &&
      typeof obj.capabilities === "object" &&
      typeof obj.getHomepage === "function" &&
      typeof obj.getMangaDetails === "function" &&
      typeof obj.getChapters === "function"
    );
  }

  static async createExtensionTemplate(extensionId: string): Promise<void> {
    const extensionPath = `${ExtensionsService.EXTENSIONS_DIR}/${extensionId}`;

    await mkdir(extensionPath, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });

    const templateCode = `import type {
  SourceProvider,
  SourceInfo,
  SourceCapabilities,
  Section,
  Manga,
  ChapterEntry,
  Chapter,
  PagedResults,
  SearchRequest,
  Tag,
} from "@torigen/mounter";

class ${extensionId.charAt(0).toUpperCase() + extensionId.slice(1)}Source implements SourceProvider {
  readonly info: SourceInfo = {
    id: "${extensionId}",
    name: "Your Source Name",
    iconUrl: "https://example.com/favicon.ico",
    baseUrl: "https://example.com",
  };

  readonly capabilities: SourceCapabilities = {
    supportsHomepage: true,
    supportsSearch: true,
    supportsViewMore: false,
    supportIncludeTags: false,
    supportExcludeTags: false,
    supportPagination: false,
  };

  async getHomepage(): Promise<Section[]> {
    // Implement homepage logic
    return [];
  }

  async getMangaDetails(id: string): Promise<Manga> {
    // Implement manga details logic
    throw new Error("Not implemented");
  }

  async getChapters(mangaId: string): Promise<ChapterEntry[]> {
    // Implement chapters logic
    return [];
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<Chapter> {
    // Implement chapter details logic
    throw new Error("Not implemented");
  }

  async getSearchResults(query: SearchRequest): Promise<PagedResults> {
    // Implement search logic
    return {
      results: [],
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 32,
      offset: 0,
    };
  }

  async getSearchTags(): Promise<Tag[]> {
    // Implement tags logic
    return [];
  }
}

const source = new ${extensionId.charAt(0).toUpperCase() + extensionId.slice(1)}Source();
export default source;
`;

    await writeTextFile(`${extensionPath}/index.ts`, templateCode, {
      baseDir: BaseDirectory.AppData,
    });
  }
}

export { ExtensionsService };
export type { ExtensionManifest, ExtensionInfo, LoadedExtension };
