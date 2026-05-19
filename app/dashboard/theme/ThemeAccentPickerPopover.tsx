"use client";

import Popover from "@mui/material/Popover";
import {
  ThemeAccentHexField,
  ThemeAccentPopoverDoneButton,
  ThemeAccentPopoverFieldsRow,
  ThemeAccentPopoverHelp,
  ThemeAccentPopoverPaper,
  ThemeAccentPopoverTitle,
  ThemeSpectrumCaption,
  ThemeSpectrumInput,
  ThemeSpectrumLabel,
  ThemeSpectrumRing,
} from "./styles/theme-customize.styled";

export type ThemeAccentPickerPopoverProps = {
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
          component: ThemeAccentPopoverPaper,
          elevation: 0,
        },
      }}
    >
      <ThemeAccentPopoverTitle component="h2" variant="medium16">
        Accent color
      </ThemeAccentPopoverTitle>
      <ThemeAccentPopoverHelp variant="small">
        Choose a hex or use the spectrum. Applies to the custom theme preset.
      </ThemeAccentPopoverHelp>
      <ThemeAccentPopoverFieldsRow>
        <ThemeSpectrumLabel>
          <ThemeSpectrumRing>
            <ThemeSpectrumInput
              type="color"
              value={customAccentHex}
              onChange={(e) => setCustomAccentHex(e.target.value)}
              aria-label="Choose accent color"
            />
          </ThemeSpectrumRing>
          <ThemeSpectrumCaption variant="caption">Spectrum</ThemeSpectrumCaption>
        </ThemeSpectrumLabel>
        <ThemeAccentHexField
          size="small"
          label="Hex"
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={onHexBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") onHexBlur();
          }}
          slotProps={{
            htmlInput: { spellCheck: false },
          }}
        />
      </ThemeAccentPopoverFieldsRow>
      <ThemeAccentPopoverDoneButton type="button" variant="primary" size="small" onClick={onClose}>
        Done
      </ThemeAccentPopoverDoneButton>
    </Popover>
  );
}
