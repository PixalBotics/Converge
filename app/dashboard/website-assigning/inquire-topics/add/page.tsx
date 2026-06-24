"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Topic from "@mui/icons-material/Topic";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import NextLink from "next/link";
import { Button, DashboardCard, PermissionDeniedPanel, Typography } from "@/components/common";
import {
  isPickWebsiteComplete,
  PickWebsiteFields,
} from "@/features/website-assignments/components/PickWebsiteFields";
import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentHeroSx,
  websiteAssignmentModernCardSx,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSectionIconSx,
} from "../../website-assigning.styles";

export default function AddInquireTopicsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const gates = useWebsiteAssignmentGates();
  const [preset, setPreset] = useState<PickWebsitePreset>({
    resellerId: "",
    parentCompanyId: "",
    childCompanyId: "",
    websiteId: "",
  });

  const canContinue = isPickWebsiteComplete(preset);
  const topicsPath = useMemo(() => {
    const wid = preset.websiteId?.trim() ?? "";
    if (!wid) return "";
    return `/dashboard/website-assigning/website/${encodeURIComponent(wid)}/inquire-topics`;
  }, [preset.websiteId]);

  if (gates.ready && !gates.assign) {
    return (
      <PermissionDeniedPanel
        title="Add inquire topics"
        description="You need website:assign permission to configure inquire topics."
      />
    );
  }

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography
            variant="regularLarge"
            fontWeight={700}
            sx={{ color: theme.app.text.primary, mb: 0.5, letterSpacing: "-0.02em" }}
          >
            Add inquire topics
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560 }}>
            Choose the organization and website, then configure visitor inquire topics.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning/inquire-topics"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          >
            All inquire topics
          </Button>
        </Box>
      </Box>

      <Box sx={websiteAssignmentHeroSx}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <Topic sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Step 1 — Select website
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              Pick reseller, parent company, child company, and the website for inquire topics.
            </Typography>
          </Box>
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentModernCardSx}>
        <PickWebsiteFields value={preset} onChange={setPreset} showProgressChips={false} />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            mt: 3,
            pt: 2.5,
            borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning/inquire-topics"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue}
            startIcon={<Topic sx={{ fontSize: 18 }} />}
            onClick={() => {
              if (!topicsPath) return;
              router.push(topicsPath);
            }}
          >
            Continue to topics
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
