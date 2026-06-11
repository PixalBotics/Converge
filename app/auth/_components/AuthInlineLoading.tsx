"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { authLoadingSlotStyles } from "../auth-layout.styles";

type AuthInlineLoadingProps = {
  message: string;
};

export function AuthInlineLoading({ message }: AuthInlineLoadingProps) {
  return (
    <Box sx={authLoadingSlotStyles}>
      <CircularProgress
        size={36}
        thickness={4}
        disableShrink
        aria-label={message}
        sx={{ color: "primary.main" }}
      />
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  );
}
