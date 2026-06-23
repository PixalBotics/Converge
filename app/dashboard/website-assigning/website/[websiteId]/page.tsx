"use client";

import { useMemo } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Groups from "@mui/icons-material/Groups";
import Language from "@mui/icons-material/Language";
import Schedule from "@mui/icons-material/Schedule";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  PermissionDeniedPanel,
  Typography,
} from "@/components/common";
import { WebsiteAssignmentFlowStepper } from "@/features/website-assignments/components/WebsiteAssignmentFlowStepper";
import { WebsiteDepartmentRoster } from "@/features/website-assignments/components/WebsiteDepartmentRoster";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentHeroSx,
  websiteAssignmentModernCardSx,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSectionIconSx,
} from "../../website-assigning.styles";
import { mergeSx } from "@/lib/mui/merge-sx";

const MODE_LABELS: Record<string, string> = {
  internal_only: "Internal only",
  external_only: "External only",
  both: "Internal + External",
};

export default function WebsiteAssignmentDetailPage() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ websiteId: string }>();
  const websiteId = typeof params?.websiteId === "string" ? params.websiteId : "";
  const gates = useWebsiteAssignmentGates();

  const detailQuery = useWebsiteAssignmentDetailQuery(websiteId, {
    enabled: gates.view && websiteId.trim().length > 0,
  });

  const detail = useMemo(
    () => parseWebsiteAssignmentDetail(detailQuery.data),
    [detailQuery.data],
  );

  if (gates.ready && !gates.view) {
    return (
      <PermissionDeniedPanel
        title="Website assignment"
        description="You need page:website-assignments and website:assign (or website-assignment:view) from GET /auth/me."
      />
    );
  }

  const title = detail?.name || "Website";
  const url = detail?.url ?? "";
  const modeLabel = detail ? MODE_LABELS[detail.operatingChannels] ?? detail.operatingChannels : "—";
  const schedulingConfigured =
    detail?.serviceSchedulingConfigured === true || detail?.serviceHoursConfigured === true;
  const schedulingHref = detail?.websiteId
    ? `/dashboard/website-assigning/website/${encodeURIComponent(detail.websiteId)}/service-scheduling`
    : "";

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            sx={{ mb: 1 }}
          >
            All websites
          </Button>
          <Typography
            variant="regularLarge"
            fontWeight={700}
            sx={{ color: theme.app.text.primary, mb: 0.5, letterSpacing: "-0.02em" }}
          >
            Agent roster
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560 }}>
            Assign Primary, Secondary, and Backup agents by channel and visitor topic.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          {schedulingHref ? (
            <Button
              type="button"
              variant="outlined"
              component={NextLink}
              href={schedulingHref}
              startIcon={<Schedule sx={{ fontSize: 18 }} />}
            >
              Service scheduling
            </Button>
          ) : null}
        </Box>
      </Box>

      {detail?.websiteId ? (
        <WebsiteAssignmentFlowStepper
          activeStep={detail.isFullyAssigned ? 4 : 3}
          websiteId={detail.websiteId}
          pickHref="/dashboard/website-assigning/assign"
          schedulingComplete={schedulingConfigured}
          rosterComplete={Boolean(detail.isFullyAssigned)}
        />
      ) : null}

      <Box sx={websiteAssignmentHeroSx}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <Groups sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              {title}
            </Typography>
            {url ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <Language sx={{ fontSize: 16, color: theme.app.dashboard.textMuted }} />
                <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all" }}>
                  {url}
                </Link>
              </Box>
            ) : null}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                size="small"
                label={modeLabel}
                sx={{
                  height: 26,
                  fontWeight: 600,
                  bgcolor: `${theme.palette.primary.main}18`,
                  color: theme.palette.primary.light,
                }}
              />
              <Chip
                size="small"
                label={detail?.allowedAssignmentChannels?.join(" · ") || "—"}
                sx={{ height: 26, fontWeight: 600 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {!schedulingConfigured && detail?.websiteId ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            mb: 3,
            p: 2.25,
            borderRadius: 3,
            border: `1px solid ${theme.palette.warning.main}44`,
            bgcolor: `${theme.palette.warning.main}10`,
            boxShadow: `0 8px 28px ${theme.palette.warning.main}12`,
          }}
        >
          <WarningAmber sx={{ color: theme.palette.warning.light, fontSize: 24 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
              Service scheduling required
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, lineHeight: 1.55 }}>
              Set operating mode and service hours before assigning agents to this website.
            </Typography>
            <Button
              type="button"
              variant="primary"
              size="small"
              component={NextLink}
              href={schedulingHref}
              startIcon={<Schedule sx={{ fontSize: 18 }} />}
              sx={gradientPrimaryButtonSx}
            >
              Open service scheduling
            </Button>
          </Box>
        </Box>
      ) : null}

      {detailQuery.isError ? (
        <DashboardCard sx={websiteAssignmentModernCardSx}>
          <Typography variant="medium" sx={{ color: theme.palette.error.main }}>
            Could not load this website. Refresh the page or try again in a moment.
          </Typography>
        </DashboardCard>
      ) : null}

      <DashboardCard sx={mergeSx(websiteAssignmentModernCardSx, { p: { xs: 2, sm: 2.5 } })}>
        <Typography variant="mediumLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
          Team assignments
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2.5, lineHeight: 1.55 }}>
          Choose channel and assign agents. Department and inquire topics are optional.
        </Typography>
        {detailQuery.isLoading ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading roster…</Typography>
        ) : detail ? (
          <WebsiteDepartmentRoster
            websiteId={detail.websiteId}
            operatingChannels={detail.operatingChannels}
            allowedAssignmentChannels={detail.allowedAssignmentChannels}
            departmentRoster={detail.departmentRoster}
            canAssign={gates.assign}
          />
        ) : (
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>No roster data.</Typography>
        )}
      </DashboardCard>
    </Box>
  );
}
