import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  APPEARANCE_PRESETS,
  PICK_COLOR_PRESET_ID,
} from "@/lib/theme/appearance-presets";
import { normalizeHex } from "@/lib/theme/custom-accent-theme";
import { usePlatformThemeMeQuery, useUpdatePlatformThemeMutation } from "@/lib/hooks/query";
import { parseBackgroundColor, persistBackgroundColorHex } from "./styles";

type Setters = {
  setPresetId: (id: string) => void;
  setCustomAccentHex: (hex: string) => void;
};

export function useThemeAppearanceSave(
  presetId: string,
  customAccentHex: string,
  { setPresetId, setCustomAccentHex }: Setters,
) {
  const platformThemeQuery = usePlatformThemeMeQuery();
  const { mutate: savePlatformTheme, isPending: isSavingTheme } = useUpdatePlatformThemeMutation();

  const [syncedHex, setSyncedHex] = useState<string | null | undefined>(undefined);
  const hydratedFromServerRef = useRef(false);

  useEffect(() => {
    if (!platformThemeQuery.isFetched || hydratedFromServerRef.current) return;
    hydratedFromServerRef.current = true;

    if (platformThemeQuery.isError || !platformThemeQuery.data?.success) {
      setSyncedHex(null);
      return;
    }

    const bg = parseBackgroundColor(platformThemeQuery.data.data.backgroundColor);
    setSyncedHex(bg);

    if (bg) {
      const presetMatch = APPEARANCE_PRESETS.find((p) => p.previewBar.toLowerCase() === bg.toLowerCase());
      if (presetMatch) {
        setPresetId(presetMatch.id);
      } else {
        setPresetId(PICK_COLOR_PRESET_ID);
        setCustomAccentHex(bg);
      }
    }
  }, [
    platformThemeQuery.isFetched,
    platformThemeQuery.isError,
    platformThemeQuery.data,
    setPresetId,
    setCustomAccentHex,
  ]);

  const persistHex = useMemo(
    () => persistBackgroundColorHex(presetId, customAccentHex),
    [presetId, customAccentHex],
  );

  const normalizedPersistHex = useMemo(() => normalizeHex(persistHex), [persistHex]);

  const needsSave = useMemo(() => {
    if (syncedHex === undefined) return false;
    return (syncedHex ?? "").toLowerCase() !== normalizedPersistHex.toLowerCase();
  }, [syncedHex, normalizedPersistHex]);

  const handleSaveTheme = useCallback(() => {
    savePlatformTheme(
      { backgroundColor: normalizedPersistHex },
      {
        onSuccess: (env) => {
          if (!env.success) return;
          setSyncedHex(parseBackgroundColor(env.data.backgroundColor));
        },
      },
    );
  }, [normalizedPersistHex, savePlatformTheme]);

  return {
    platformThemeQuery,
    syncedHex,
    needsSave,
    isSavingTheme,
    handleSaveTheme,
  };
}
