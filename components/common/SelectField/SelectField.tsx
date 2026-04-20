"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Label } from "@/components/common/Label";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
import { FORM_MODAL_MUI_OVERLAY_Z_INDEX } from "@/lib/ui/dialogStacking";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import { selectFieldStyles, selectMenuItemSx, selectMenuPaperSx } from "./SelectField.styles";

export interface SelectFieldOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Cap visible menu height to this many rows; extra options scroll inside the panel. */
  menuMaxRows?: number;
  /** For scroll-to-error: sets `data-setup-scroll-anchor` (comma-separated paths allowed). */
  scrollAnchorPath?: string;
}

/** Dense `MenuItem` row height used only when `menuMaxRows` is set (compact, predictable scroll). */
const MENU_ITEM_DENSE_APPROX_PX = 40;
const MENU_LIST_EDGE_PADDING_PX = 12;

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  menuMaxRows,
  scrollAnchorPath,
}: SelectFieldProps) {
  const theme = useTheme() as AppTheme;
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");
  const menuCapped = menuMaxRows != null && menuMaxRows > 0;
  const menuMaxHeightPx = menuCapped
    ? menuMaxRows * MENU_ITEM_DENSE_APPROX_PX + MENU_LIST_EDGE_PADDING_PX
    : null;

  /**
   * MUI Menu `Paper` defaults to a large max-height; we cap height and keep scrolling on the
   * `MenuList` so options are not visually “cut” at the panel edge.
   */
  const menuListSx = menuMaxHeightPx
    ? {
        flex: "1 1 auto",
        minHeight: 0,
        maxHeight: "100%",
        overflowY: "auto",
        overscrollBehavior: "contain",
        py: 0.5,
        // Keep dropdown scroll behavior but hide scrollbar visuals.
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }
    : undefined;

  const menuPaperSx = menuMaxHeightPx
    ? {
        maxHeight: `${menuMaxHeightPx}px`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : undefined;

  const paperStyle = menuMaxHeightPx
    ? ({
        maxHeight: menuMaxHeightPx,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      } as const)
    : undefined;

  return (
    <Box
      sx={{ width: "100%" }}
      {...(scrollAnchorPath ? { "data-setup-scroll-anchor": scrollAnchorPath } : {})}
    >
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <TextField
        id={fieldId}
        select
        fullWidth
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onMouseMove={applyOutlineFieldCursorPosition}
        onMouseLeave={resetOutlineFieldCursorPosition}
        placeholder={placeholder}
        variant="outlined"
        sx={[textFieldStyles(theme), ...selectFieldStyles(theme)]}
        SelectProps={{
          MenuProps: {
            sx: { zIndex: FORM_MODAL_MUI_OVERLAY_Z_INDEX },
            ...(menuCapped ? { marginThreshold: 8 } : {}),
            MenuListProps: menuListSx ? { sx: menuListSx } : undefined,
            PaperProps: {
              sx: [selectMenuPaperSx(theme), menuPaperSx ?? {}],
              ...(paperStyle ? { style: paperStyle } : {}),
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            dense={menuCapped}
            sx={[
              selectMenuItemSx(theme),
              menuCapped
                ? {
                    minHeight: MENU_ITEM_DENSE_APPROX_PX,
                    py: 0.75,
                    fontSize: 13,
                  }
                : {},
            ]}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
