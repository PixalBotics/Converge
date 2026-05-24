"use client";

import Box from "@mui/material/Box";
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

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1300,
        maxWidth: 480,
        width: "calc(100% - 32px)",
        p: 2,
        borderRadius: 2,
        bgcolor: (t) => t.app.dashboard.cardBg,
        border: (t) => `1px solid ${t.app.dashboard.cardBorder}`,
        boxShadow: 6,
      }}
    >
      <Typography variant="mediumLarge" fontWeight={600} color="white" sx={{ mb: 0.5 }}>
        Distribute this chat
      </Typography>
      <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted, mb: 1.5 }}>
        Complete the distribution form to send the transcript to the selected department.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
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
  );
}
