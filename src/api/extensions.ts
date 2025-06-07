import { Extension, ExtensionManager, Setting } from "@/types/extensions";
import { invoke } from "@tauri-apps/api/core";

interface ExtensionsAPI {
  loadExtensions: () => Promise<ExtensionManager>;
  addExtension: (
    name: string,
    slug: string,
    version: string,
    repository: string,
  ) => Promise<void>;
  removeExtension: (slug: string) => Promise<void>;
  getExtension: (slug: string) => Promise<Extension | null>;
  extensionExists: (slug: string) => Promise<boolean>;
  updateExtension: (
    slug: string,
    version?: string,
    repository?: string,
  ) => Promise<void>;
  listExtensions: () => Promise<Extension[]>;
  refreshExtensionMetadata: (slug: string) => Promise<void>;
  refreshAllMetadata: () => Promise<void>;
  getExtensionsByCapability: (capability: string) => Promise<Extension[]>;
  getExtensionsByLanguage: (languageKey: string) => Promise<Extension[]>;
  validateExtensionStructure: (slug: string) => Promise<boolean>;
}

class ExtensionsAPIImpl implements ExtensionsAPI {
  async loadExtensions(): Promise<ExtensionManager> {
    try {
      console.log("Loading extensions...");
      const result = await invoke<ExtensionManager>("load_extensions");
      console.log("Extensions loaded successfully:", result);
      return result;
    } catch (error) {
      console.error("Extensions load error:", error);
      throw new Error(`Failed to load extensions: ${error}`);
    }
  }

  async addExtension(
    name: string,
    slug: string,
    version: string,
    repository: string,
  ): Promise<void> {
    if (
      !name?.trim() ||
      !slug?.trim() ||
      !version?.trim() ||
      !repository?.trim()
    ) {
      throw new Error("Name, slug, version, and repository are all required");
    }

    try {
      await invoke("add_extension", {
        name: name.trim(),
        slug: slug.trim(),
        version: version.trim(),
        repository: repository.trim(),
      });
    } catch (error) {
      throw new Error(`Failed to add extension '${slug}': ${error}`);
    }
  }

  async removeExtension(slug: string): Promise<void> {
    if (!slug?.trim()) {
      throw new Error("Extension slug is required");
    }

    try {
      await invoke("remove_extension", { slug: slug.trim() });
    } catch (error) {
      throw new Error(`Failed to remove extension '${slug}': ${error}`);
    }
  }

  async getExtension(slug: string): Promise<Extension | null> {
    if (!slug?.trim()) {
      throw new Error("Extension slug is required");
    }

    try {
      return await invoke<Extension | null>("get_extension", {
        slug: slug.trim(),
      });
    } catch (error) {
      throw new Error(`Failed to get extension '${slug}': ${error}`);
    }
  }

  async extensionExists(slug: string): Promise<boolean> {
    if (!slug?.trim()) {
      throw new Error("Extension slug is required");
    }

    try {
      return await invoke<boolean>("extension_exists", {
        slug: slug.trim(),
      });
    } catch (error) {
      throw new Error(
        `Failed to check if extension '${slug}' exists: ${error}`,
      );
    }
  }

  async updateExtension(
    slug: string,
    version?: string,
    repository?: string,
  ): Promise<void> {
    if (!slug?.trim()) {
      throw new Error("Extension slug is required");
    }

    if (!version && !repository) {
      throw new Error("At least one of version or repository must be provided");
    }

    try {
      await invoke("update_extension", {
        slug: slug.trim(),
        version: version?.trim() || null,
        repository: repository?.trim() || null,
      });
    } catch (error) {
      throw new Error(`Failed to update extension '${slug}': ${error}`);
    }
  }

  async listExtensions(): Promise<Extension[]> {
    try {
      return await invoke<Extension[]>("list_extensions");
    } catch (error) {
      throw new Error(`Failed to list extensions: ${error}`);
    }
  }

  async refreshExtensionMetadata(slug: string): Promise<void> {
    if (!slug?.trim()) {
      throw new Error("Extension slug is required");
    }

    try {
      await invoke("refresh_extension_metadata", { slug: slug.trim() });
    } catch (error) {
      throw new Error(
        `Failed to refresh metadata for extension '${slug}': ${error}`,
      );
    }
  }

  async refreshAllMetadata(): Promise<void> {
    try {
      await invoke("refresh_all_metadata");
    } catch (error) {
      throw new Error(`Failed to refresh all extension metadata: ${error}`);
    }
  }

  async getExtensionsByCapability(capability: string): Promise<Extension[]> {
    if (!capability?.trim()) {
      throw new Error("Capability is required");
    }

    const validCapabilities = [
      "search",
      "home_sections",
      "manga_details",
      "chapter_reading",
      "manga_tracking",
    ];

    if (!validCapabilities.includes(capability.trim())) {
      throw new Error(
        `Invalid capability. Must be one of: ${validCapabilities.join(", ")}`,
      );
    }

    try {
      return await invoke<Extension[]>("get_extensions_by_capability", {
        capability: capability.trim(),
      });
    } catch (error) {
      throw new Error(
        `Failed to get extensions by capability '${capability}': ${error}`,
      );
    }
  }

  async getExtensionsByLanguage(languageKey: string): Promise<Extension[]> {
    if (!languageKey?.trim()) {
      throw new Error("Language key is required");
    }

    try {
      return await invoke<Extension[]>("get_extensions_by_language", {
        languageKey: languageKey.trim(),
      });
    } catch (error) {
      throw new Error(
        `Failed to get extensions by language '${languageKey}': ${error}`,
      );
    }
  }

  async validateExtensionStructure(slug: string): Promise<boolean> {
    if (!slug?.trim()) {
      throw new Error("Extension slug is required");
    }

    try {
      return await invoke<boolean>("validate_extension_structure", {
        slug: slug.trim(),
      });
    } catch (error) {
      throw new Error(
        `Failed to validate extension structure for '${slug}': ${error}`,
      );
    }
  }
}

export class ExtensionHelpers {
  static hasCapability(extension: Extension, capability: string): boolean {
    if (!extension.metadata) return false;

    switch (capability) {
      case "search":
        return extension.metadata.capabilities.search;
      case "home_sections":
        return extension.metadata.capabilities.home_sections;
      case "manga_details":
        return extension.metadata.capabilities.manga_details;
      case "chapter_reading":
        return extension.metadata.capabilities.chapter_reading;
      case "manga_tracking":
        return extension.metadata.capabilities.manga_tracking;
      default:
        return false;
    }
  }

  static supportsLanguage(extension: Extension, languageKey: string): boolean {
    if (!extension.metadata) return false;
    return (
      extension.metadata.language.key === languageKey ||
      extension.metadata.language.key === "Multi"
    );
  }

  static getSetting(extension: Extension, key: string): Setting | undefined {
    if (!extension.metadata) return undefined;
    return extension.metadata.settings.find((setting) => setting.key === key);
  }

  static getCapabilities(extension: Extension): string[] {
    if (!extension.metadata) return [];

    const capabilities: string[] = [];
    const caps = extension.metadata.capabilities;

    if (caps.search) capabilities.push("search");
    if (caps.home_sections) capabilities.push("home_sections");
    if (caps.manga_details) capabilities.push("manga_details");
    if (caps.chapter_reading) capabilities.push("chapter_reading");
    if (caps.manga_tracking) capabilities.push("manga_tracking");

    return capabilities;
  }

  static isValidExtension(extension: Extension): boolean {
    return !!(
      extension.name?.trim() &&
      extension.slug?.trim() &&
      extension.version?.trim() &&
      extension.repository?.trim()
    );
  }

  static filterExtensionsByCapabilities(
    extensions: Extension[],
    requiredCapabilities: string[],
  ): Extension[] {
    return extensions.filter((extension) =>
      requiredCapabilities.every((capability) =>
        this.hasCapability(extension, capability),
      ),
    );
  }

  static filterExtensionsByLanguages(
    extensions: Extension[],
    languageKeys: string[],
  ): Extension[] {
    return extensions.filter((extension) =>
      languageKeys.some((languageKey) =>
        this.supportsLanguage(extension, languageKey),
      ),
    );
  }

  static sortExtensions(
    extensions: Extension[],
    sortBy: "name" | "version" | "author" = "name",
    order: "asc" | "desc" = "asc",
  ): Extension[] {
    const sorted = [...extensions].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "version":
          aValue = a.version;
          bValue = b.version;
          break;
        case "author":
          aValue = a.metadata?.author?.toLowerCase() || "";
          bValue = b.metadata?.author?.toLowerCase() || "";
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return sorted;
  }
}

const extensionsAPI: ExtensionsAPI = new ExtensionsAPIImpl();
export { type ExtensionsAPI, ExtensionsAPIImpl, extensionsAPI };
