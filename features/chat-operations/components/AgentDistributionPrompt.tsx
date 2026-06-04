"use client";

import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import { useRouter } from "next/navigation";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { AgentWrapUpPayload } from "@/services/chat/wrap-up.types";

export function AgentDistributionPrompt({
  payload,
  onDismiss,
}: {
  payload: AgentWrapUpPayload;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const path =
    payload.distributionFormPath ??
    `/dashboard/chat-operations/distribution?conversationId=${encodeURIComponent(payload.conversationId)}`;

  const visitorName =
    payload.visitorPresentation?.displayName ||
    payload.visitorPresentation?.inboxTitle ||
    "Visitor";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1300,
        maxWidth: 520,
        width: "calc(100% - 32px)",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: (t) => t.app.dashboard.cardBg,
        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
        boxShadow: (t) =>
          `0 20px 48px ${alpha("#000", 0.35)}, 0 0 0 1px ${alpha(t.palette.primary.main, 0.12)}`,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.18)} 0%, ${alpha(t.app.dashboard.pillBg, 0.95)} 100%)`,
          borderBottom: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
            color: (t) => t.palette.primary.light,
          }}
        >
          <DescriptionOutlined sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ lineHeight: 1.25 }}>
            Distribute this chat
          </Typography>
          <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            {visitorName}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.75 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.75 }}>
          <AutoAwesomeOutlined sx={{ fontSize: 18, color: (t) => t.palette.primary.light, mt: 0.15 }} />
          <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted, lineHeight: 1.45 }}>
            Chat closed — fields are prefilled from the conversation. Open the form to choose a
            department and send the transcript email.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            endIcon={<OpenInNewOutlined sx={{ fontSize: 18 }} />}
            onClick={() => {
              router.push(path);
              onDismiss();
            }}
          >
            Open distribution form
          </Button>
          <Button type="button" variant="secondary" onClick={onDismiss}>
            Later
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
