"use client";

import { useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { useDashboardAppearance } from "@/lib/dashboard-appearance/context";
import type { GlassChrome, ShellGlassPreset, SidebarWidthPreset } from "@/lib/dashboard-appearance/types";
import {
  deriveNavAccentsFromBackground,
  deriveReadableTextHexesFromBackground,
  isDarkAppearanceBackground,
} from "@/lib/theme/backgroundTextContrast";
import { glassChromeLayerSx } from "@/lib/dashboard-appearance/shellStyles";
import { deriveDashboardUiTokens } from "@/lib/theme/dashboardUiTokens";
import { mainBackgroundGradient } from "@/theme/theme";
import { BackgroundGradientPicker } from "./BackgroundGradientPicker";

type BgPreset = { id: string; label: string; value: string };

const BG_PRESETS: BgPreset[] = [
  { id: "nebula", label: "Nebula", value: mainBackgroundGradient },
  {
    id: "void",
    label: "Deep void",
    value:
      "radial-gradient(ellipse 100% 80% at 50% -20%, rgba(59, 130, 246, 0.38) 0%, transparent 55%), linear-gradient(180deg, #020617 0%, #000 100%)",
  },
  {
    id: "violet",
    label: "Violet",
    value:
      "radial-gradient(ellipse 80% 60% at 80% 20%, rgba(168, 85, 247, 0.38) 0%, transparent 50%), linear-gradient(165deg, #0f0720 0%, #020617 100%)",
  },
  { id: "charcoal", label: "Charcoal", value: "linear-gradient(180deg, #111827 0%, #030712 100%)" },
  { id: "ocean", label: "Ocean", value: "linear-gradient(160deg, #042f2e 0%, #022c22 40%, #020617 100%)" },
  {
    id: "ember",
    label: "Ember",
    value:
      "radial-gradient(ellipse 90% 70% at 90% 10%, rgba(249, 115, 22, 0.22) 0%, transparent 50%), linear-gradient(175deg, #1c0a06 0%, #0c0a09 100%)",
  },
  {
    id: "slate",
    label: "Slate mist",
    value: "linear-gradient(165deg, #1e293b 0%, #0f172a 45%, #020617 100%)",
  },
  {
    id: "dawn",
    label: "Dawn",
    value: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)",
  },
  {
    id: "paper",
    label: "Paper",
    value: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 55%, #e2e8f0 100%)",
  },
];

function useAdaptiveSettingsShell(appearanceBackgroundCss: string) {
  const dark = isDarkAppearanceBackground(appearanceBackgroundCss);
  return useMemo(
    () =>
      ({
        dark,
        /** Settings cards — always readable on light OR dark canvases */
        card: {
          borderRadius: 16,
          border: `1px solid ${dark ? "rgba(255,255,255,0.11)" : "rgba(15, 23, 42, 0.1)"}`,
          background: dark ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.91)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          boxShadow: dark
            ? "0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)"
            : "0 12px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        },
        previewFrame: {
          border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)"}`,
          boxShadow: dark ? "inset 0 0 0 1px rgba(0,0,0,0.2)" : "inset 0 0 0 1px rgba(255,255,255,0.6)",
        },
        presetMetaBg: dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.92)",
        presetMetaBorder: dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
      }) as const,
    [dark]
  );
}

function GlassControls({
  title,
  subtitle,
  value,
  onChange,
  th,
}: {
  title: string;
  subtitle: string;
  value: GlassChrome;
  onChange: (patch: Partial<GlassChrome>) => void;
  th: AppTheme;
}) {
  const muted = th.app.text.secondary;
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: 0.1, color: th.app.text.primary }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: muted, lineHeight: 1.55 }}>
          {subtitle}
        </Typography>
      </Box>
      <Stack spacing={0.5}>
        <Typography variant="caption" fontWeight={600} sx={{ color: muted }}>
          Blur — {value.blurPx}px
        </Typography>
        <Slider
          value={value.blurPx}
          onChange={(_, v) => onChange({ blurPx: v as number })}
          min={0}
          max={40}
          size="small"
          valueLabelDisplay="auto"
          sx={{ color: th.app.text.primary, "& .MuiSlider-track": { bgcolor: alpha(th.palette.primary.main, 0.85) } }}
        />
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="caption" fontWeight={600} sx={{ color: muted }}>
          Frost — {Math.round(value.fillOpacity * 100)}%
        </Typography>
        <Slider
          value={value.fillOpacity}
          onChange={(_, v) => onChange({ fillOpacity: v as number })}
          min={0.05}
          max={0.92}
          step={0.01}
          size="small"
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
          sx={{ color: th.app.text.primary, "& .MuiSlider-track": { bgcolor: alpha(th.palette.secondary.main, 0.85) } }}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <TextField
          label="Tint"
          type="color"
          size="small"
          value={value.tintHex}
          onChange={(e) => onChange({ tintHex: e.target.value })}
          sx={{ minWidth: 128, "& input": { height: 40, cursor: "pointer" } }}
        />
        <Stack spacing={0.5} sx={{ flex: 1, width: "100%" }}>
          <Typography variant="caption" fontWeight={600} sx={{ color: muted }}>
            Edge — {Math.round(value.borderOpacity * 100)}%
          </Typography>
          <Slider
            value={value.borderOpacity}
            onChange={(_, v) => onChange({ borderOpacity: v as number })}
            min={0}
            max={0.35}
            step={0.01}
            size="small"
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            sx={{ color: th.app.text.primary, "& .MuiSlider-track": { bgcolor: alpha(th.palette.info.main, 0.72) } }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

const SIDEBAR_WIDTH_OPTIONS: { id: SidebarWidthPreset; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "standard", label: "Standard" },
  { id: "wide", label: "Wide" },
];

const GLASS_STYLE_OPTIONS: { id: ShellGlassPreset; label: string; hint: string }[] = [
  { id: "light", label: "Clear glass", hint: "More of your background shows through" },
  { id: "medium", label: "Balanced", hint: "Works well for most dashboards" },
  { id: "heavy", label: "Strong frost", hint: "Sidebar & top bar look more solid" },
];

export default function DashboardAppearanceSettings() {
  const th = useTheme() as AppTheme;
  const { appearance, ...actions } = useDashboardAppearance();
  const shell = useAdaptiveSettingsShell(appearance.backgroundCss);
  const autoPreview = deriveReadableTextHexesFromBackground(appearance.backgroundCss);
  const accentPreview = useMemo(
    () => deriveNavAccentsFromBackground(appearance.backgroundCss),
    [appearance.backgroundCss]
  );
  const miniSidebarW = { compact: 54, standard: 64, wide: 74 }[appearance.sidebarWidth];
  const textPrimForUi = appearance.textMode === "auto" ? autoPreview.primaryHex : appearance.textPrimaryHex;
  const textSecForUi = appearance.textMode === "auto" ? autoPreview.secondaryHex : appearance.textSecondaryHex;
  const uiPreview = useMemo(
    () => deriveDashboardUiTokens(appearance.backgroundCss, textPrimForUi, textSecForUi, appearance.ui),
    [appearance.backgroundCss, textPrimForUi, textSecForUi, appearance.ui]
  );

  const fieldOutline = alpha(th.app.text.primary, shell.dark ? 0.22 : 0.18);

  const sharedFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: th.app.text.primary,
      borderRadius: 2,
      "& fieldset": { borderColor: fieldOutline },
      "&:hover fieldset": { borderColor: alpha(th.app.text.primary, shell.dark ? 0.32 : 0.28) },
    },
    "& .MuiInputLabel-root": { color: th.app.text.secondary },
  };

  const toggleSlotSx = {
    "& .MuiToggleButton-root": {
      color: th.app.text.secondary,
      borderColor: alpha(th.app.text.primary, 0.18),
      textTransform: "none",
      fontWeight: 600,
      px: 2,
    },
    "& .Mui-selected": {
      bgcolor: `${alpha(th.palette.primary.main, shell.dark ? 0.32 : 0.18)} !important`,
      color: `${th.app.text.primary} !important`,
    },
  };

  return (
    <Box sx={{ maxWidth: 1080, mx: "auto", pb: 6, px: { xs: 0, sm: 1 } }}>
      <Card
        elevation={0}
        sx={{
          ...shell.card,
          mb: 3,
          overflow: "hidden",
          borderRadius: "14px",
        }}
      >
        <Box
          sx={{
            height: 5,
            background: `linear-gradient(90deg, ${th.palette.primary.main}, ${th.palette.secondary.main}, ${alpha(th.palette.secondary.main, 0.4)})`,
          }}
        />
        <CardContent sx={{ py: { xs: 2.5, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} justifyContent="space-between" alignItems={{ md: "flex-start" }}>
            <Stack direction="row" spacing={2} sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: alpha(th.palette.primary.main, shell.dark ? 0.2 : 0.12),
                  border: `1px solid ${alpha(th.palette.primary.main, 0.35)}`,
                  color: th.palette.primary.main,
                }}
              >
                <PaletteRoundedIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="overline"
                  sx={{ letterSpacing: "0.14em", fontWeight: 800, color: th.app.text.secondary, display: "block", mb: 0.5 }}
                >
                  Theme studio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.7, color: th.app.text.primary, mb: 1, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                  Brand the whole product
                </Typography>
                <Typography sx={{ color: th.app.text.secondary, maxWidth: 560, lineHeight: 1.65, fontSize: "0.9375rem" }}>
                  Canvas, typography, glass shell, then widgets &amp; charts — one coherent system. Auto mode keeps text, icons, cards, and graph labels readable as you change the background.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              onClick={actions.resetToDefaults}
              sx={{
                alignSelf: { xs: "stretch", md: "center" },
                flexShrink: 0,
                borderColor: alpha(th.app.text.primary, 0.35),
                color: th.app.text.primary,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                px: 2.5,
                py: 1.125,
              }}
            >
              Reset to defaults
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Live miniature — shows current shell on real canvas */}
      <Card elevation={0} sx={{ ...shell.card, mb: 3, overflow: "hidden" }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: th.app.text.primary, letterSpacing: 0.2 }}>
              Live preview
            </Typography>
            <Typography variant="caption" sx={{ color: th.app.text.secondary, fontWeight: 600 }}>
              Sidebar · header · content
            </Typography>
          </Stack>
          <Box
            sx={{
              position: "relative",
              borderRadius: 3,
              overflow: "hidden",
              height: { xs: 132, sm: 152 },
              background: appearance.backgroundCss,
              ...shell.previewFrame,
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ p: 1.75, height: "100%", boxSizing: "border-box" }}>
              <Box
                sx={{
                  width: { xs: miniSidebarW, sm: miniSidebarW + 8 },
                  height: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  ...glassChromeLayerSx(appearance.sidebarChrome, { surround: true, borderRadius: 6 }),
                }}
              />
              <Stack spacing={1.15} sx={{ flex: 1, minWidth: 0, height: "100%" }}>
                <Box
                  sx={{
                    height: 44,
                    borderRadius: 2,
                    overflow: "hidden",
                    ...glassChromeLayerSx(appearance.headerChrome, { borderBottom: true }),
                  }}
                />
                <Box
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    border: `1px solid ${uiPreview.cardBorder}`,
                    bgcolor: uiPreview.cardBg,
                    minHeight: 36,
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Card>

      <Stack spacing={3} sx={{ pt: 2 }}>
        <Card elevation={0} sx={{ ...shell.card, borderRadius: "14px" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, color: th.app.text.primary }}>
              Background & reading
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: th.app.text.secondary, lineHeight: 1.65 }}>
              Use the visual builder for solid colours, linear gradients, or a mesh (radial glow over a gradient). You can still paste any full CSS background string. The live dashboard uses it as-is. When you connect a backend, send the same field; until then the product falls back to sensible defaults (see note for developers at the bottom of this card).
            </Typography>
            <BackgroundGradientPicker
              onApply={actions.setBackgroundCss}
              th={th}
              shellDark={shell.dark}
              toggleSlotSx={toggleSlotSx}
            />
            <TextField
              label="Page background (CSS)"
              multiline
              minRows={4}
              fullWidth
              value={appearance.backgroundCss}
              onChange={(e) => actions.setBackgroundCss(e.target.value)}
              placeholder="e.g. linear-gradient(180deg, #020617 0%, #000 100%)"
              sx={{
                mb: 2.5,
                ...sharedFieldSx,
                "& textarea": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5 },
              }}
            />
            <Typography variant="subtitle2" sx={{ mb: 1.25, color: th.app.text.primary, fontWeight: 700 }}>
              Quick samples
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
                gap: 1.25,
              }}
            >
              {BG_PRESETS.map((p) => {
                const selected = appearance.backgroundCss === p.value;
                return (
                  <Box
                    key={p.id}
                    component="button"
                    type="button"
                    onClick={() => actions.setBackgroundCss(p.value)}
                    sx={{
                      position: "relative",
                      m: 0,
                      p: 0,
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 2,
                      overflow: "hidden",
                      textAlign: "left",
                      bgcolor: "transparent",
                      outline: "none",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                      boxShadow: selected
                        ? `0 0 0 2px ${th.palette.primary.main}, 0 8px 20px ${alpha(th.palette.primary.main, 0.22)}`
                        : `0 2px 8px rgba(0,0,0,${shell.dark ? 0.25 : 0.06})`,
                      "&:hover": { transform: "translateY(-2px)" },
                      "&:focus-visible": { boxShadow: `0 0 0 2px ${th.palette.primary.main}` },
                    }}
                  >
                    <Box sx={{ height: 44, background: p.value, width: "100%" }} />
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        px: 1,
                        py: 0.75,
                        bgcolor: shell.presetMetaBg,
                        borderTop: `1px solid ${shell.presetMetaBorder}`,
                      }}
                    >
                      <Typography variant="caption" fontWeight={800} sx={{ color: th.app.text.primary }}>
                        {p.label}
                      </Typography>
                      {selected && <CheckRoundedIcon sx={{ fontSize: 16, color: th.palette.primary.main }} />}
                    </Stack>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ my: 3, borderColor: alpha(th.app.text.primary, 0.08) }} />

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, color: th.app.text.primary }}>
              Text on the whole dashboard
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: th.app.text.secondary, lineHeight: 1.65 }}>
              <strong>Auto (recommended)</strong> estimates readable colours from your background and keeps sidebar icon tints in sync whenever you change it.{" "}
              <strong>Custom</strong> is for fixed brand palettes — you set the colours and optional icon colours yourself in Advanced.
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={appearance.textMode}
              onChange={(_, v) => v != null && actions.setTextMode(v)}
              sx={{ ...toggleSlotSx, mb: 2 }}
            >
              <ToggleButton value="auto">Auto</ToggleButton>
              <ToggleButton value="manual">Custom colours</ToggleButton>
            </ToggleButtonGroup>
            {appearance.textMode === "auto" ? (
              <Stack spacing={2}>
                <Box
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    bgcolor: alpha(th.app.text.primary, shell.dark ? 0.06 : 0.05),
                    border: `1px solid ${alpha(th.app.text.primary, 0.12)}`,
                  }}
                >
                  <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.65, mb: 1.5 }}>
                    Body text preview:{" "}
                    <Box component="span" sx={{ fontWeight: 800, color: th.app.text.primary }}>
                      {autoPreview.primaryHex}
                    </Box>{" "}
                    (main) ·{" "}
                    <Box component="span" sx={{ fontWeight: 800, color: th.app.text.primary }}>
                      {autoPreview.secondaryHex}
                    </Box>{" "}
                    (muted)
                  </Typography>
                  <Typography variant="caption" sx={{ color: th.app.text.secondary, fontWeight: 600, display: "block", mb: 1 }}>
                    Menu & icons (follow background automatically)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(
                      [
                        ["Label", accentPreview.navLabelHex],
                        ["Items", accentPreview.navItemHex],
                        ["Active icon", accentPreview.navActiveIconHex],
                      ] as const
                    ).map(([label, hex]) => (
                      <Stack key={label} direction="row" alignItems="center" spacing={0.75}>
                        <Box sx={{ width: 22, height: 22, borderRadius: "6px", bgcolor: hex, border: "1px solid rgba(255,255,255,0.2)" }} />
                        <Typography variant="caption" sx={{ color: th.app.text.secondary }}>
                          {label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            ) : (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Main text"
                  type="color"
                  value={appearance.textPrimaryHex}
                  onChange={(e) => actions.setTextPrimaryHex(e.target.value)}
                  sx={{ flex: 1, ...sharedFieldSx, "& input": { height: 44 } }}
                />
                <TextField
                  label="Muted text"
                  type="color"
                  value={appearance.textSecondaryHex}
                  onChange={(e) => actions.setTextSecondaryHex(e.target.value)}
                  sx={{ flex: 1, ...sharedFieldSx, "& input": { height: 44 } }}
                />
              </Stack>
            )}

            <Box
              sx={{
                mt: 3,
                p: 1.75,
                borderRadius: 2,
                bgcolor: alpha(th.palette.info.main, shell.dark ? 0.08 : 0.06),
                border: `1px solid ${alpha(th.palette.info.main, 0.22)}`,
              }}
            >
              <Typography variant="caption" sx={{ color: th.app.text.secondary, lineHeight: 1.6, display: "block" }}>
                <strong>Backend:</strong> expose the same shape you store here (background string, text mode, optional colours, sidebar width, glass preset, etc.). If the API returns nothing yet, call{" "}
                <Box component="span" sx={{ fontFamily: "ui-monospace, monospace", color: th.app.text.primary }}>
                  mergeDashboardAppearanceFromApi(partial)
                </Box>{" "}
                from{" "}
                <Box component="span" sx={{ fontFamily: "ui-monospace, monospace", color: th.app.text.primary }}>
                  lib/dashboard-appearance/mergeFromApi.ts
                </Box>{" "}
                so missing fields stay on product defaults.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ ...shell.card, borderRadius: "14px" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: th.palette.primary.main,
                  bgcolor: alpha(th.palette.primary.main, shell.dark ? 0.15 : 0.1),
                  border: `1px solid ${alpha(th.palette.primary.main, 0.25)}`,
                }}
              >
                Surfaces
              </Box>
            </Stack>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, color: th.app.text.primary }}>
              Cards, charts &amp; KPI numbers
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: th.app.text.secondary, lineHeight: 1.65 }}>
              <strong>Auto</strong> derives frosted cards, chart axis colours, and metric values from the same text contrast you set above — so dashboard widgets always match the page.{" "}
              <strong>Custom</strong> lets you paste CSS colours for cards or pick a data accent for graphs and big numbers.
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={appearance.ui.mode}
              onChange={(_, v) => v != null && actions.setUi({ mode: v })}
              sx={{ ...toggleSlotSx, mb: 2 }}
            >
              <ToggleButton value="auto">Auto surfaces</ToggleButton>
              <ToggleButton value="manual">Custom overrides</ToggleButton>
            </ToggleButtonGroup>
            <Box
              sx={{
                borderRadius: 2,
                p: 2,
                mb: 2,
                bgcolor: alpha(th.app.text.primary, shell.dark ? 0.05 : 0.04),
                border: `1px solid ${alpha(th.app.text.primary, 0.1)}`,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ color: th.app.text.secondary, display: "block", mb: 1.25 }}>
                Live token preview (what dashboards use now)
              </Typography>
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5}>
                {(
                  [
                    ["Card", uiPreview.cardBg],
                    ["Border", uiPreview.cardBorder],
                    ["Charts / KPI", uiPreview.metricValue],
                  ] as const
                ).map(([label, colour]) => (
                  <Stack key={label} direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: colour,
                        border: `1px solid ${alpha(th.app.text.primary, 0.12)}`,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    />
                    <Box>
                      <Typography variant="caption" fontWeight={700} sx={{ color: th.app.text.primary, display: "block" }}>
                        {label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: th.app.text.secondary, fontFamily: "ui-monospace, monospace", fontSize: 10 }}>
                        {colour.length > 42 ? `${colour.slice(0, 40)}…` : colour}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
            {appearance.ui.mode === "manual" ? (
              <Stack spacing={2}>
                <TextField
                  label="Card background (CSS — e.g. rgba or #hex)"
                  size="small"
                  fullWidth
                  placeholder={uiPreview.cardBg}
                  value={appearance.ui.cardBgHex ?? ""}
                  onChange={(e) => actions.setUi({ cardBgHex: e.target.value || undefined })}
                  sx={sharedFieldSx}
                  helperText="Leave empty to keep auto. Applies to all dashboard cards."
                />
                <TextField
                  label="Card border (CSS colour)"
                  size="small"
                  fullWidth
                  placeholder={uiPreview.cardBorder}
                  value={appearance.ui.cardBorderHex ?? ""}
                  onChange={(e) => actions.setUi({ cardBorderHex: e.target.value || undefined })}
                  sx={sharedFieldSx}
                />
                <TextField
                  label="Data accent (graphs & default metric values)"
                  type="color"
                  value={
                    appearance.ui.dataAccentHex?.trim() ||
                    (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(uiPreview.metricValue.trim())
                      ? uiPreview.metricValue.trim()
                      : "#818CF8")
                  }
                  onChange={(e) => actions.setUi({ dataAccentHex: e.target.value })}
                  sx={{ maxWidth: 280, ...sharedFieldSx, "& input": { height: 44 } }}
                />
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.65 }}>
                Surfaces track your background and text mode automatically. Switch to <strong>Custom overrides</strong> if marketing needs an exact card tint or accent.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ ...shell.card, borderRadius: "14px" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, color: th.app.text.primary }}>
              Sidebar & top bar
            </Typography>
            <Typography variant="body2" sx={{ mb: 2.5, color: th.app.text.secondary, lineHeight: 1.65 }}>
              Choose how wide the menu is and how “frosted” the glass panels look. One setting updates both the sidebar and the navbar so they stay matched.
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1, color: th.app.text.primary, fontWeight: 700 }}>
              Menu width
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={appearance.sidebarWidth}
              onChange={(_, v) => v != null && actions.setSidebarWidth(v)}
              sx={{ ...toggleSlotSx, mb: 2.5 }}
            >
              {SIDEBAR_WIDTH_OPTIONS.map((o) => (
                <ToggleButton key={o.id} value={o.id}>
                  {o.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Typography variant="subtitle2" sx={{ mb: 1, color: th.app.text.primary, fontWeight: 700 }}>
              Glass strength
            </Typography>
            <Stack spacing={1.25}>
              {GLASS_STYLE_OPTIONS.map((o) => {
                const selected = appearance.shellGlassPreset === o.id;
                return (
                  <Box
                    key={o.id}
                    component="button"
                    type="button"
                    onClick={() => actions.setShellGlassPreset(o.id)}
                    sx={{
                      textAlign: "left",
                      m: 0,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      border: selected
                        ? `2px solid ${th.palette.primary.main}`
                        : `1px solid ${alpha(th.app.text.primary, 0.15)}`,
                      bgcolor: selected ? alpha(th.palette.primary.main, shell.dark ? 0.12 : 0.08) : alpha(th.app.text.primary, 0.03),
                      transition: "border-color 0.15s ease, background 0.15s ease",
                      "&:hover": { borderColor: alpha(th.palette.primary.main, 0.55) },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: th.app.text.primary }}>
                      {o.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.5, mt: 0.25 }}>
                      {o.hint}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Accordion
          disableGutters
          elevation={0}
          sx={{
            ...shell.card,
            "&:before": { display: "none" },
            overflow: "hidden",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: th.app.text.secondary }} />}>
            <Typography fontWeight={800} sx={{ color: th.app.text.primary }}>
              Advanced — search bar, icon colours, fine glass
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.6 }}>
                {appearance.textMode === "auto" ? (
                  <>
                    Icon and menu colours are calculated from your background while Auto is on. Switch to <strong>Custom colours</strong> above to unlock manual swatches.
                  </>
                ) : (
                  <>Pick navigation colours when you are locking a brand palette.</>
                )}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ opacity: appearance.textMode === "manual" ? 1 : 0.45, pointerEvents: appearance.textMode === "manual" ? "auto" : "none" }}>
                <TextField
                  label="Menu label"
                  type="color"
                  value={appearance.accents.navLabelHex}
                  onChange={(e) => actions.setAccents({ navLabelHex: e.target.value })}
                  sx={{ flex: 1, ...sharedFieldSx, "& input": { height: 44 } }}
                />
                <TextField
                  label="Nav items"
                  type="color"
                  value={appearance.accents.navItemHex}
                  onChange={(e) => actions.setAccents({ navItemHex: e.target.value })}
                  sx={{ flex: 1, ...sharedFieldSx, "& input": { height: 44 } }}
                />
                <TextField
                  label="Active icon"
                  type="color"
                  value={appearance.accents.navActiveIconHex}
                  onChange={(e) => actions.setAccents({ navActiveIconHex: e.target.value })}
                  sx={{ flex: 1, ...sharedFieldSx, "& input": { height: 44 } }}
                />
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600} sx={{ color: th.app.text.secondary }}>
                  Search field fill — {Math.round(appearance.accents.searchFillOpacity * 100)}%
                </Typography>
                <Slider
                  value={appearance.accents.searchFillOpacity}
                  onChange={(_, v) => actions.setAccents({ searchFillOpacity: v as number })}
                  min={0.02}
                  max={0.2}
                  step={0.01}
                  size="small"
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                  sx={{ color: th.app.text.primary, "& .MuiSlider-track": { bgcolor: alpha(th.palette.primary.main, 0.72) } }}
                />
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600} sx={{ color: th.app.text.secondary }}>
                  Search outline — {Math.round(appearance.accents.searchBorderOpacity * 100)}%
                </Typography>
                <Slider
                  value={appearance.accents.searchBorderOpacity}
                  onChange={(_, v) => actions.setAccents({ searchBorderOpacity: v as number })}
                  min={0.05}
                  max={0.35}
                  step={0.01}
                  size="small"
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                  sx={{ color: th.app.text.primary, "& .MuiSlider-track": { bgcolor: alpha(th.palette.secondary.main, 0.72) } }}
                />
              </Stack>
              <Divider sx={{ borderColor: alpha(th.app.text.primary, 0.08) }} />
              <GlassControls
                title="Sidebar (expert)"
                subtitle="Overrides the simple glass preset until you pick a preset again"
                value={appearance.sidebarChrome}
                onChange={actions.setSidebarChrome}
                th={th}
              />
              <Divider sx={{ borderColor: alpha(th.app.text.primary, 0.08) }} />
              <GlassControls
                title="Top bar (expert)"
                subtitle="Matches sidebar when you use glass presets from the main card"
                value={appearance.headerChrome}
                onChange={actions.setHeaderChrome}
                th={th}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>

      <Typography variant="caption" sx={{ display: "block", mt: 3, color: th.app.text.secondary, fontWeight: 600 }}>
        Stored in this browser only · localStorage
      </Typography>
    </Box>
  );
}
