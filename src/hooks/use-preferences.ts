import { PreferencesService } from "@/api/preferences";
import { defaultPreferences } from "@/api/preferences/default";
import {
  AppPreferences,
  ExperimentalPreferences,
  LayoutPreferences,
  LibraryHistoryPreferences,
  ReaderPreferences,
  SystemBehaviorPreferences,
} from "@/api/preferences/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PREFERENCES_QUERY_KEY = ["preferences"] as const;

export function usePreferences() {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading: loading,
    error,
    refetch: reloadPreferences,
  } = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: async () => {
      // Add defensive check
      if (
        !PreferencesService ||
        typeof PreferencesService.loadPreferences !== "function"
      ) {
        console.error(
          "PreferencesService is not properly imported or instantiated",
        );
        return defaultPreferences;
      }

      try {
        return await PreferencesService.loadPreferences();
      } catch (error) {
        console.error("Failed to load preferences:", error);
        return defaultPreferences;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<AppPreferences>) => {
      const currentPreferences = queryClient.getQueryData<AppPreferences>(
        PREFERENCES_QUERY_KEY,
      );
      if (!currentPreferences) {
        throw new Error("No current preferences available");
      }

      const updatedPreferences = { ...currentPreferences, ...newPreferences };

      // Add defensive check
      if (
        !PreferencesService ||
        typeof PreferencesService.savePreferences !== "function"
      ) {
        throw new Error("PreferencesService is not properly available");
      }

      await PreferencesService.savePreferences(updatedPreferences);
      return updatedPreferences;
    },
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, updatedPreferences);
    },
    onError: (error) => {
      console.error("Error updating preferences:", error);
    },
  });

  const resetPreferencesMutation = useMutation({
    mutationFn: async () => {
      // Add defensive check
      if (
        !PreferencesService ||
        typeof PreferencesService.savePreferences !== "function"
      ) {
        throw new Error("PreferencesService is not properly available");
      }

      await PreferencesService.savePreferences(defaultPreferences);
      return defaultPreferences;
    },
    onSuccess: (defaultPrefs) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, defaultPrefs);
    },
    onError: (error) => {
      console.error("Error resetting preferences:", error);
    },
  });

  const updatePreferences = async (newPreferences: Partial<AppPreferences>) => {
    return updatePreferencesMutation.mutateAsync(newPreferences);
  };

  const updateLayoutPreferences = async (
    newLayout: Partial<LayoutPreferences>,
  ) => {
    if (!preferences) return;
    return updatePreferences({
      layout_preferences: { ...preferences.layout_preferences, ...newLayout },
    });
  };

  const updateReaderPreferences = async (
    newReader: Partial<ReaderPreferences>,
  ) => {
    if (!preferences) return;
    return updatePreferences({
      reader_display_preferences: {
        ...preferences.reader_display_preferences,
        ...newReader,
      },
    });
  };

  const updateLibraryHistoryPreferences = async (
    newLibrary: Partial<LibraryHistoryPreferences>,
  ) => {
    if (!preferences) return;
    return updatePreferences({
      library_history_preferences: {
        ...preferences.library_history_preferences,
        ...newLibrary,
      },
    });
  };

  const updateSystemBehaviorPreferences = async (
    newSystem: Partial<SystemBehaviorPreferences>,
  ) => {
    if (!preferences) return;
    return updatePreferences({
      system_behavior_preferences: {
        ...preferences.system_behavior_preferences,
        ...newSystem,
      },
    });
  };

  const updateExperimentalPreferences = async (
    newExperimental: Partial<ExperimentalPreferences>,
  ) => {
    if (!preferences) return;
    return updatePreferences({
      experimental_preferences: {
        ...preferences.experimental_preferences,
        ...newExperimental,
      },
    });
  };

  const resetPreferences = async () => {
    return resetPreferencesMutation.mutateAsync();
  };

  return {
    preferences: preferences || null,
    loading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load preferences"
      : null,

    isUpdating: updatePreferencesMutation.isPending,
    isResetting: resetPreferencesMutation.isPending,
    updateError: updatePreferencesMutation.error
      ? updatePreferencesMutation.error instanceof Error
        ? updatePreferencesMutation.error.message
        : "Failed to update preferences"
      : null,
    resetError: resetPreferencesMutation.error
      ? resetPreferencesMutation.error instanceof Error
        ? resetPreferencesMutation.error.message
        : "Failed to reset preferences"
      : null,

    updatePreferences,
    updateLayoutPreferences,
    updateReaderPreferences,
    updateLibraryHistoryPreferences,
    updateSystemBehaviorPreferences,
    updateExperimentalPreferences,
    resetPreferences,
    reloadPreferences,
  };
}

export { PREFERENCES_QUERY_KEY };
