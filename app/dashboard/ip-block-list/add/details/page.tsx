"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { distributionSetupSectionIconBox } from "../../../distribution-setup/distribution-setup.styles";
import {
  distributionWizardCardFooter,
  distributionWizardCardSx,
  distributionWizardFormGrid3,
  distributionWizardPageHeader,
  distributionWizardPageWrapper,
} from "../../../distribution-setup/wizard.styles";

const DEFAULT_SUBTITLE =
  "Configure your organization's outgoing email server settings.";

const DETAIL_FIELDS: { label: string; value: string }[] = [
  { label: "Client Of", value: "TechNova Solution" },
  { label: "Parent Company", value: "Global Tech Holdings Inc." },
  { label: "Child Company", value: "None registered" },
  { label: "Website", value: "www.technovasolutions.co" },
  { label: "IP Address", value: "1243.133.432" },
  { label: "Blocked Date", value: "Oct 24, 2023 at 14:32 PST" },
  { label: "Blocked By", value: "System Auto-Rule #4" },
  { label: "Reason", value: "Multiple failed authentication attempts" },
  { label: "Status", value: "Block" },
];

export default function AddIpBlockDetailsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          Add IP Block
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          {DEFAULT_SUBTITLE}
        </Typography>
      </Box>

      <DashboardCard sx={distributionWizardCardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={distributionSetupSectionIconBox} aria-hidden>
            <Typography
              sx={{
                color: theme.app.dashboard.white95,
                fontWeight: 700,
                fontSize: "1.1rem",
                lineHeight: 1,
              }}
            >
              $
            </Typography>
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            IP Block Details
          </Typography>
        </Box>

        <Box sx={distributionWizardFormGrid3}>
          {DETAIL_FIELDS.map((f) => (
            <InputField
              key={f.label}
              label={f.label}
              name={f.label.toLowerCase().replace(/\s+/g, "-")}
              value={f.value}
              readOnly
              inputProps={{ maxLength: 512 }}
            />
          ))}
        </Box>

        <Box sx={distributionWizardCardFooter}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push("/dashboard/ip-block-list")}
          >
            Done
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
