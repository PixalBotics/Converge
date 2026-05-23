"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Edit from "@mui/icons-material/Edit";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Schedule from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  FormModal,
  PermissionDeniedPanel,
  Typography,
} from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import NextLink from "next/link";
import { WebsiteAssignmentJourneyStepper } from "@/features/website-assignments/components/WebsiteAssignmentJourneyStepper";
import { SchedulingSaveSuccessPanel } from "@/features/website-assignments/components/SchedulingSaveSuccessPanel";
import { ServiceScheduleTab } from "@/features/chat-settings/components/ServiceScheduleTab";
import { useDepartmentCatalogQuery } from "@/features/chat-settings/hooks/useChatSettings";
import {
  useDeleteServiceSchedulingMutation,
  useServiceSchedulingQuery,
} from "@/features/chat-settings/hooks/useServiceScheduling";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { useServiceSchedulingGates } from "../hooks/useServiceSchedulingGates";
import { WebsiteAssignmentWorkflowStepBar } from "@/features/website-assignments/components/WebsiteAssignmentWorkflowStepBar";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSectionIconSx,
  websiteAssignmentUserDetailCard,
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
  const parentCompanyId =
    schedulingQuery.data?.parentCompanyId ?? detail?.parentCompanyId ?? "";
  const parentCompanyName =
    detail?.parentCompanyName?.trim() || parentCompanyId || "this parent company";

  const departmentsQuery = useDepartmentCatalogQuery(
    parentCompanyId,
    gates.canViewApi && Boolean(parentCompanyId.trim()),
  );

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
  const rosterHref = `/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}`;
  const schedulingConfigured =
    detail?.serviceSchedulingConfigured === true || saveSuccess;

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography
            variant="regularLarge"
            fontWeight={700}
            sx={{ color: theme.app.text.primary, mb: 0.5 }}
          >
            Service scheduling
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            Step 1 of 2 — configure this website, then assign agents on the roster.
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
          {schedulingConfigured ? (
            <Button
              type="button"
              variant="primary"
              component={NextLink}
              href={rosterHref}
            >
              Agent roster →
            </Button>
          ) : null}
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

      <WebsiteAssignmentJourneyStepper
        activeStep={1}
        websiteId={websiteId}
        schedulingComplete={schedulingConfigured}
        websiteLabel={title}
      />

      {saveSuccess ? (
        <DashboardCard sx={websiteAssignmentUserDetailCard}>
          <SchedulingSaveSuccessPanel
            websiteName={title}
            websiteUrl={url}
            rosterHref={rosterHref}
            onViewAllSchedules={() =>
              router.push("/dashboard/website-assigning/service-schedules")
            }
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              type="button"
              variant="secondary"
              size="small"
              startIcon={<Edit sx={{ fontSize: 16 }} />}
              onClick={() => setSaveSuccess(false)}
            >
              Edit schedule again
            </Button>
          </Box>
        </DashboardCard>
      ) : (
        <DashboardCard sx={websiteAssignmentUserDetailCard}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
              <Schedule sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Hours & visitor topics
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {title}
                {url ? ` · ${url}` : ""}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.25,
              alignItems: "flex-start",
              mb: 2.5,
              p: 1.75,
              borderRadius: 2,
              border: `1px solid ${theme.palette.primary.main}33`,
              bgcolor: `${theme.palette.primary.main}0c`,
            }}
          >
            <InfoOutlined sx={{ fontSize: 20, color: theme.palette.primary.light, mt: 0.15 }} />
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              This page is <strong style={{ color: theme.app.text.primary }}>Step 1</strong> only.
              After saving, go to <strong style={{ color: theme.app.text.primary }}>Step 2 — Agent roster</strong>{" "}
              to pick users for each visitor topic (Internal / External channels).
            </Typography>
          </Box>

          <WebsiteAssignmentWorkflowStepBar variant="scheduling-editor" activeStep={3} />

          <ServiceScheduleTab
            websiteId={websiteId}
            departments={departmentsQuery.data ?? []}
            departmentsLoading={departmentsQuery.isLoading}
            canView={gates.canViewApi}
            canEdit={gates.canEditApi}
            rosterHref={rosterHref}
            onSaved={() => setSaveSuccess(true)}
            onSaveAndGoToRoster={() => router.push(rosterHref)}
          />
        </DashboardCard>
      )}

      <FormModal
        open={deleteOpen}
        title="Delete service schedule?"
        description={`Remove service hours for this website and clear visitor topics. Agent assignments are kept.`}
        onClose={() => !deleteMutation.isPending && setDeleteOpen(false)}
        onSave={() => {
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
        primaryButtonLabel={deleteMutation.isPending ? "Deleting…" : "Delete schedule"}
        primaryButtonVariant="danger"
        primaryButtonDisabled={deleteMutation.isPending}
        cancelButtonLabel="Cancel"
        maxWidth={520}
      />
    </Box>
  );
}

