"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Schedule from "@mui/icons-material/Schedule";
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
import { WebsiteAssignmentFlowStepper } from "@/features/website-assignments/components/WebsiteAssignmentFlowStepper";
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

export default function AddServiceSchedulePage() {
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
  const schedulingPath = useMemo(() => {
    const wid = preset.websiteId?.trim() ?? "";
    if (!wid) return "";
    return `/dashboard/website-assigning/website/${encodeURIComponent(wid)}/service-scheduling`;
  }, [preset.websiteId]);

  if (gates.ready && !gates.assign) {
    return (
      <PermissionDeniedPanel
        title="Add service schedule"
        description="You need website:assign permission to configure service scheduling."
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
            Add service schedule
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560 }}>
            Choose the organization and website, then set operating mode, hours, and visitor topics.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning/service-schedules"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          >
            All schedules
          </Button>
        </Box>
      </Box>

      <WebsiteAssignmentFlowStepper
        activeStep={1}
        websiteId={preset.websiteId?.trim() || undefined}
        pickHref="/dashboard/website-assigning/service-schedules/add"
      />

      <Box sx={websiteAssignmentHeroSx}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <Schedule sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Step 1 — Select website
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              Pick parent company, child company, and the website that will use this schedule.
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
            href="/dashboard/website-assigning/service-schedules"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue}
            startIcon={<Schedule sx={{ fontSize: 18 }} />}
            onClick={() => {
              if (!schedulingPath) return;
              router.push(schedulingPath);
            }}
          >
            Continue to scheduling
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
