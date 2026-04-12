"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { distributionSetupPageWrapper } from "../distribution-setup.styles";

/** Target route for “Chat Transcript Email” links from the distribution table. */
export default function DistributionChatTranscriptPage() {
  const router = useRouter();

  return (
    <Stack spacing={2.5} sx={distributionSetupPageWrapper}>
      <Box>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.75 }}>
          Chat Transcript Email
        </Typography>
        <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted, maxWidth: 720 }}>
          Review your distribution template and verify delivery endpoints before enabling automated transcript dispatch.
        </Typography>
      </Box>

      <DashboardCard sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Delivery Summary
          </Typography>
          <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            Department: Sales
          </Typography>
          <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            Primary recipients: sales@company.com
          </Typography>
          <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            CC: manager@company.com
          </Typography>
          <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            BCC: admin@company.com
          </Typography>
          <Divider sx={{ borderColor: (t) => t.app.dashboard.cardBorder }} />
          <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            Source mailbox: support@abc.com
          </Typography>
          <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            Status: Ready for integration mapping
          </Typography>
        </Stack>
      </DashboardCard>

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => router.back()}>
          Back to Distribution Table
        </Button>
      </Box>
    </Stack>
  );
}
