"use client";

import { useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ViewSidebarRoundedIcon from "@mui/icons-material/ViewSidebarRounded";
import WebAssetRoundedIcon from "@mui/icons-material/WebAssetRounded";
import Chip from "@mui/material/Chip";
import Slider from "@mui/material/Slider";
import type { SliderProps } from "@mui/material/Slider";
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

function SectionStep({
  step,
  title,
  subtitle,
  th,
  shellDark,
}: {
  step: number;
  title: string;
  subtitle: string;
  th: AppTheme;
  shellDark: boolean;
}) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
      <Box
        aria-hidden
        sx={{
          width: 44,
          height: 44,
          borderRadius: "14px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "1rem",
          bgcolor: alpha(th.palette.primary.main, shellDark ? 0.18 : 0.1),
          color: th.palette.primary.main,
          border: `1px solid ${alpha(th.palette.primary.main, shellDark ? 0.4 : 0.28)}`,
          boxShadow: shellDark
            ? `0 4px 14px ${alpha(th.palette.primary.main, 0.15)}, inset 0 1px 0 ${alpha("#fff", 0.08)}`
            : `0 4px 12px ${alpha(th.palette.primary.main, 0.12)}`,
        }}
      >
        {step}
      </Box>
      <Box sx={{ minWidth: 0, pt: 0.35 }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: th.app.text.primary, mb: 0.65, lineHeight: 1.3, letterSpacing: -0.02 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.7, maxWidth: 720 }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

function useAdaptiveSettingsShell(appearanceBackgroundCss: string) {
  const dark = isDarkAppearanceBackground(appearanceBackgroundCss);
  return useMemo(
    () =>
      ({
        dark,
        /** Settings cards — always readable on light OR dark canvases */
        card: {
          borderRadius: "16px",
          border: `1px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(15, 23, 42, 0.08)"}`,
          background: dark
            ? "linear-gradient(165deg, rgba(30, 41, 59, 0.78) 0%, rgba(15, 23, 42, 0.82) 50%, rgba(15, 23, 42, 0.76) 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 252, 0.94) 100%)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: dark
            ? "0 4px 6px rgba(0,0,0,0.15), 0 24px 56px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 4px 6px rgba(15,23,42,0.04), 0 20px 48px rgba(15,23,42,0.09), inset 0 1px 0 rgba(255,255,255,1)",
        },
        previewFrame: {
          border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)"}`,
          boxShadow: dark
            ? "inset 0 0 0 1px rgba(0,0,0,0.25), 0 8px 32px rgba(0,0,0,0.2)"
            : "inset 0 0 0 1px rgba(255,255,255,0.7), 0 8px 24px rgba(15,23,42,0.06)",
        },
        presetMetaBg: dark ? "rgba(15, 23, 42, 0.72)" : "rgba(255,255,255,0.96)",
        presetMetaBorder: dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)",
      }) as const,
    [dark]
  );
}

function LabeledSlider({
  label,
  hint,
  valueLabel,
  th,
  shellDark,
  trackColor = "primary",
  ...sliderProps
}: Omit<SliderProps, "sx"> & {
  label: string;
  hint?: string;
  valueLabel: string;
  th: AppTheme;
  shellDark: boolean;
  trackColor?: "primary" | "secondary" | "info";
}) {
  const track =
    trackColor === "primary"
      ? alpha(th.palette.primary.main, 0.88)
      : trackColor === "secondary"
        ? alpha(th.palette.secondary.main, 0.88)
        : alpha(th.palette.info.main, 0.75);
  return (
    <Box sx={{ py: 1 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5} sx={{ mb: 1.25 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: th.app.text.primary, letterSpacing: -0.01 }}>
            {label}
          </Typography>
          {hint ? (
            <Typography variant="caption" sx={{ color: th.app.text.secondary, lineHeight: 1.5, display: "block", mt: 0.4 }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
        <Chip
          label={valueLabel}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.6875rem",
            height: 30,
            borderRadius: "10px",
            flexShrink: 0,
            bgcolor: alpha(th.palette.primary.main, shellDark ? 0.2 : 0.1),
            color: th.app.text.primary,
            border: `1px solid ${alpha(th.palette.primary.main, shellDark ? 0.35 : 0.22)}`,
            letterSpacing: "0.02em",
          }}
        />
      </Stack>
      <Slider
        sx={{
          color: th.app.text.primary,
          height: 8,
          padding: "12px 0",
          "& .MuiSlider-track": { bgcolor: track, border: "none", borderRadius: 4 },
          "& .MuiSlider-rail": {
            opacity: shellDark ? 0.22 : 0.18,
            bgcolor: alpha(th.app.text.primary, 0.18),
            borderRadius: 4,
          },
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            boxShadow: `0 2px 12px ${alpha("#000", 0.3)}, 0 0 0 3px ${alpha(th.palette.primary.main, 0.2)}`,
            border: `2px solid ${alpha("#fff", 0.95)}`,
            "&:hover, &.Mui-focusVisible": { boxShadow: `0 4px 16px ${alpha("#000", 0.35)}, 0 0 0 4px ${alpha(th.palette.primary.main, 0.25)}` },
          },
        }}
        {...sliderProps}
      />
    </Box>
  );
}

function AdvancedSubCard({
  icon,
  title,
  subtitle,
  children,
  th,
  shellDark,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  th: AppTheme;
  shellDark: boolean;
}) {
  return (
    <Box
      sx={{
        borderRadius: "14px",
        p: { xs: 2.25, sm: 3 },
        border: `1px solid ${alpha(th.app.text.primary, shellDark ? 0.1 : 0.08)}`,
        bgcolor: alpha(th.app.text.primary, shellDark ? 0.045 : 0.025),
        backgroundImage: shellDark
          ? `linear-gradient(160deg, ${alpha("#fff", 0.045)} 0%, transparent 50%)`
          : `linear-gradient(160deg, ${alpha(th.palette.primary.main, 0.06)} 0%, transparent 52%)`,
        boxShadow: shellDark
          ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.2)"
          : "inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: th.palette.primary.main,
            bgcolor: alpha(th.palette.primary.main, shellDark ? 0.18 : 0.1),
            border: `1px solid ${alpha(th.palette.primary.main, shellDark ? 0.38 : 0.26)}`,
            boxShadow: shellDark ? `0 4px 16px ${alpha(th.palette.primary.main, 0.12)}` : "none",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, pt: 0.2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: th.app.text.primary, letterSpacing: -0.02, mb: 0.35 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.58 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      {children}
    </Box>
  );
}

function NavColorTile({
  title,
  hint,
  hex,
  onChange,
  th,
  shellDark,
}: {
  title: string;
  hint: string;
  hex: string;
  onChange: (v: string) => void;
  th: AppTheme;
  shellDark: boolean;
}) {
  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: "14px",
        border: `1px solid ${alpha(th.app.text.primary, shellDark ? 0.09 : 0.08)}`,
        bgcolor: alpha(th.app.text.primary, shellDark ? 0.04 : 0.02),
        transition: "border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease",
        "&:hover": {
          borderColor: alpha(th.palette.primary.main, 0.45),
          boxShadow: `0 12px 36px ${alpha(th.palette.primary.main, shellDark ? 0.14 : 0.1)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          component="label"
          sx={{
            position: "relative",
            width: 54,
            height: 54,
            flexShrink: 0,
            cursor: "pointer",
            borderRadius: "12px",
            overflow: "hidden",
            border: `2px solid ${alpha(th.app.text.primary, 0.1)}`,
            boxShadow: `inset 0 2px 8px ${alpha("#000", 0.15)}, 0 6px 20px ${alpha("#000", 0.12)}`,
          }}
        >
          <Box sx={{ position: "absolute", inset: 0, bgcolor: hex, pointerEvents: "none" }} aria-hidden />
          <Box
            component="input"
            type="color"
            value={hex}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={800} sx={{ color: th.app.text.primary }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: th.app.text.secondary, lineHeight: 1.45, display: "block", mt: 0.25 }}>
            {hint}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function GlassControls({
  title,
  subtitle,
  value,
  onChange,
  th,
  shellDark,
  icon,
}: {
  title: string;
  subtitle: string;
  value: GlassChrome;
  onChange: (patch: Partial<GlassChrome>) => void;
  th: AppTheme;
  shellDark: boolean;
  icon: React.ReactNode;
}) {
  return (
    <AdvancedSubCard icon={icon} title={title} subtitle={subtitle} th={th} shellDark={shellDark}>
      <Stack spacing={0.25} divider={<Divider flexItem sx={{ borderColor: alpha(th.app.text.primary, 0.06), my: 0.5 }} />}>
        <LabeledSlider
          label="Background blur"
          hint="How much the wallpaper shows through the frosted panel"
          valueLabel={`${value.blurPx}px`}
          th={th}
          shellDark={shellDark}
          trackColor="primary"
          value={value.blurPx}
          onChange={(_, v) => onChange({ blurPx: v as number })}
          min={0}
          max={40}
          size="small"
          valueLabelDisplay="auto"
        />
        <LabeledSlider
          label="Frost thickness"
          hint="More frost = a stronger, cloudier panel"
          valueLabel={`${Math.round(value.fillOpacity * 100)}%`}
          th={th}
          shellDark={shellDark}
          trackColor="secondary"
          value={value.fillOpacity}
          onChange={(_, v) => onChange({ fillOpacity: v as number })}
          min={0.05}
          max={0.92}
          step={0.01}
          size="small"
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
        />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems={{ md: "flex-end" }} sx={{ pt: 1 }}>
          <Box sx={{ flex: { md: "0 0 auto" } }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: th.app.text.primary, mb: 0.5 }}>
              Panel tint
            </Typography>
            <Typography variant="caption" sx={{ color: th.app.text.secondary, display: "block", mb: 1.25, maxWidth: 200 }}>
              Subtle colour wash on the glass
            </Typography>
            <Box
              component="label"
              sx={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 1.25,
                cursor: "pointer",
                px: 1.5,
                py: 1,
                borderRadius: "8px",
                border: `1px solid ${alpha(th.app.text.primary, 0.12)}`,
                bgcolor: alpha(th.app.text.primary, shellDark ? 0.06 : 0.04),
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "6px",
                  border: `2px solid ${alpha(th.app.text.primary, 0.12)}`,
                  bgcolor: value.tintHex,
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)",
                }}
              />
            <Typography variant="caption" fontWeight={700} sx={{ color: th.app.text.secondary }}>
              Tap to change
            </Typography>
              <Box
                component="input"
                type="color"
                value={value.tintHex}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ tintHex: e.target.value })}
                sx={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          </Box>
          <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
            <LabeledSlider
              label="Edge highlight"
              hint="Soft border along the panel edge"
              valueLabel={`${Math.round(value.borderOpacity * 100)}%`}
              th={th}
              shellDark={shellDark}
              trackColor="info"
              value={value.borderOpacity}
              onChange={(_, v) => onChange({ borderOpacity: v as number })}
              min={0}
              max={0.35}
              step={0.01}
              size="small"
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            />
          </Box>
        </Stack>
      </Stack>
    </AdvancedSubCard>
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
    gap: 0.75,
    flexWrap: "wrap",
    "& .MuiToggleButton-root": {
      color: th.app.text.secondary,
      borderColor: alpha(th.app.text.primary, shell.dark ? 0.14 : 0.12),
      textTransform: "none",
      fontWeight: 600,
      px: 2.25,
      py: 0.75,
      borderRadius: "12px !important",
      transition: "background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
      "&:hover": {
        bgcolor: alpha(th.palette.primary.main, shell.dark ? 0.08 : 0.06),
        borderColor: alpha(th.palette.primary.main, 0.35),
      },
    },
    "& .Mui-selected": {
      bgcolor: `${alpha(th.palette.primary.main, shell.dark ? 0.28 : 0.14)} !important`,
      color: `${th.app.text.primary} !important`,
      borderColor: `${alpha(th.palette.primary.main, 0.5)} !important`,
      boxShadow: `0 4px 16px ${alpha(th.palette.primary.main, shell.dark ? 0.2 : 0.12)}`,
    },
  };

  return (
    <Box sx={{ maxWidth: 920, mx: "auto", pb: 8, px: { xs: 0, sm: 1.5 } }}>
      <Card
        elevation={0}
        sx={{
          ...shell.card,
          mb: 3.5,
          overflow: "hidden",
          borderRadius: "18px",
        }}
      >
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${th.palette.primary.main} 0%, ${th.palette.secondary.main} 50%, ${alpha(th.palette.secondary.main, 0.45)} 100%)`,
            opacity: 0.95,
          }}
        />
        <CardContent sx={{ py: { xs: 3, sm: 3.75 }, px: { xs: 2.5, sm: 3.5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ md: "flex-start" }}>
            <Stack direction="row" spacing={2.25} sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(145deg, ${alpha(th.palette.primary.main, shell.dark ? 0.28 : 0.16)} 0%, ${alpha(th.palette.secondary.main, shell.dark ? 0.12 : 0.08)} 100%)`,
                  border: `1px solid ${alpha(th.palette.primary.main, shell.dark ? 0.42 : 0.3)}`,
                  color: th.palette.primary.main,
                  boxShadow: shell.dark ? `0 8px 28px ${alpha(th.palette.primary.main, 0.18)}` : `0 6px 20px ${alpha(th.palette.primary.main, 0.12)}`,
                }}
              >
                <PaletteRoundedIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="overline"
                  sx={{ letterSpacing: "0.16em", fontWeight: 800, color: th.app.text.secondary, display: "block", mb: 0.65, opacity: 0.95 }}
                >
                  Theme studio
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: -0.8,
                    color: th.app.text.primary,
                    mb: 1.25,
                    fontSize: { xs: "1.55rem", sm: "2.05rem" },
                    lineHeight: 1.15,
                  }}
                >
                  Your dashboard look
                </Typography>
                <Typography sx={{ color: th.app.text.secondary, maxWidth: 560, lineHeight: 1.72, fontSize: "0.9375rem" }}>
                  Everything here applies <strong>only to you</strong> — other people in your organization keep their own theme. Pick a wallpaper, keep text easy to read, then adjust cards and the menu. When your product connects to a backend, the same choices can be saved on your account and loaded on any device.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              onClick={actions.resetToDefaults}
              sx={{
                alignSelf: { xs: "stretch", md: "center" },
                flexShrink: 0,
                borderColor: alpha(th.app.text.primary, shell.dark ? 0.28 : 0.22),
                color: th.app.text.primary,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "12px",
                px: 2.75,
                py: 1.25,
                transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  borderColor: alpha(th.palette.primary.main, 0.55),
                  bgcolor: alpha(th.palette.primary.main, shell.dark ? 0.1 : 0.06),
                  boxShadow: `0 6px 20px ${alpha(th.palette.primary.main, 0.12)}`,
                },
              }}
            >
              Reset everything
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Alert
        severity="info"
        variant="outlined"
        sx={{
          mb: 3.5,
          borderRadius: "14px",
          alignItems: "flex-start",
          bgcolor: alpha(th.palette.info.main, shell.dark ? 0.08 : 0.04),
          borderColor: alpha(th.palette.info.main, 0.35),
          color: th.app.text.primary,
          "& .MuiAlert-icon": { color: th.palette.info.main },
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
          Where your theme is stored today
        </Typography>
        <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.6 }}>
          Right now these settings are saved in <strong>this browser</strong> (local storage). They do not change anyone else&apos;s dashboard. When you wire up your API, load and save the same data per user — use{" "}
          <Box component="span" sx={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem", color: th.app.text.primary }}>
            mergeDashboardAppearanceFromApi
          </Box>{" "}
          so partial responses still work.
        </Typography>
      </Alert>

      {/* Live miniature — shows current shell on real canvas */}
      <Card elevation={0} sx={{ ...shell.card, mb: 3.5, overflow: "hidden", borderRadius: "18px" }}>
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2.25 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: th.app.text.primary, letterSpacing: -0.01, mb: 0.35 }}>
                Live preview
              </Typography>
              <Typography variant="caption" sx={{ color: th.app.text.secondary, fontWeight: 600, lineHeight: 1.5 }}>
                Sidebar, top bar, and content — matches your choices below
              </Typography>
            </Box>
          </Stack>
          <Box
            sx={{
              position: "relative",
              borderRadius: "14px",
              overflow: "hidden",
              height: { xs: 148, sm: 168 },
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
                  ...glassChromeLayerSx(appearance.sidebarChrome, { surround: true, borderRadius: 4 }),
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

      <Stack spacing={3.5} sx={{ pt: 0.5 }}>
        <Card elevation={0} sx={{ ...shell.card, borderRadius: "18px" }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <SectionStep
              step={1}
              title="Wallpaper"
              subtitle="Start with a sample, use the colour tool for solid or gradient looks, or open Advanced only if you need to paste full CSS. Your backend can save this same background string per user."
              th={th}
              shellDark={shell.dark}
            />
            <BackgroundGradientPicker
              onApply={actions.setBackgroundCss}
              th={th}
              shellDark={shell.dark}
              toggleSlotSx={toggleSlotSx}
            />
            <Typography variant="subtitle2" sx={{ mb: 1.5, mt: 0.5, color: th.app.text.primary, fontWeight: 800, letterSpacing: -0.01 }}>
              Quick samples
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
                gap: 1.5,
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
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      boxShadow: selected
                        ? `0 0 0 2px ${th.palette.primary.main}, 0 12px 32px ${alpha(th.palette.primary.main, 0.25)}`
                        : `0 4px 14px rgba(0,0,0,${shell.dark ? 0.28 : 0.07})`,
                      "&:hover": { transform: "translateY(-3px)", boxShadow: `0 12px 28px rgba(0,0,0,${shell.dark ? 0.35 : 0.1})` },
                      "&:focus-visible": { boxShadow: `0 0 0 2px ${th.palette.primary.main}` },
                    }}
                  >
                    <Box sx={{ height: 52, background: p.value, width: "100%" }} />
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        px: 1.25,
                        py: 1,
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

            <Accordion
              disableGutters
              elevation={0}
              sx={{
                mt: 3,
                borderRadius: "14px",
                border: `1px solid ${alpha(th.app.text.primary, shell.dark ? 0.1 : 0.09)}`,
                bgcolor: alpha(th.app.text.primary, shell.dark ? 0.045 : 0.028),
                "&:before": { display: "none" },
                overflow: "hidden",
                transition: "border-color 0.2s ease",
                "&:hover": { borderColor: alpha(th.palette.primary.main, 0.22) },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: th.app.text.secondary }} />}>
                <Box>
                  <Typography fontWeight={800} sx={{ color: th.app.text.primary }}>
                    Advanced · paste or edit background code
                  </Typography>
                  <Typography variant="caption" sx={{ color: th.app.text.secondary, display: "block", mt: 0.25 }}>
                    Full CSS <code style={{ fontSize: "0.8em" }}>background</code> string. Only needed if you are copying from Figma or stacking many layers.
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <TextField
                  label="Background (CSS)"
                  multiline
                  minRows={4}
                  fullWidth
                  value={appearance.backgroundCss}
                  onChange={(e) => actions.setBackgroundCss(e.target.value)}
                  placeholder="e.g. linear-gradient(180deg, #020617 0%, #000 100%)"
                  sx={{
                    ...sharedFieldSx,
                    "& textarea": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5 },
                  }}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              disableGutters
              elevation={0}
              sx={{
                mt: 2,
                borderRadius: "14px",
                border: `1px solid ${alpha(th.palette.info.main, 0.28)}`,
                bgcolor: alpha(th.palette.info.main, shell.dark ? 0.07 : 0.04),
                "&:before": { display: "none" },
                overflow: "hidden",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: th.app.text.secondary }} />}>
                <Typography fontWeight={800} sx={{ color: th.app.text.primary }}>
                  Developers · API &amp; merging defaults
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.65 }}>
                  Send and load the same JSON shape as this screen (background string, text mode, colours, sidebar width, glass preset, chrome, accents, ui). If the API omits fields, merge with{" "}
                  <Box component="span" sx={{ fontFamily: "ui-monospace, monospace", color: th.app.text.primary, fontSize: "0.8125rem" }}>
                    mergeDashboardAppearanceFromApi(partial)
                  </Box>{" "}
                  from{" "}
                  <Box component="span" sx={{ fontFamily: "ui-monospace, monospace", color: th.app.text.primary, fontSize: "0.8125rem" }}>
                    lib/dashboard-appearance/mergeFromApi.ts
                  </Box>{" "}
                  so missing keys keep product defaults. See the JSDoc there for an example payload.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ ...shell.card, borderRadius: "18px" }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <SectionStep
              step={2}
              title="Reading comfort"
              subtitle="We can pick text and menu colours for you so everything stays readable on light or dark wallpapers. Switch to custom only if your brand needs exact hex values."
              th={th}
              shellDark={shell.dark}
            />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={appearance.textMode}
              onChange={(_, v) => v != null && actions.setTextMode(v)}
              sx={{ ...toggleSlotSx, mb: 1 }}
            >
              <ToggleButton value="auto">Recommended · auto</ToggleButton>
              <ToggleButton value="manual">I choose colours</ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" sx={{ color: th.app.text.secondary, display: "block", mb: 2, lineHeight: 1.55 }}>
              Auto updates when you change the wallpaper. Custom unlocks manual swatches and the menu colour controls under Advanced.
            </Typography>
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
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ ...shell.card, borderRadius: "18px" }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <SectionStep
              step={3}
              title="Cards, charts & numbers"
              subtitle="How dashboard widgets look on top of your wallpaper — only for your view. Auto keeps cards and graphs in harmony with your text settings."
              th={th}
              shellDark={shell.dark}
            />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={appearance.ui.mode}
              onChange={(_, v) => v != null && actions.setUi({ mode: v })}
              sx={{ ...toggleSlotSx, mb: 2 }}
            >
              <ToggleButton value="auto">Recommended · auto</ToggleButton>
              <ToggleButton value="manual">Custom card &amp; chart colours</ToggleButton>
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
                        borderRadius: "8px",
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
                Cards and charts follow your wallpaper and text settings automatically. Switch to <strong>Custom card &amp; chart colours</strong> if you need exact tints for brand or accessibility.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ ...shell.card, borderRadius: "18px" }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <SectionStep
              step={4}
              title="Menu & top bar"
              subtitle="Sidebar width and glass style apply only to your dashboard shell. One choice keeps the left menu and top bar visually matched."
              th={th}
              shellDark={shell.dark}
            />

            <Typography variant="subtitle2" sx={{ mb: 1.25, color: th.app.text.primary, fontWeight: 800, letterSpacing: -0.01 }}>
              Menu width
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={appearance.sidebarWidth}
              onChange={(_, v) => v != null && actions.setSidebarWidth(v)}
              sx={{ ...toggleSlotSx, mb: 3 }}
            >
              {SIDEBAR_WIDTH_OPTIONS.map((o) => (
                <ToggleButton key={o.id} value={o.id}>
                  {o.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Typography variant="subtitle2" sx={{ mb: 1.25, color: th.app.text.primary, fontWeight: 800, letterSpacing: -0.01 }}>
              Glass strength
            </Typography>
            <Stack spacing={1.5}>
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
                      p: 2,
                      borderRadius: "14px",
                      cursor: "pointer",
                      border: selected
                        ? `2px solid ${th.palette.primary.main}`
                        : `1px solid ${alpha(th.app.text.primary, shell.dark ? 0.12 : 0.1)}`,
                      bgcolor: selected
                        ? alpha(th.palette.primary.main, shell.dark ? 0.14 : 0.09)
                        : alpha(th.app.text.primary, shell.dark ? 0.035 : 0.025),
                      transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                      boxShadow: selected ? `0 8px 28px ${alpha(th.palette.primary.main, shell.dark ? 0.15 : 0.1)}` : "none",
                      "&:hover": {
                        borderColor: alpha(th.palette.primary.main, 0.5),
                        transform: "translateY(-1px)",
                        boxShadow: `0 10px 28px ${alpha("#000", shell.dark ? 0.25 : 0.06)}`,
                      },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: th.app.text.primary, letterSpacing: -0.01, mb: 0.35 }}>
                      {o.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.6 }}>
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
            borderRadius: "18px",
            "&:before": { display: "none" },
            overflow: "hidden",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 28,
              right: 28,
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${th.palette.primary.main}, ${th.palette.secondary.main})`,
              opacity: 0.85,
              pointerEvents: "none",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: th.app.text.secondary }} />}
            sx={{ px: { xs: 2.5, sm: 3 }, pt: 3, pb: 2.25, alignItems: "flex-start" }}
          >
            <Stack direction="row" spacing={2.25} alignItems="flex-start" sx={{ pr: 1 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: th.palette.primary.main,
                  bgcolor: alpha(th.palette.primary.main, shell.dark ? 0.18 : 0.1),
                  border: `1px solid ${alpha(th.palette.primary.main, shell.dark ? 0.38 : 0.26)}`,
                  boxShadow: shell.dark ? `0 6px 20px ${alpha(th.palette.primary.main, 0.12)}` : "none",
                }}
              >
                <TuneRoundedIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: th.app.text.primary, letterSpacing: -0.02 }}>
                  Advanced options
                </Typography>
                <Typography variant="body2" sx={{ color: th.app.text.secondary, lineHeight: 1.55, mt: 0.5 }}>
                  Fine-tune search, menu colours, and glass panels — optional polish for a premium feel.
                </Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: { xs: 2, sm: 3 }, pb: 3.5 }}>
            <Stack spacing={3}>
              <AdvancedSubCard
                icon={<PaletteRoundedIcon sx={{ fontSize: 24 }} />}
                title="Menu colours"
                subtitle={
                  appearance.textMode === "auto"
                    ? "We pick these from your wallpaper while “Recommended · auto” is on. Switch to “I choose colours” in step 2 to edit them here."
                    : "Tap a swatch to refine section titles, links, and the active icon — perfect for strict brand guidelines."
                }
                th={th}
                shellDark={shell.dark}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                    gap: 1.5,
                    opacity: appearance.textMode === "manual" ? 1 : 0.5,
                    pointerEvents: appearance.textMode === "manual" ? "auto" : "none",
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <NavColorTile
                    title="Section titles"
                    hint="Small labels and group headings in the menu"
                    hex={appearance.accents.navLabelHex}
                    onChange={(v) => actions.setAccents({ navLabelHex: v })}
                    th={th}
                    shellDark={shell.dark}
                  />
                  <NavColorTile
                    title="Menu links"
                    hint="Normal items before you click"
                    hex={appearance.accents.navItemHex}
                    onChange={(v) => actions.setAccents({ navItemHex: v })}
                    th={th}
                    shellDark={shell.dark}
                  />
                  <NavColorTile
                    title="Active page icon"
                    hint="Highlights where you are now"
                    hex={appearance.accents.navActiveIconHex}
                    onChange={(v) => actions.setAccents({ navActiveIconHex: v })}
                    th={th}
                    shellDark={shell.dark}
                  />
                </Box>
              </AdvancedSubCard>

              <AdvancedSubCard
                icon={<SearchRoundedIcon sx={{ fontSize: 24 }} />}
                title="Search bar"
                subtitle="So the search pill feels at home on your background — subtle tweaks, big difference."
                th={th}
                shellDark={shell.dark}
              >
                <Stack spacing={2.5} divider={<Divider flexItem sx={{ borderColor: alpha(th.app.text.primary, 0.06) }} />}>
                  <LabeledSlider
                    label="Fill strength"
                    hint="How solid the search field looks behind the text"
                    valueLabel={`${Math.round(appearance.accents.searchFillOpacity * 100)}%`}
                    th={th}
                    shellDark={shell.dark}
                    trackColor="primary"
                    value={appearance.accents.searchFillOpacity}
                    onChange={(_, v) => actions.setAccents({ searchFillOpacity: v as number })}
                    min={0.02}
                    max={0.2}
                    step={0.01}
                    size="small"
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                  />
                  <LabeledSlider
                    label="Outline"
                    hint="Soft ring around the search pill"
                    valueLabel={`${Math.round(appearance.accents.searchBorderOpacity * 100)}%`}
                    th={th}
                    shellDark={shell.dark}
                    trackColor="secondary"
                    value={appearance.accents.searchBorderOpacity}
                    onChange={(_, v) => actions.setAccents({ searchBorderOpacity: v as number })}
                    min={0.05}
                    max={0.35}
                    step={0.01}
                    size="small"
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                  />
                </Stack>
              </AdvancedSubCard>

              <GlassControls
                title="Sidebar glass"
                subtitle="Overrides the quick preset from step 4 until you pick a preset again."
                value={appearance.sidebarChrome}
                onChange={actions.setSidebarChrome}
                th={th}
                shellDark={shell.dark}
                icon={<ViewSidebarRoundedIcon sx={{ fontSize: 24 }} />}
              />
              <GlassControls
                title="Top bar glass"
                subtitle="Usually matches the sidebar — separate controls if you want the header calmer or sharper."
                value={appearance.headerChrome}
                onChange={actions.setHeaderChrome}
                th={th}
                shellDark={shell.dark}
                icon={<WebAssetRoundedIcon sx={{ fontSize: 24 }} />}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>

      <Typography variant="caption" sx={{ display: "block", mt: 3, color: th.app.text.secondary, fontWeight: 600, lineHeight: 1.6 }}>
        Saved in this browser for now. When your backend stores theme JSON per user, the same settings can follow them on every device.
      </Typography>
    </Box>
  );
}
