"use client";

import { useMemo } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Language from "@mui/icons-material/Language";
import Schedule from "@mui/icons-material/Schedule";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
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
import { WebsiteAssignmentJourneyStepper } from "@/features/website-assignments/components/WebsiteAssignmentJourneyStepper";
import { WebsiteDepartmentRoster } from "@/features/website-assignments/components/WebsiteDepartmentRoster";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSectionIconSx,
  websiteAssignmentUserDetailCard,
} from "../../website-assigning.styles";

const siteOverviewGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: { xs: 2, sm: 2.5 },
  alignItems: "start",
};

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
        message="You need page:website-assignments and website:assign (or website-assignment:view) from GET /auth/me."
      />
    );
  }

  const title = detail?.name || "Website";
  const url = detail?.url ?? "";
  const modeLabel = detail ? MODE_LABELS[detail.operatingChannels] ?? detail.operatingChannels : "—";
  const schedulingConfigured = detail?.serviceSchedulingConfigured === true;
  const schedulingHref = detail?.websiteId
    ? `/dashboard/website-assigning/website/${encodeURIComponent(detail.websiteId)}/service-scheduling`
    : "";

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Agent roster
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            Step 2 of 2 — {title}
            {url ? ` · ${url}` : ""}. Assign Primary, Secondary, and Backup per channel and visitor
            topic.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          >
            All websites
          </Button>
          {schedulingHref ? (
            <Button
              type="button"
              variant="outlined"
              component={NextLink}
              href={schedulingHref}
              startIcon={<Schedule sx={{ fontSize: 18 }} />}
            >
              Edit schedule
            </Button>
          ) : null}
        </Box>
      </Box>

      {detail?.websiteId ? (
        <WebsiteAssignmentJourneyStepper
          activeStep={2}
          websiteId={detail.websiteId}
          schedulingComplete={schedulingConfigured}
          websiteLabel={title}
        />
      ) : null}

      {!schedulingConfigured && detail?.websiteId ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            mb: 3,
            p: 2,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.warning.main}44`,
            bgcolor: `${theme.palette.warning.main}12`,
          }}
        >
          <WarningAmber sx={{ color: theme.palette.warning.light, fontSize: 24 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
              Complete Step 1 first
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5 }}>
              Service scheduling (hours and visitor topics) is required before you can assign agents.
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
              Set up service scheduling
            </Button>
          </Box>
        </Box>
      ) : null}

      {detailQuery.isError ? (
        <DashboardCard sx={{ p: 3 }}>
          <Typography variant="medium" sx={{ color: theme.palette.error.main }}>
            Could not load this website. Refresh the page or try again in a moment.
          </Typography>
        </DashboardCard>
      ) : null}

      <DashboardCard sx={websiteAssignmentUserDetailCard}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <Language sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Website overview
          </Typography>
        </Box>
        <Box sx={siteOverviewGridSx}>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              URL
            </Typography>
            {url ? (
              <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all" }}>
                {url}
              </Link>
            ) : (
              <Typography variant="medium">—</Typography>
            )}
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Operating mode
            </Typography>
            <Typography variant="medium">{modeLabel}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Allowed channels
            </Typography>
            <Typography variant="medium">
              {detail?.allowedAssignmentChannels?.join(", ") || "—"}
            </Typography>
          </Box>
        </Box>
      </DashboardCard>

      <DashboardCard sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
          Assign agents
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2, lineHeight: 1.55 }}>
          Select <strong>Internal</strong> or <strong>External</strong>, choose a visitor topic, then
          pick users for Primary, Secondary, and Backup slots.
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
