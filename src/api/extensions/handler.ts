import {
  BaseDirectory,
  writeTextFile,
  readTextFile,
  exists,
  readDir,
  mkdir,
} from "@tauri-apps/plugin-fs";
import { fetch } from "@tauri-apps/plugin-http";
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
  source: "local" | "remote";
  sourceUrl?: string;
  lastUpdated?: string;
}

interface RemoteSourcesList {
  sources: RemoteSourceInfo[];
  version: string;
  lastUpdated: string;
}

interface RemoteSourceInfo {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  iconUrl: string;
  baseUrl: string;
  sourceUrl: string;
  tags?: string[];
  minAppVersion?: string;
}

interface LoadedExtension {
  info: ExtensionInfo;
  source: SourceProvider;
  directoryPath?: string;
}

class ExtensionsService {
  private static readonly EXTENSIONS_DIR = "extensions";
  private static readonly MANIFEST_FILE = "manifest.json";
  private static readonly REMOTE_CACHE_DIR = "remote-extensions";
  private static readonly SOURCES_LIST_URL =
    "https://raw.githubusercontent.com/Torigen-manga/sources/refs/heads/main/sources.json";
  private static loadedExtensions: Map<string, LoadedExtension> = new Map();
  private static remoteSourcesList: RemoteSourcesList | null = null;

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

    const remoteCacheExists = await exists(ExtensionsService.REMOTE_CACHE_DIR, {
      baseDir: BaseDirectory.AppData,
    });

    if (!remoteCacheExists) {
      await mkdir(ExtensionsService.REMOTE_CACHE_DIR, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });
    }
  }

  static async fetchRemoteSourcesList(): Promise<RemoteSourcesList> {
    try {
      const response = await fetch(ExtensionsService.SOURCES_LIST_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch sources list: ${response.status}`);
      }

      const sourcesList: RemoteSourcesList = await response.json();
      ExtensionsService.remoteSourcesList = sourcesList;

      await writeTextFile(
        `${ExtensionsService.REMOTE_CACHE_DIR}/sources-list.json`,
        JSON.stringify(sourcesList, null, 2),
        { baseDir: BaseDirectory.AppData },
      );

      return sourcesList;
    } catch (error) {
      console.error("Failed to fetch remote sources list:", error);

      try {
        const cachedContent = await readTextFile(
          `${ExtensionsService.REMOTE_CACHE_DIR}/sources-list.json`,
          { baseDir: BaseDirectory.AppData },
        );
        return JSON.parse(cachedContent);
      } catch (cacheError) {
        console.error("Failed to load cached sources list:", cacheError);
        return {
          sources: [],
          version: "0.0.0",
          lastUpdated: new Date().toISOString(),
        };
      }
    }
  }

  static async getAvailableRemoteSources(): Promise<RemoteSourceInfo[]> {
    if (!ExtensionsService.remoteSourcesList) {
      await ExtensionsService.fetchRemoteSourcesList();
    }
    return ExtensionsService.remoteSourcesList?.sources || [];
  }

  static async installRemoteExtension(
    remoteSource: RemoteSourceInfo,
  ): Promise<LoadedExtension> {
    try {
      const response = await fetch(remoteSource.sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to download extension: ${response.status}`);
      }

      const extensionCode = await response.text();

      const cacheFileName = `${remoteSource.id}.ts`;
      const cachePath = `${ExtensionsService.REMOTE_CACHE_DIR}/${cacheFileName}`;

      await writeTextFile(cachePath, extensionCode, {
        baseDir: BaseDirectory.AppData,
      });

      const sourceProvider =
        await ExtensionsService.importRemoteExtension(cachePath);

      if (
        !sourceProvider ||
        !ExtensionsService.isValidSourceProvider(sourceProvider)
      ) {
        throw new Error(
          `Downloaded extension ${remoteSource.id} is not a valid SourceProvider`,
        );
      }

      const extensionInfo: ExtensionInfo = {
        id: remoteSource.id,
        name: remoteSource.name,
        iconUrl: remoteSource.iconUrl,
        baseUrl: remoteSource.baseUrl,
        version: remoteSource.version,
        author: remoteSource.author,
        description: remoteSource.description,
        enabled: true,
        source: "remote",
        sourceUrl: remoteSource.sourceUrl,
        lastUpdated: new Date().toISOString(),
      };

      const loadedExtension: LoadedExtension = {
        info: extensionInfo,
        source: sourceProvider,
      };

      ExtensionsService.loadedExtensions.set(remoteSource.id, loadedExtension);

      await ExtensionsService.addExtensionToManifest(extensionInfo);

      return loadedExtension;
    } catch (error) {
      console.error(
        `Failed to install remote extension ${remoteSource.id}:`,
        error,
      );
      throw error;
    }
  }

  static async updateRemoteExtension(
    extensionId: string,
  ): Promise<LoadedExtension> {
    const manifest = await ExtensionsService.loadManifest();
    const extensionInfo = manifest.extensions.find(
      (ext) => ext.id === extensionId && ext.source === "remote",
    );

    if (!extensionInfo || !extensionInfo.sourceUrl) {
      throw new Error(
        `Remote extension ${extensionId} not found or missing source URL`,
      );
    }

    const remoteSources = await ExtensionsService.getAvailableRemoteSources();
    const remoteSource = remoteSources.find(
      (source) => source.id === extensionId,
    );

    if (!remoteSource) {
      throw new Error(`Remote source ${extensionId} not found in sources list`);
    }

    if (extensionInfo.version === remoteSource.version) {
      console.log(`Extension ${extensionId} is already up to date`);
      return ExtensionsService.loadedExtensions.get(extensionId)!;
    }

    await ExtensionsService.uninstallRemoteExtension(extensionId);
    return await ExtensionsService.installRemoteExtension(remoteSource);
  }

  static async uninstallRemoteExtension(extensionId: string): Promise<void> {
    ExtensionsService.loadedExtensions.delete(extensionId);

    const cacheFileName = `${extensionId}.ts`;
    const cachePath = `${ExtensionsService.REMOTE_CACHE_DIR}/${cacheFileName}`;

    try {
      const fileExists = await exists(cachePath, {
        baseDir: BaseDirectory.AppData,
      });
      if (fileExists) {
        // TODO: We'd need to implement file deletion in Tauri
      }
    } catch (error) {
      console.error(`Failed to delete cached extension file: ${error}`);
    }

    await ExtensionsService.removeExtensionFromManifest(extensionId);
  }

  private static async importRemoteExtension(
    cachePath: string,
  ): Promise<SourceProvider | null> {
    try {
      const extensionCode = await readTextFile(cachePath, {
        baseDir: BaseDirectory.AppData,
      });

      const dataUrl = `data:text/javascript;base64,${btoa(extensionCode)}`;
      const extensionModule = await import(dataUrl);

      return extensionModule.default;
    } catch (error) {
      console.error(
        `Failed to import remote extension from ${cachePath}:`,
        error,
      );
      return null;
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
            const extension = await ExtensionsService.loadSingleLocalExtension(
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
            console.error(`Failed to load local extension ${dir.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load local extensions:", error);
    }

    try {
      const manifest = await ExtensionsService.loadManifest();
      const remoteExtensions = manifest.extensions.filter(
        (ext) => ext.source === "remote",
      );

      for (const remoteExt of remoteExtensions) {
        try {
          const cacheFileName = `${remoteExt.id}.ts`;
          const cachePath = `${ExtensionsService.REMOTE_CACHE_DIR}/${cacheFileName}`;

          const cacheExists = await exists(cachePath, {
            baseDir: BaseDirectory.AppData,
          });
          if (cacheExists) {
            const sourceProvider =
              await ExtensionsService.importRemoteExtension(cachePath);
            if (
              sourceProvider &&
              ExtensionsService.isValidSourceProvider(sourceProvider)
            ) {
              const loadedExtension: LoadedExtension = {
                info: remoteExt,
                source: sourceProvider,
              };
              loadedExtensions.push(loadedExtension);
              ExtensionsService.loadedExtensions.set(
                remoteExt.id,
                loadedExtension,
              );
            }
          }
        } catch (error) {
          console.error(
            `Failed to load remote extension ${remoteExt.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error("Failed to load remote extensions:", error);
    }

    return loadedExtensions;
  }

  private static async loadSingleLocalExtension(
    dirName: string,
  ): Promise<LoadedExtension | null> {
    const extensionPath = `${ExtensionsService.EXTENSIONS_DIR}/${dirName}`;
    const indexPath = `${extensionPath}/index.ts`;

    const indexExists = await exists(indexPath, {
      baseDir: BaseDirectory.AppData,
    });

    if (!indexExists) {
      console.warn(`Local extension ${dirName} missing index.ts file`);
      return null;
    }

    try {
      const sourceProvider =
        await ExtensionsService.importLocalExtension(extensionPath);

      if (
        !sourceProvider ||
        !ExtensionsService.isValidSourceProvider(sourceProvider)
      ) {
        console.error(
          `Local extension ${dirName} does not export a valid SourceProvider`,
        );
        return null;
      }

      const extensionInfo: ExtensionInfo = {
        id: sourceProvider.info.id,
        name: sourceProvider.info.name,
        iconUrl: sourceProvider.info.iconUrl,
        baseUrl: sourceProvider.info.baseUrl,
        enabled: true,
        source: "local",
      };

      return {
        info: extensionInfo,
        source: sourceProvider,
        directoryPath: extensionPath,
      };
    } catch (error) {
      console.error(`Failed to load local extension ${dirName}:`, error);
      return null;
    }
  }

  private static async importLocalExtension(
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
      console.error(
        `Failed to import local extension from ${extensionPath}:`,
        error,
      );
      return null;
    }
  }

  private static async addExtensionToManifest(
    extensionInfo: ExtensionInfo,
  ): Promise<void> {
    try {
      const manifest = await ExtensionsService.loadManifest();
      const existingIndex = manifest.extensions.findIndex(
        (ext) => ext.id === extensionInfo.id,
      );

      if (existingIndex >= 0) {
        manifest.extensions[existingIndex] = extensionInfo;
      } else {
        manifest.extensions.push(extensionInfo);
      }

      const manifestPath = `${ExtensionsService.EXTENSIONS_DIR}/${ExtensionsService.MANIFEST_FILE}`;
      await writeTextFile(manifestPath, JSON.stringify(manifest, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
    } catch (error) {
      console.error("Failed to add extension to manifest:", error);
      throw error;
    }
  }

  private static async removeExtensionFromManifest(
    extensionId: string,
  ): Promise<void> {
    try {
      const manifest = await ExtensionsService.loadManifest();
      manifest.extensions = manifest.extensions.filter(
        (ext) => ext.id !== extensionId,
      );

      const manifestPath = `${ExtensionsService.EXTENSIONS_DIR}/${ExtensionsService.MANIFEST_FILE}`;
      await writeTextFile(manifestPath, JSON.stringify(manifest, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
    } catch (error) {
      console.error("Failed to remove extension from manifest:", error);
      throw error;
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

        const loadedExtension =
          ExtensionsService.loadedExtensions.get(extensionId);
        if (loadedExtension) {
          loadedExtension.info.enabled = enabled;
        }
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
export type {
  ExtensionManifest,
  ExtensionInfo,
  LoadedExtension,
  RemoteSourcesList,
  RemoteSourceInfo,
};
