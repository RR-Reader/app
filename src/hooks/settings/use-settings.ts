// hooks/useSettings.ts
import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppPreferences } from "@/types";

export function usePreferences() {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => invoke<AppPreferences>("load_preferences"),
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({
      section,
      key,
      value,
    }: {
      section: string;
      key: string;
      value: any;
    }) => {
      return invoke("update_preference", { section, key, value });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      console.log(
        `Preferences ${variables.section}.${variables.key} updated to:`,
        variables.value,
      );
    },
    onError: (error, variables) => {
      console.error(
        `Failed to update ${variables.section}.${variables.key}:`,
        error,
      );
    },
  });

  const resetSettingsMutation = useMutation({
    mutationFn: () => invoke("reset_preference"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updateSettingMutation.mutate,
    resetPreferences: resetSettingsMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
  };
}

export function useSettingSection(section: keyof AppPreferences) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings", section],
    queryFn: () => invoke(`get_preference_section`, { section }),
  });

  return { data, isLoading, error };
}
