"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Language from "@mui/icons-material/Language";
import Topic from "@mui/icons-material/Topic";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  PermissionDeniedPanel,
  Typography,
} from "@/components/common";
import NextLink from "next/link";
import { InquireTopicsTab } from "@/features/chat-settings/components/InquireTopicsTab";
import { useDepartmentCatalogQuery } from "@/features/chat-settings/hooks/useChatSettings";
import { useVisitorTopicsQuery } from "@/features/chat-settings/hooks/useServiceScheduling";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import { useServiceSchedulingGates } from "../hooks/useServiceSchedulingGates";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentHeroSx,
  websiteAssignmentModernCardSx,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSectionIconSx,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

export function WebsiteInquireTopicsWorkspace({ websiteId }: { websiteId: string }) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const gates = useServiceSchedulingGates();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const detailQuery = useWebsiteAssignmentDetailQuery(websiteId, {
    enabled: gates.pageView && websiteId.trim().length > 0,
  });
  const detail = useMemo(
    () => parseWebsiteAssignmentDetail(detailQuery.data),
    [detailQuery.data],
  );

  const visitorTopicsQuery = useVisitorTopicsQuery(websiteId, gates.canViewApi);
  const parentCompanyId = detail?.parentCompanyId ?? "";

  const departmentsQuery = useDepartmentCatalogQuery(
    parentCompanyId,
    gates.canViewApi && Boolean(parentCompanyId.trim()),
  );

  if (gates.ready && !gates.pageView) {
    return (
      <PermissionDeniedPanel
        title="Inquire topics"
        description="You need page:website-assignments and website:assign (or website-assignment:view)."
      />
    );
  }

  if (gates.ready && gates.pageView && !gates.canViewApi) {
    return (
      <PermissionDeniedPanel
        title="Inquire topics"
        description="You need chat-widget:view or chat-widget:update to load and save inquire topics."
      />
    );
  }

  const title = detail?.name || websiteId.slice(0, 8) || "Website";
  const url = detail?.url ?? "";
  const topicsConfigured = Boolean(detail?.visitorTopicsConfigured);

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning/inquire-topics"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            sx={{ mb: 1 }}
          >
            All inquire topics
          </Button>
          <Typography
            variant="regularLarge"
            fontWeight={700}
            sx={{ color: theme.app.text.primary, mb: 0.5, letterSpacing: "-0.02em" }}
          >
            Inquire topics
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560, lineHeight: "20px" }}>
            Configure which visitor topics route to departments for this website.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href={`/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}/service-scheduling`}
          >
            Service scheduling
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
              {title}
            </Typography>
            {url ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <Language sx={{ fontSize: 16, color: theme.app.dashboard.textMuted }} />
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all" }}>
                  {url}
                </Typography>
              </Box>
            ) : null}
            <Chip
              size="small"
              label={topicsConfigured ? "Topics configured" : "Please add topics"}
              sx={{
                height: 26,
                fontWeight: 600,
                bgcolor: topicsConfigured
                  ? `${theme.palette.success.main}18`
                  : `${theme.palette.warning.main}18`,
                color: topicsConfigured ? theme.palette.success.main : theme.palette.warning.light,
                border: `1px solid ${topicsConfigured ? theme.palette.success.main : theme.palette.warning.main}33`,
              }}
            />
          </Box>
        </Box>
      </Box>

      {saveSuccess ? (
        <DashboardCard sx={websiteAssignmentModernCardSx}>
          <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 1 }}>
            Inquire topics saved
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
            {title} topics are saved. Continue to agent roster when service hours are also configured.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setSaveSuccess(false)}
            >
              Edit again
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push("/dashboard/website-assigning/inquire-topics")}
            >
              All inquire topics
            </Button>
            <Button
              type="button"
              variant="outlined"
              component={NextLink}
              href={`/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}`}
            >
              Agent roster
            </Button>
          </Box>
        </DashboardCard>
      ) : (
        <DashboardCard sx={websiteAssignmentModernCardSx}>
          <InquireTopicsTab
            websiteId={websiteId}
            departments={departmentsQuery.data ?? []}
            departmentsLoading={departmentsQuery.isLoading || visitorTopicsQuery.isLoading}
            canView={gates.canViewApi}
            canEdit={gates.canEditApi}
            onSaved={() => setSaveSuccess(true)}
          />
        </DashboardCard>
      )}
    </Box>
  );
}
