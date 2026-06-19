"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@mui/material/styles";
import { Label } from "@/components/common/Label";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "./outlineFieldCursor";
import { textFieldStyles } from "./InputField.styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { InputFieldProps } from "./InputField.types";
import { resolveSx } from "@/utils/resolveSx";
import { formatPhoneInputValue } from "@/lib/ui/format-phone-input";
import { eyeSvg, hideEyeSvg } from "@/assets";

export function InputField({
  label,
  placeholder,
  type = "text",
  name,
  id,
  error = false,
  helperText,
  fullWidth = true,
  inputProps,
  sx,
  scrollAnchorPath,
  dense = false,
  ...rest
}: InputFieldProps) {
  const theme = useTheme();
  const fieldId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  const isPasswordField = type === "password";
  const isPhoneField = type === "phone";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPasswordField && showPassword ? "text" : isPhoneField ? "tel" : type;
  const { onMouseMove, onMouseLeave, onChange, ...textFieldRest } = rest;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    applyOutlineFieldCursorPosition(event);
    onMouseMove?.(event as unknown as MouseEvent<HTMLInputElement>);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    resetOutlineFieldCursorPosition(event);
    onMouseLeave?.(event as unknown as MouseEvent<HTMLInputElement>);
  };

  /** One-line helper slot so validation text does not shift the field layout. */
  const hasHelperMessage = Boolean(helperText?.trim());
  const helperSlot = hasHelperMessage ? helperText : "\u00a0";
  const hideEmptyHelper = !hasHelperMessage && !error;
  const showLabel = Boolean(label.trim());

  return (
    <Box
      sx={{ width: fullWidth ? "100%" : "auto" }}
      {...(scrollAnchorPath ? { "data-setup-scroll-anchor": scrollAnchorPath } : {})}
    >
      {showLabel ? (
        <Label
          htmlFor={fieldId}
          variant={dense ? "mediumSmall" : "mediumLarge"}
          sx={{
            mb: dense ? 0.5 : 0.75,
            ...(error ? { color: theme.palette.error.main } : {}),
          }}
        >
          {label}
        </Label>
      ) : null}
      <TextField
        id={fieldId}
        name={name}
        placeholder={placeholder}
        inputProps={{
          "aria-label": showLabel ? label : name ?? fieldId,
          ...(isPhoneField ? { inputMode: "tel" as const } : {}),
          ...inputProps,
        }}
        type={inputType}
        error={error}
        helperText={helperSlot}
        onChange={(event) => {
          if (isPhoneField && onChange) {
            const formatted = formatPhoneInputValue(event.target.value);
            onChange({
              ...event,
              target: { ...event.target, value: formatted },
              currentTarget: { ...event.currentTarget, value: formatted },
            });
            return;
          }
          onChange?.(event);
        }}
        FormHelperTextProps={{
          sx: (t) => ({
            minHeight: "1.25rem",
            lineHeight: 1.43,
            display: "block",
            marginTop: t.spacing(0.75),
            ...(error && hasHelperMessage ? { color: t.palette.error.main } : {}),
            ...(hideEmptyHelper
              ? { color: "transparent", userSelect: "none", pointerEvents: "none" as const }
              : {}),
          }),
          ...(hideEmptyHelper ? { "aria-hidden": true } : {}),
        }}
        fullWidth={fullWidth}
        variant="outlined"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        sx={
          [
            textFieldStyles(theme),
            error
              ? {
                  "& .MuiOutlinedInput-root.Mui-error": {
                    "&::before": {
                      backgroundColor: `${theme.palette.error.main} !important`,
                      height: "3px",
                    },
                  },
                }
              : {},
            ...(sx ? [resolveSx(sx, theme)] : []),
          ] as SxProps<Theme>
        }
        InputProps={
          isPasswordField
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      sx={{ color: theme.app.text.iconMuted }}
                    >
                      <Box
                        component="img"
                        src={showPassword ? hideEyeSvg : eyeSvg}
                        alt=""
                        sx={{ width: 27, height: 27 }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined
        }
        {...textFieldRest}
      />
    </Box>
  );
}
