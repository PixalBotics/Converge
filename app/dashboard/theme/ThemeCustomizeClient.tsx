"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { Colorize } from "@mui/icons-material";
import { Typography } from "@/components/common";
import { useAppearance } from "@/lib/theme/appearance-context";
import { DEFAULT_THEME_GROUP_IDS, PICK_COLOR_PRESET_ID } from "@/lib/theme/appearance-presets";
import { getCustomAccentTheme } from "@/lib/theme/custom-accent-theme";
import type { AppTheme } from "@/theme/theme";

/** Discord Appearance panel (dark charcoal) */
const DISCORD_PANEL_BG = "#2b2d31";
const DISCORD_PANEL_BORDER = "#1f2023";
const DISCORD_SWATCH_RADIUS = "10px";
/** Selected swatch ring (Discord light outline) */
const SWATCH_SELECTED_SHADOW = "0 0 0 2px #f2f3f5, 0 0 12px rgba(242, 243, 245, 0.25)";

export default function ThemeCustomizeClient() {
  const theme = useTheme() as AppTheme;
  const { presetId, setPresetId, presets, customAccentHex, setCustomAccentHex } = useAppearance();
  const [hexDraft, setHexDraft] = useState(customAccentHex);

  const defaultThemePresets = useMemo(
    () =>
      DEFAULT_THEME_GROUP_IDS.map((id) => presets.find((p) => p.id === id)).filter(
        (p): p is NonNullable<typeof p> => p != null
      ),
    [presets]
  );
  const defaultThemeIdSet = useMemo(() => new Set<string>(DEFAULT_THEME_GROUP_IDS), []);
  const colorThemePresets = useMemo(
    () => presets.filter((p) => !defaultThemeIdSet.has(p.id)),
    [presets, defaultThemeIdSet]
  );

  useEffect(() => {
    setHexDraft(customAccentHex);
  }, [customAccentHex]);

  const onHexBlur = useCallback(() => {
    setCustomAccentHex(hexDraft);
  }, [hexDraft, setCustomAccentHex]);

  const renderSwatchFill = (p: (typeof presets)[number]) => {
    if (p.id === PICK_COLOR_PRESET_ID) {
      const custom = getCustomAccentTheme(customAccentHex);
      return { background: custom.appBackground };
    }
    return { background: p.appBackground };
  };

  return (
    <Box sx={{ mx: "auto", py: { xs: 2, sm: 3 }}}>
      <Typography
        variant="boldLarge"
        sx={{
          color: theme.app.text.primary,
          mb: 0.5,
          fontSize: { xs: 22, sm: 26 },
        }}
      >
        Customize appearance
      </Typography>
      <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mb: 3 }}>
        Choose a theme for the dashboard.
      </Typography>

      {defaultThemePresets.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="medium16"
            sx={{
              fontWeight: 700,
              color: theme.app.text.primary,
              mb: 1.5,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              fontSize: 12,
            }}
          >
            Default theme
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "flex-start" }}>
            {defaultThemePresets.map((p) => (
              <SwatchButton
                key={p.id}
                compact
                selected={presetId === p.id}
                onClick={() => setPresetId(p.id)}
                ariaLabel={p.label}
                title={p.label}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: DISCORD_SWATCH_RADIUS,
                    ...renderSwatchFill(p),
                  }}
                />
              </SwatchButton>
            ))}
          </Box>
        </Box>
      )}

      <Typography
        variant="medium16"
        sx={{
          fontWeight: 700,
          color: theme.app.text.primary,
          mb: 1.5,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          fontSize: 12,
        }}
      >
        Color themes
      </Typography>

      <Box
        sx={{
          bgcolor: DISCORD_PANEL_BG,
          border: `1px solid ${DISCORD_PANEL_BORDER}`,
          borderRadius: "8px",
          p: { xs: 1.5, sm: 2 },
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(3, minmax(0, 1fr))",
              sm: "repeat(5, minmax(0, 1fr))",
              md: "repeat(9, minmax(0, 1fr))",
            },
            gap: { xs: "8px", sm: "10px" },
          }}
        >
          {colorThemePresets.map((p) => {
            const selected = p.id === presetId;
            const fill = renderSwatchFill(p);
            const isPick = p.id === PICK_COLOR_PRESET_ID;

            return (
              <SwatchButton
                key={p.id}
                selected={selected}
                onClick={() => setPresetId(p.id)}
                ariaLabel={p.label}
                title={p.label}
              >
                {isPick ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      p: "2px",
                      borderRadius: DISCORD_SWATCH_RADIUS,
                      background:
                        "conic-gradient(from 200deg, #22d3ee, #a855f7, #ec4899, #eab308, #22d3ee)",
                      boxSizing: "border-box",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                        position: "relative",
                        overflow: "hidden",
                        ...fill,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Colorize
                        sx={{
                          width: "42%",
                          height: "42%",
                          color: customAccentHex,
                          opacity: 0.95,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: DISCORD_SWATCH_RADIUS,
                      ...fill,
                    }}
                  />
                )}
              </SwatchButton>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          background: theme.app.dashboard.cardBg,
          maxWidth: 420,
        }}
      >
        <Typography variant="medium16" sx={{ fontWeight: 700, color: theme.app.text.primary, mb: 1.5 }}>
          Color picker
        </Typography>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2, display: "block" }}>
          Pick a color for the &quot;Custom color&quot; theme (conic border swatch above).
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <Box
            component="label"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                border: `2px solid ${theme.app.dashboard.cardBorder}`,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <input
                type="color"
                value={customAccentHex}
                onChange={(e) => setCustomAccentHex(e.target.value)}
                aria-label="Choose accent color"
                style={{
                  width: "160%",
                  height: "160%",
                  margin: "-30%",
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                }}
              />
            </Box>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              Choose color
            </Typography>
          </Box>
          <TextField
            size="small"
            label="Hex"
            value={hexDraft}
            onChange={(e) => setHexDraft(e.target.value)}
            onBlur={onHexBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") onHexBlur();
            }}
            sx={{
              minWidth: 140,
              "& .MuiOutlinedInput-root": {
                color: theme.app.text.primary,
              },
              "& .MuiInputLabel-root": {
                color: theme.app.dashboard.textMuted,
              },
            }}
            slotProps={{
              htmlInput: { spellCheck: false },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

function SwatchButton({
  children,
  selected,
  onClick,
  ariaLabel,
  title,
  /** Fixed size (Default theme row) — avoids full-width tall square */
  compact,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
  title?: string;
  compact?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      title={title}
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      sx={{
        position: "relative",
        m: 0,
        p: 0,
        border: "none",
        cursor: "pointer",
        borderRadius: DISCORD_SWATCH_RADIUS,
        background: "transparent",
        boxShadow: selected ? SWATCH_SELECTED_SHADOW : "none",
        transition: "box-shadow 0.15s ease",
        "&:focus-visible": {
          outline: "2px solid #5865f2",
          outlineOffset: 2,
        },
        ...(compact
          ? {
              width: 56,
              height: 56,
              flexShrink: 0,
            }
          : {
              width: "100%",
              aspectRatio: "1",
              minWidth: 0,
              mx: "auto",
            }),
      }}
    >
      {children}
    </Box>
  );
}
