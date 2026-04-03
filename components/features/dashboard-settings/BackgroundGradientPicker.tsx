"use client";

import { useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export type BackgroundPickerMode = "solid" | "linear" | "mesh";

export type BackgroundGradientPickerProps = {
  onApply: (css: string) => void;
  th: AppTheme;
  shellDark: boolean;
  toggleSlotSx: SxProps<Theme>;
};

function clampHex(raw: string, fallback = "#6366f1"): string {
  let h = raw.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  h = h.slice(1).replace(/[^0-9a-fA-F]/g, "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length !== 6) return fallback;
  return `#${h.toLowerCase()}`;
}

function ColorStop({
  label,
  hex,
  onChange,
  th,
  shellDark,
  fieldOutline,
}: {
  label: string;
  hex: string;
  onChange: (v: string) => void;
  th: AppTheme;
  shellDark: boolean;
  fieldOutline: string;
}) {
  const safe = clampHex(hex);
  const pickerShell = {
    "& .react-colorful": {
      width: "100%",
      height: 188,
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: shellDark
        ? `0 8px 40px ${alpha("#000", 0.45)}, inset 0 1px 0 ${alpha("#fff", 0.06)}`
        : `0 8px 32px ${alpha("#000", 0.08)}, inset 0 1px 0 ${alpha("#fff", 0.9)}`,
      border: `1px solid ${fieldOutline}`,
    },
    "& .react-colorful__saturation": { borderRadius: "13px 13px 0 0" },
    "& .react-colorful__hue": {
      height: 16,
      borderRadius: "0 0 13px 13px",
      margin: 0,
    },
    "& .react-colorful__pointer": {
      width: 22,
      height: 22,
      borderWidth: 3,
      borderColor: "#fff",
      boxShadow: "0 3px 12px rgba(0,0,0,0.4)",
    },
  } as const;

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0 }}>
      <Typography variant="caption" fontWeight={700} sx={{ color: th.app.text.secondary, letterSpacing: 0.04 }}>
        {label}
      </Typography>
      <Box sx={pickerShell}>
        <HexColorPicker color={safe} onChange={(c) => onChange(clampHex(c))} />
      </Box>
      <TextField
        size="small"
        label="Hex"
        value={safe}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ spellCheck: false }}
        sx={{
          "& .MuiOutlinedInput-root": {
            color: th.app.text.primary,
            borderRadius: 2,
            "& fieldset": { borderColor: fieldOutline },
          },
          "& .MuiInputLabel-root": { color: th.app.text.secondary },
        }}
      />
    </Stack>
  );
}

export function BackgroundGradientPicker({
  onApply,
  th,
  shellDark,
  toggleSlotSx,
}: BackgroundGradientPickerProps) {
  const [mode, setMode] = useState<BackgroundPickerMode>("mesh");
  const [solid, setSolid] = useState("#0f172a");
  const [linA, setLinA] = useState("#312e81");
  const [linB, setLinB] = useState("#020617");
  const [linAngle, setLinAngle] = useState(165);
  const [meshGlow, setMeshGlow] = useState("#6366f1");
  const [meshGlowOp, setMeshGlowOp] = useState(0.38);
  const [meshA, setMeshA] = useState("#0f0720");
  const [meshB, setMeshB] = useState("#020617");
  const [meshAngle, setMeshAngle] = useState(165);

  const fieldOutline = alpha(th.app.text.primary, shellDark ? 0.22 : 0.18);

  const builtCss = useMemo(() => {
    if (mode === "solid") return clampHex(solid);
    if (mode === "linear") {
      return `linear-gradient(${linAngle}deg, ${clampHex(linA)} 0%, ${clampHex(linB)} 100%)`;
    }
    const glow = alpha(clampHex(meshGlow), Math.min(0.95, Math.max(0.04, meshGlowOp)));
    return `radial-gradient(ellipse 100% 80% at 50% -18%, ${glow} 0%, transparent 55%), linear-gradient(${meshAngle}deg, ${clampHex(meshA)} 0%, ${clampHex(meshB)} 100%)`;
  }, [mode, solid, linA, linB, linAngle, meshGlow, meshGlowOp, meshA, meshB, meshAngle]);

  const sliderSx = {
    color: th.app.text.primary,
    height: 8,
    padding: "10px 0",
    "& .MuiSlider-track": { bgcolor: alpha(th.palette.primary.main, 0.88), borderRadius: 4, border: "none" },
    "& .MuiSlider-rail": { opacity: shellDark ? 0.2 : 0.16, bgcolor: alpha(th.app.text.primary, 0.16), borderRadius: 4 },
    "& .MuiSlider-thumb": {
      width: 18,
      height: 18,
      border: `2px solid ${alpha("#fff", 0.95)}`,
      boxShadow: `0 2px 10px ${alpha("#000", 0.3)}`,
    },
  } as const;

  return (
    <Box
      sx={{
        mb: 3,
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: "16px",
        bgcolor: alpha(th.app.text.primary, shellDark ? 0.05 : 0.035),
        border: `1px solid ${alpha(th.app.text.primary, shellDark ? 0.1 : 0.09)}`,
        backgroundImage: shellDark
          ? `linear-gradient(165deg, ${alpha("#fff", 0.04)} 0%, transparent 55%)`
          : `linear-gradient(165deg, ${alpha(th.palette.primary.main, 0.05)} 0%, transparent 50%)`,
        boxShadow: shellDark ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
    >
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.65, color: th.app.text.primary, letterSpacing: -0.01 }}>
        Visual background builder
      </Typography>
      <Typography variant="body2" sx={{ mb: 2.25, color: th.app.text.secondary, lineHeight: 1.7, maxWidth: 640 }}>
        Pick colours and angles here, then apply — the CSS field below updates so you can still fine-tune or paste advanced layers.
      </Typography>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, v: BackgroundPickerMode | null) => v != null && setMode(v)}
        sx={{ ...toggleSlotSx, mb: 2.25, flexWrap: "wrap", gap: 0.75 }}
      >
        <ToggleButton value="solid">Solid</ToggleButton>
        <ToggleButton value="linear">Linear gradient</ToggleButton>
        <ToggleButton value="mesh">Mesh (glow + gradient)</ToggleButton>
      </ToggleButtonGroup>

      <Box
        sx={{
          height: { xs: 80, sm: 88 },
          borderRadius: "14px",
          mb: 2.25,
          background: builtCss,
          border: `1px solid ${fieldOutline}`,
          boxShadow: shellDark
            ? "inset 0 0 0 1px rgba(255,255,255,0.07), 0 12px 40px rgba(0,0,0,0.25)"
            : "inset 0 0 0 1px rgba(255,255,255,0.7), 0 8px 28px rgba(15,23,42,0.08)",
        }}
      />

      {mode === "solid" && (
        <ColorStop
          label="Background"
          hex={solid}
          onChange={setSolid}
          th={th}
          shellDark={shellDark}
          fieldOutline={fieldOutline}
        />
      )}

      {mode === "linear" && (
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <ColorStop label="Start" hex={linA} onChange={setLinA} th={th} shellDark={shellDark} fieldOutline={fieldOutline} />
            <ColorStop label="End" hex={linB} onChange={setLinB} th={th} shellDark={shellDark} fieldOutline={fieldOutline} />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ color: th.app.text.secondary }}>
              Angle — {linAngle}°
            </Typography>
            <Slider
              value={linAngle}
              onChange={(_, v) => setLinAngle(v as number)}
              min={0}
              max={360}
              size="small"
              valueLabelDisplay="auto"
              sx={sliderSx}
            />
          </Box>
        </Stack>
      )}

      {mode === "mesh" && (
        <Stack spacing={2}>
          <ColorStop
            label="Top glow"
            hex={meshGlow}
            onChange={setMeshGlow}
            th={th}
            shellDark={shellDark}
            fieldOutline={fieldOutline}
          />
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ color: th.app.text.secondary }}>
              Glow strength — {Math.round(meshGlowOp * 100)}%
            </Typography>
            <Slider
              value={meshGlowOp}
              onChange={(_, v) => setMeshGlowOp(v as number)}
              min={0.05}
              max={0.72}
              step={0.01}
              size="small"
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
              sx={sliderSx}
            />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <ColorStop label="Base (top)" hex={meshA} onChange={setMeshA} th={th} shellDark={shellDark} fieldOutline={fieldOutline} />
            <ColorStop label="Base (bottom)" hex={meshB} onChange={setMeshB} th={th} shellDark={shellDark} fieldOutline={fieldOutline} />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ color: th.app.text.secondary }}>
              Base gradient angle — {meshAngle}°
            </Typography>
            <Slider
              value={meshAngle}
              onChange={(_, v) => setMeshAngle(v as number)}
              min={0}
              max={360}
              size="small"
              valueLabelDisplay="auto"
              sx={sliderSx}
            />
          </Box>
        </Stack>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75} sx={{ mt: 3 }} alignItems={{ sm: "center" }}>
        <Button
          variant="contained"
          onClick={() => onApply(builtCss)}
          sx={{
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "12px",
            px: 2.5,
            py: 1.1,
            boxShadow: `0 8px 24px ${alpha(th.palette.primary.main, shellDark ? 0.35 : 0.25)}`,
            "&:hover": { boxShadow: `0 10px 28px ${alpha(th.palette.primary.main, shellDark ? 0.45 : 0.3)}` },
          }}
        >
          Apply to page background
        </Button>
        <Typography variant="caption" sx={{ color: th.app.text.secondary, fontWeight: 600, lineHeight: 1.5 }}>
          You can edit the generated CSS string after applying.
        </Typography>
      </Stack>
    </Box>
  );
}
