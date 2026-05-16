"use client";

import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { AppTheme } from "@/theme/theme";
import { resolveSx } from "@/utils/resolveSx";
import {
  hexFieldSx,
  popoverFieldsRowSx,
  popoverHelpSx,
  popoverPaperSlotSx,
  popoverTitleSx,
  spectrumCaptionSx,
  spectrumLabelColumnSx,
  spectrumSwatchRingSx,
} from "./styles";

export type ThemeAccentPickerPopoverProps = {
  theme: AppTheme;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  customAccentHex: string;
  setCustomAccentHex: (hex: string) => void;
  hexDraft: string;
  setHexDraft: (v: string) => void;
  onHexBlur: () => void;
};

export function ThemeAccentPickerPopover({
  theme,
  open,
  anchorEl,
  onClose,
  customAccentHex,
  setCustomAccentHex,
  hexDraft,
  setHexDraft,
  onHexBlur,
}: ThemeAccentPickerPopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: popoverPaperSlotSx(theme),
        },
      }}
    >
      <Typography component="h2" variant="medium16" sx={popoverTitleSx}>
        Accent color
      </Typography>
      <Typography variant="small" sx={popoverHelpSx}>
        Choose a hex or use the spectrum. Applies to the custom theme preset.
      </Typography>
      <Box sx={popoverFieldsRowSx}>
        <Box component="label" sx={spectrumLabelColumnSx}>
          <Box component="span" sx={spectrumSwatchRingSx(theme)}>
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
          <Typography variant="caption" sx={spectrumCaptionSx}>
            Spectrum
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
          sx={hexFieldSx(theme)}
          slotProps={{
            htmlInput: { spellCheck: false },
          }}
        />
      </Box>
      <Button type="button" variant="primary" size="small" fullWidth onClick={onClose} sx={resolveSx(gradientPrimaryButtonSx, theme)}>
        Done
      </Button>
    </Popover>
  );
}
