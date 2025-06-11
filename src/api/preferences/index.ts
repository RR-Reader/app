import {
  BaseDirectory,
  writeTextFile,
  readTextFile,
  exists,
} from "@tauri-apps/plugin-fs";
import { defaultPreferences } from "./default";
import type { AppPreferences } from "./types";

export class PreferencesService {
  private static readonly PREFERENCES_FILE = "preferences.json";

  static async ensurePreferences(): Promise<void> {
    const fileExists = await exists(this.PREFERENCES_FILE, {
      baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) {
      await writeTextFile(
        this.PREFERENCES_FILE,
        JSON.stringify(defaultPreferences, null, 2),
        {
          baseDir: BaseDirectory.AppData,
        },
      );
    }
  }

  static async loadPreferences(): Promise<AppPreferences> {
    await this.ensurePreferences();

    try {
      const content = await readTextFile(this.PREFERENCES_FILE, {
        baseDir: BaseDirectory.AppData,
      });
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      await this.savePreferences(defaultPreferences);
      return defaultPreferences;
    }
  }

  static async savePreferences(preferences: AppPreferences): Promise<void> {
    await writeTextFile(
      this.PREFERENCES_FILE,
      JSON.stringify(preferences, null, 2),
      {
        baseDir: BaseDirectory.AppData,
      },
    );
  }
}
