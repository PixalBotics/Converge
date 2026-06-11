import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppearance } from "@/lib/theme/appearance-context";
import { normalizeHex } from "@/lib/theme/custom-accent-theme";
import { readPlatformThemeBackgroundColor } from "@/api/types/platform-theme.types";
import { usePlatformThemeMeQuery, useUpdatePlatformThemeMutation } from "@/lib/hooks/query";
import { parseBackgroundColor, persistBackgroundColorHex } from "./styles";

export function useThemeAppearanceSave(presetId: string, customAccentHex: string) {
  const { applyAccountTheme } = useAppearance();
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

    const bg = parseBackgroundColor(readPlatformThemeBackgroundColor(platformThemeQuery.data));
    setSyncedHex(bg);
    if (bg) applyAccountTheme(bg);
  }, [
    platformThemeQuery.isFetched,
    platformThemeQuery.isError,
    platformThemeQuery.data,
    applyAccountTheme,
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
          const bg = parseBackgroundColor(readPlatformThemeBackgroundColor(env));
          setSyncedHex(bg);
          if (bg) applyAccountTheme(bg);
        },
      },
    );
  }, [normalizedPersistHex, savePlatformTheme, applyAccountTheme]);

  return {
    platformThemeQuery,
    syncedHex,
    needsSave,
    isSavingTheme,
    handleSaveTheme,
  };
}
