import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const pageRoot: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2.2,
};

export const headerRow: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
};

export const headerActions: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
};

export const metricsGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 2,
};

export const cardPadding: SxProps<Theme> = { p: 2 };

export const cardHeaderRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
  mb: 1.5,
};

export const cardActionsWrap: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", md: "auto" },
};

export const searchWrap: SxProps<Theme> = {
  flex: 1,
  minWidth: { xs: 0, md: 240 },
};

export const paginationRow: SxProps<Theme> = {
  mt: 1.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  flexWrap: "wrap",
};

export const customerCell: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.2,
};

export const customerAvatar = (theme: AppTheme): SxProps<Theme> => ({
  width: 30,
  height: 30,
  bgcolor: theme.app.dashboard.buttonIndigo,
});

export const onlineStatusPill = (theme: AppTheme): SxProps<Theme> => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  px: 1.2,
  py: 0.45,
  borderRadius: "9999px",
  bgcolor:
    theme.palette.mode === "light"
      ? "rgba(34,197,94,0.16)"
      : "rgba(34,197,94,0.12)",
  color: theme.palette.mode === "light" ? "#166534" : "#86EFAC",
  border:
    theme.palette.mode === "light"
      ? "1px solid rgba(34,197,94,0.3)"
      : "1px solid rgba(34,197,94,0.35)",
  fontSize: "0.75rem",
  fontWeight: 600,
});

export const statusDot: SxProps<Theme> = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  bgcolor: "#22C55E",
};

export const ratingStarsWrap: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.15,
};
