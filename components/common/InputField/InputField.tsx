"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@mui/material/styles";
import { Label } from "@/components/common/Label";
import { textFieldStyles } from "./InputField.styles";
import type { InputFieldProps } from "./InputField.types";
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
  ...rest
}: InputFieldProps) {
  const theme = useTheme();
  const fieldId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <TextField
        id={fieldId}
        name={name}
        placeholder={placeholder}
        inputProps={{
          "aria-label": label,
          maxLength: 40,
          ...inputProps,
        }}
        type={inputType}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        variant="outlined"
        sx={textFieldStyles(theme)}
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
        {...rest}
      />
    </Box>
  );
}
