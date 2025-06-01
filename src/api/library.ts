import { invoke } from "@tauri-apps/api/core";
import { Category, Library, MangaEntry } from "@/types";

interface LibraryAPI {
  loadLibrary: () => Promise<Library>;
  getCategoryBySlug: (slug: string) => Promise<Category>;
  createCategory: (categoryName: string) => Promise<void>;
  editCategory: (categoryName: string, newName: string) => Promise<void>;
  deleteCategory: (categoryName: string) => Promise<void>;
  addMangaToCategory: (
    categoryName: string,
    mangaEntry: MangaEntry,
  ) => Promise<void>;
  removeMangaFromCategory: (
    categoryName: string,
    mangaId: string,
    mangaSource: string,
  ) => Promise<void>;
  findCategoryForManga: (mangaEntry: MangaEntry) => Promise<string | null>;
  isMangaInLibrary: (mangaEntry: MangaEntry) => Promise<boolean>;
}

class LibraryAPIImpl implements LibraryAPI {
  async loadLibrary(): Promise<Library> {
    try {
      console.log("Loading library...");
      const result = await invoke<Library>("load_library");
      console.log("Library loaded successfully:", result);
      return result;
    } catch (error) {
      console.error("Library load error:", error);
      throw new Error(`Failed to load library: ${error}`);
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    if (!slug?.trim()) {
      throw new Error("Slug is required");
    }

    try {
      return await invoke<Category>("get_category_by_slug", { slug });
    } catch (error) {
      throw new Error(`Failed to get category '${slug}': ${error}`);
    }
  }

  async createCategory(categoryName: string): Promise<void> {
    if (!categoryName?.trim()) {
      throw new Error("Category name is required");
    }

    try {
      await invoke("create_category", { categoryName: categoryName.trim() });
    } catch (error) {
      throw new Error(`Failed to create category '${categoryName}': ${error}`);
    }
  }

  async editCategory(name: string, newName: string): Promise<void> {
    if (!name?.trim() || !newName?.trim()) {
      throw new Error("Both current name and new name are required");
    }

    if (name.trim() === newName.trim()) {
      throw new Error("New name must be different from current name");
    }

    try {
      await invoke("edit_category", {
        name: name.trim(),
        newName: newName.trim(),
      });
    } catch (error) {
      throw new Error(`Failed to edit category '${name}': ${error}`);
    }
  }

  async deleteCategory(name: string): Promise<void> {
    if (!name?.trim()) {
      throw new Error("Category name is required");
    }

    if (name.trim() === "All Titles") {
      throw new Error("Cannot delete the default 'All Titles' category");
    }

    try {
      await invoke("delete_category", { name: name.trim() });
    } catch (error) {
      throw new Error(`Failed to delete category '${name}': ${error}`);
    }
  }

  async addMangaToCategory(
    categoryName: string,
    mangaEntry: MangaEntry,
  ): Promise<void> {
    if (!categoryName?.trim() || !mangaEntry) {
      throw new Error("Category name and manga entry are required");
    }

    try {
      await invoke("add_manga_to_category", {
        categoryName: categoryName.trim(),
        mangaEntry,
      });
    } catch (error) {
      throw new Error(
        `Failed to add manga '${mangaEntry.title}' to category '${categoryName}': ${error}`,
      );
    }
  }

  async removeMangaFromCategory(
    categoryName: string,
    mangaId: string,
    mangaSource: string,
  ) {
    if (!categoryName?.trim() || !mangaId?.trim() || !mangaSource?.trim()) {
      throw new Error("Category name, manga ID, and source are required");
    }

    try {
      await invoke("remove_manga_from_category", {
        categoryName: categoryName.trim(),
        mangaId: mangaId.trim(),
        mangaSource: mangaSource.trim(),
      });
    } catch (error) {
      throw new Error(
        `Failed to remove manga with ID '${mangaId}' from category '${categoryName}': ${error}`,
      );
    }
  }

  async findCategoryForManga(mangaEntry: MangaEntry): Promise<string | null> {
    if (!mangaEntry || !mangaEntry.id || !mangaEntry.source) {
      throw new Error("Manga entry with ID and source is required");
    }

    try {
      return await invoke<string | null>("find_category_for_manga", {
        mangaEntry,
      });
    } catch (error) {
      throw new Error(
        `Failed to find category for manga '${mangaEntry.title}': ${error}`,
      );
    }
  }

  async isMangaInLibrary(mangaEntry: MangaEntry): Promise<boolean> {
    if (!mangaEntry || !mangaEntry.id || !mangaEntry.source) {
      throw new Error("Manga entry with ID and source is required");
    }

    try {
      return await invoke<boolean>("is_manga_in_library", { mangaEntry });
    } catch (error) {
      throw new Error(
        `Failed to check if manga '${mangaEntry.title}' is in library: ${error}`,
      );
    }
  }
}

const libraryAPI: LibraryAPI = new LibraryAPIImpl();
export { type LibraryAPI, LibraryAPIImpl, libraryAPI };
