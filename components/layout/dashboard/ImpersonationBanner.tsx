"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { getImpersonationSession } from "@/lib/auth/impersonation-session";

export function ImpersonationBanner() {
  const { isImpersonating, user, revertImpersonation } = useAuth();

  if (!isImpersonating) {
    return null;
  }

  const session = getImpersonationSession();
  const displayName =
    user?.displayName?.trim() ||
    session?.impersonatedUser?.displayName?.trim() ||
    user?.email?.trim() ||
    session?.impersonatedUser?.email?.trim() ||
    "this user";
  const actorLabel =
    session?.actorUser?.displayName?.trim() ||
    session?.actorUser?.email?.trim() ||
    null;

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        px: { xs: 1.5, sm: 2 },
        py: 1,
        mb: { xs: 0.5, md: 1 },
        borderRadius: 2,
        border: "1px solid rgba(255, 193, 7, 0.45)",
        bgcolor: "rgba(255, 193, 7, 0.12)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <WarningAmberRounded sx={{ fontSize: 20, color: "#ffc107", flexShrink: 0 }} />
        <Typography variant="body2" color="white" sx={{ minWidth: 0 }}>
          Login as <strong>{displayName}</strong>
          {actorLabel ? (
            <>
              {" "}
              (your admin: {actorLabel})
            </>
          ) : null}
          . Actions apply to this account.
        </Typography>
      </Box>
      <Button
        type="button"
        size="small"
        variant="outlined"
        onClick={() => {
          void revertImpersonation();
        }}
        sx={{
          flexShrink: 0,
          color: "white",
          borderColor: "rgba(255,255,255,0.35)",
          "&:hover": { borderColor: "rgba(255,255,255,0.6)", bgcolor: "rgba(255,255,255,0.06)" },
        }}
      >
        Exit login as
      </Button>
    </Box>
  );
}
