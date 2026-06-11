import type { SxProps, Theme } from "@mui/material/styles";

/** Isolated light-theme chat shell — immune to dashboard dark text colors. */
export const aiTrainingTestChatRootSx = (opts?: {
  floating?: boolean;
}): SxProps<Theme> => ({
  width: "100%",
  height: opts?.floating ? "100%" : "auto",
  minHeight: opts?.floating ? 0 : 440,
  borderRadius: 3,
  overflow: "hidden",
  isolation: "isolate",
  boxShadow:
    "0 24px 48px rgba(15,23,42,0.22), 0 0 0 1px rgba(148,163,184,0.2)",
  border: "1px solid rgba(148,163,184,0.28)",
  bgcolor: "#ffffff",
  color: "#0f172a",
  display: "flex",
  flexDirection: "column",
  fontFamily: '"Manrope", system-ui, sans-serif',
  "& *": {
    boxSizing: "border-box",
  },
});

export const aiTrainingTestChatHeaderSx: SxProps<Theme> = {
  px: 1.5,
  py: 1.15,
  flexShrink: 0,
  background: "linear-gradient(135deg, #1e40af 0%, #2563eb 52%, #3b82f6 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const aiTrainingTestChatMessagesSx: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  p: 1.25,
  bgcolor: "#f1f5f9",
};

export const aiTrainingTestChatInputRowSx: SxProps<Theme> = {
  flexShrink: 0,
  p: 1,
  borderTop: "1px solid #e2e8f0",
  bgcolor: "#ffffff",
  display: "flex",
  alignItems: "flex-end",
  gap: 0.65,
};

export const aiTrainingTestChatFloatingDockSx: SxProps<Theme> = {
  position: "absolute",
  bottom: { xs: 12, sm: 20 },
  right: { xs: 12, sm: 20 },
  left: "auto",
  zIndex: 24,
  width: { xs: "min(360px, calc(100% - 24px))", sm: 360 },
  height: { xs: "min(480px, calc(100% - 80px))", sm: 480 },
  maxHeight: "calc(100% - 48px)",
  display: "flex",
  flexDirection: "column",
  pointerEvents: "auto",
};

export const aiTrainingTestChatLauncherSx: SxProps<Theme> = {
  position: "absolute",
  bottom: { xs: 12, sm: 20 },
  right: { xs: 12, sm: 20 },
  zIndex: 20,
  maxWidth: "min(320px, calc(100% - 24px))",
};
