"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Language from "@mui/icons-material/Language";
import Schedule from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  ConfirmActionModal,
  DashboardCard,
  PermissionDeniedPanel,
  Typography,
} from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import NextLink from "next/link";
import { SchedulingSaveSuccessPanel } from "@/features/website-assignments/components/SchedulingSaveSuccessPanel";
import { WebsiteAssignmentFlowStepper } from "@/features/website-assignments/components/WebsiteAssignmentFlowStepper";
import { ServiceScheduleTab } from "@/features/chat-settings/components/ServiceScheduleTab";
import {
  useDeleteServiceSchedulingMutation,
  useServiceSchedulingQuery,
} from "@/features/chat-settings/hooks/useServiceScheduling";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { useServiceSchedulingGates } from "../hooks/useServiceSchedulingGates";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentHeroSx,
  websiteAssignmentModernCardSx,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSectionIconSx,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

export function WebsiteServiceSchedulingWorkspace({ websiteId }: { websiteId: string }) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const gates = useServiceSchedulingGates();
  const assignGates = useWebsiteAssignmentGates();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const deleteMutation = useDeleteServiceSchedulingMutation(websiteId);

  const detailQuery = useWebsiteAssignmentDetailQuery(websiteId, {
    enabled: gates.pageView && websiteId.trim().length > 0,
  });
  const detail = useMemo(
    () => parseWebsiteAssignmentDetail(detailQuery.data),
    [detailQuery.data],
  );

  const schedulingQuery = useServiceSchedulingQuery(websiteId, gates.canViewApi);

  if (gates.ready && !gates.pageView) {
    return (
      <PermissionDeniedPanel
        title="Service scheduling"
        description="You need page:website-assignments and website:assign (or website-assignment:view)."
      />
    );
  }

  if (gates.ready && gates.pageView && !gates.canViewApi) {
    return (
      <PermissionDeniedPanel
        title="Service scheduling"
        description="You need chat-widget:view or chat-widget:update to load and save service scheduling for this website."
      />
    );
  }

  const title = detail?.name || schedulingQuery.data?.websiteId?.slice(0, 8) || "Website";
  const url = detail?.url ?? "";
  const hoursConfigured = detail?.serviceHoursConfigured === true;
  const readyForRoster =
    detail?.serviceHoursConfigured === true || detail?.serviceSchedulingConfigured === true;

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning/service-schedules"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            sx={{ mb: 1 }}
          >
            All schedules
          </Button>
          <Typography
            variant="regularLarge"
            fontWeight={700}
            sx={{ color: theme.app.text.primary, mb: 0.5, letterSpacing: "-0.02em" }}
          >
            Service scheduling
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560, lineHeight: "20px" }}>
            Configure operating mode and service hours for this website. Inquire topics are configured
            separately.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href={`/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}/inquire-topics`}
          >
            Inquire topics
          </Button>
          {assignGates.assign && gates.canEditApi ? (
            <Button
              type="button"
              variant="outlined"
              sx={{ color: theme.palette.error.light, borderColor: theme.palette.error.main }}
              onClick={() => setDeleteOpen(true)}
            >
              Delete schedule
            </Button>
          ) : null}
        </Box>
      </Box>

      <WebsiteAssignmentFlowStepper
        activeStep={2}
        websiteId={websiteId}
        pickHref="/dashboard/website-assigning/service-schedules/add"
        schedulingComplete={readyForRoster}
        rosterComplete={Boolean(detail?.isFullyAssigned)}
      />

      <Box sx={websiteAssignmentHeroSx}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <Schedule sx={{ fontSize: 22 }} />
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
              label={hoursConfigured ? "Hours configured" : "Please add schedule"}
              sx={{
                height: 26,
                fontWeight: 600,
                bgcolor: hoursConfigured
                  ? `${theme.palette.success.main}18`
                  : `${theme.palette.warning.main}18`,
                color: hoursConfigured ? theme.palette.success.main : theme.palette.warning.light,
                border: `1px solid ${hoursConfigured ? theme.palette.success.main : theme.palette.warning.main}33`,
              }}
            />
          </Box>
        </Box>
      </Box>

      {saveSuccess ? (
        <DashboardCard sx={websiteAssignmentModernCardSx}>
          <SchedulingSaveSuccessPanel
            websiteName={title}
            websiteUrl={url}
            onViewAllSchedules={() =>
              router.push("/dashboard/website-assigning/service-schedules")
            }
            onEditAgain={() => setSaveSuccess(false)}
          />
        </DashboardCard>
      ) : (
        <DashboardCard sx={websiteAssignmentModernCardSx}>
          <ServiceScheduleTab
            websiteId={websiteId}
            canView={gates.canViewApi}
            canEdit={gates.canEditApi}
            onSaved={() => setSaveSuccess(true)}
          />
        </DashboardCard>
      )}

      <ConfirmActionModal
        open={deleteOpen}
        title="Delete service schedule?"
        description="Remove service hours for this website and clear visitor topics. Agent assignments are kept."
        confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete schedule"}
        cancelLabel="Cancel"
        confirmButtonVariant="danger"
        onDismiss={() => !deleteMutation.isPending && setDeleteOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(undefined, {
            onSuccess: () => {
              publishAppToast({ message: "Service schedule removed.", variant: "success" });
              setDeleteOpen(false);
              setSaveSuccess(false);
              router.push("/dashboard/website-assigning/service-schedules");
            },
            onError: (e) =>
              publishAppToast({
                message: extractApiErrorMessageForToast(e, "Could not delete schedule"),
                variant: "error",
              }),
          });
        }}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
}
