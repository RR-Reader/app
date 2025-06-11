import {
  BaseDirectory,
  writeTextFile,
  readTextFile,
  exists,
  readDir,
  mkdir,
} from "@tauri-apps/plugin-fs";
import {
  LibraryManifest,
  Library,
  MangaEntry,
  Category,
  CategoryManifest,
} from "./type";

class LibraryService {
  private static readonly LIBRARY_DIR = "library";
  private static readonly MANIFEST_FILE = "manifest.json";

  static async ensureLibrary(): Promise<void> {
    const dirExists = await exists(LibraryService.LIBRARY_DIR, {
      baseDir: BaseDirectory.AppData,
    });

    if (!dirExists) {
      await mkdir(LibraryService.LIBRARY_DIR, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });

      const defaultManifest: LibraryManifest = {
        categories: [],
      };

      await writeTextFile(
        `${LibraryService.LIBRARY_DIR}/${LibraryService.MANIFEST_FILE}`,
        JSON.stringify(defaultManifest, null, 2),
        {
          baseDir: BaseDirectory.AppData,
        },
      );
    }
  }

  static async loadLibrary(): Promise<Library> {
    await LibraryService.ensureLibrary();
    const categories: Category[] = [];

    try {
      const files = await readDir(LibraryService.LIBRARY_DIR, {
        baseDir: BaseDirectory.AppData,
      });

      for (const file of files) {
        if (
          file.isFile &&
          file.name.endsWith(".json") &&
          file.name !== LibraryService.MANIFEST_FILE
        ) {
          try {
            const filePath = `${LibraryService.LIBRARY_DIR}/${file.name}`;
            const content = await readTextFile(filePath, {
              baseDir: BaseDirectory.AppData,
            });

            const categoryData = JSON.parse(content);

            if (LibraryService.isValidCategory(categoryData)) {
              categories.push(categoryData);
            } else {
              console.warn(`Invalid category structure in ${file.name}`);
            }
          } catch (fileError) {
            console.error(`Failed to read/parse file ${file.name}:`, fileError);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load library:", error);
    }

    return { categories };
  }

  static async loadManifest(): Promise<LibraryManifest> {
    await LibraryService.ensureLibrary();

    try {
      const manifestPath = `${LibraryService.LIBRARY_DIR}/${LibraryService.MANIFEST_FILE}`;
      const content = await readTextFile(manifestPath, {
        baseDir: BaseDirectory.AppData,
      });
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to load manifest:", error);
      return { categories: [] };
    }
  }

  static async loadCategory(slug: string): Promise<Category | null> {
    try {
      const filePath = `${LibraryService.LIBRARY_DIR}/${slug}.json`;
      const exists_file = await exists(filePath, {
        baseDir: BaseDirectory.AppData,
      });

      if (!exists_file) {
        return null;
      }

      const content = await readTextFile(filePath, {
        baseDir: BaseDirectory.AppData,
      });

      const categoryData = JSON.parse(content);
      return LibraryService.isValidCategory(categoryData) ? categoryData : null;
    } catch (error) {
      console.error(`Failed to load category ${slug}:`, error);
      return null;
    }
  }

  static async saveCategory(category: Category): Promise<void> {
    try {
      const filePath = `${LibraryService.LIBRARY_DIR}/${category.slug}.json`;
      await writeTextFile(filePath, JSON.stringify(category, null, 2), {
        baseDir: BaseDirectory.AppData,
      });

      await LibraryService.updateManifest(category);
    } catch (error) {
      console.error(`Failed to save category ${category.slug}:`, error);
      throw error;
    }
  }

  private static async updateManifest(category: Category): Promise<void> {
    try {
      const manifest = await LibraryService.loadManifest();

      const existingIndex = manifest.categories.findIndex(
        (cat) => cat.slug === category.slug,
      );
      const categoryManifest: CategoryManifest = {
        title: category.title,
        slug: category.slug,
        sort_by: category.sort_by,
        sort_order: category.sort_order,
      };

      if (existingIndex >= 0) {
        manifest.categories[existingIndex] = categoryManifest;
      } else {
        manifest.categories.push(categoryManifest);
      }

      const manifestPath = `${LibraryService.LIBRARY_DIR}/${LibraryService.MANIFEST_FILE}`;
      await writeTextFile(manifestPath, JSON.stringify(manifest, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
    } catch (error) {
      console.error("Failed to update manifest:", error);
    }
  }

  static async deleteCategory(slug: string): Promise<void> {
    try {
      console.warn(
        "Delete functionality not implemented - Tauri fs plugin limitation",
      );

      const manifest = await LibraryService.loadManifest();
      manifest.categories = manifest.categories.filter(
        (cat) => cat.slug !== slug,
      );

      const manifestPath = `${LibraryService.LIBRARY_DIR}/${LibraryService.MANIFEST_FILE}`;
      await writeTextFile(manifestPath, JSON.stringify(manifest, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
    } catch (error) {
      console.error(`Failed to delete category ${slug}:`, error);
      throw error;
    }
  }

  static async addMangaToCategory(
    categorySlug: string,
    manga: MangaEntry,
  ): Promise<void> {
    const category = await LibraryService.loadCategory(categorySlug);
    if (!category) {
      throw new Error(`Category ${categorySlug} not found`);
    }

    const existingIndex = category.entries.findIndex(
      (entry) => entry.source === manga.source && entry.id === manga.id,
    );

    if (existingIndex >= 0) {
      category.entries[existingIndex] = manga;
    } else {
      category.entries.push(manga);
    }

    LibraryService.sortCategoryEntries(category);

    await LibraryService.saveCategory(category);
  }

  static async removeMangaFromCategory(
    categorySlug: string,
    source: string,
    id: string,
  ): Promise<void> {
    const category = await LibraryService.loadCategory(categorySlug);
    if (!category) {
      throw new Error(`Category ${categorySlug} not found`);
    }

    category.entries = category.entries.filter(
      (entry) => !(entry.source === source && entry.id === id),
    );

    await LibraryService.saveCategory(category);
  }

  static async createCategory(title: string, slug: string): Promise<Category> {
    const newCategory: Category = {
      title,
      slug,
      entries: [],
      sort_by: "title",
      sort_order: "asc",
    };

    await LibraryService.saveCategory(newCategory);
    return newCategory;
  }

  private static sortCategoryEntries(category: Category): void {
    category.entries.sort((a, b) => {
      let comparison = 0;

      switch (category.sort_by) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "source":
          comparison = a.source.localeCompare(b.source);
          break;
        default:
          comparison = a.title.localeCompare(b.title);
      }

      return category.sort_order === "desc" ? -comparison : comparison;
    });
  }

  private static isValidCategory(data: any): data is Category {
    return (
      typeof data === "object" &&
      data !== null &&
      typeof data.title === "string" &&
      typeof data.slug === "string" &&
      Array.isArray(data.entries) &&
      typeof data.sort_by === "string" &&
      (data.sort_order === "asc" || data.sort_order === "desc") &&
      data.entries.every((entry: any) =>
        LibraryService.isValidMangaEntry(entry),
      )
    );
  }

  private static isValidMangaEntry(data: any): data is MangaEntry {
    return (
      typeof data === "object" &&
      data !== null &&
      typeof data.source === "string" &&
      typeof data.id === "string" &&
      typeof data.title === "string" &&
      typeof data.cover_url === "string"
    );
  }
}

export { LibraryService };
export type {
  Library,
  Category,
  MangaEntry,
  LibraryManifest,
  CategoryManifest,
};
