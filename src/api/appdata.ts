import { appDataDir } from "@tauri-apps/api/path";

export async function getPreferencesPath(): Promise<string> {
  const dataDir = await appDataDir();
  return `${dataDir}/preferences.json`;
}
