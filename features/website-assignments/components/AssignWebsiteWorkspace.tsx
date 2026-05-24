"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Assignment from "@mui/icons-material/Assignment";
import Language from "@mui/icons-material/Language";
import OpenInNew from "@mui/icons-material/OpenInNew";
import Schedule from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import NextLink from "next/link";
import {
  Button,
  DashboardCard,
  PermissionDeniedPanel,
  SelectField,
  Typography,
} from "@/components/common";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useResellerListScope } from "@/lib/auth";
import {
  buildWebsitesInScopeParams,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useWebsiteAssignmentDetailQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import { useServiceSchedulingQuery } from "@/features/chat-settings/hooks/useServiceScheduling";
import { isServiceSchedulingReady } from "@/features/website-assignments/utils/scheduling-ready.utils";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import { TopicAgentRosterPanel } from "@/features/website-assignments/components/TopicAgentRosterPanel";
import { WebsiteAssignmentFlowStepper } from "@/features/website-assignments/components/WebsiteAssignmentFlowStepper";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { emptyStatePanelSx } from "@/features/website-assignments/styles/website-assignment-ui.styles";
import { assignWebsiteFormGridSx } from "@/components/common/AssignWebsiteModal/assign-website-modal.styles";
import { formatWebsiteSelectLabel } from "@/lib/websites/format-website-select-label";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentHeroSx,
  websiteAssignmentModernCardSx,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSectionIconSx,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

export type AssignWebsitePreset = {
  websiteId: string;
  parentCompanyId: string;
  childCompanyId?: string;
  resellerId?: string;
};

const MODE_LABELS: Record<string, string> = {
  internal_only: "Internal only",
  external_only: "External only",
  both: "Internal + External",
};

export function AssignWebsiteWorkspace({ preset }: { preset?: AssignWebsitePreset | null }) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const gates = useWebsiteAssignmentGates();
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const skipCascadeRef = useRef(false);
  const isEditMode = Boolean(preset?.websiteId);

  useEffect(() => {
    if (!canFilterByResellerId && sessionResellerId) {
      setResellerId(sessionResellerId);
    }
  }, [canFilterByResellerId, sessionResellerId]);

  useEffect(() => {
    if (preset?.websiteId) {
      skipCascadeRef.current = true;
      setResellerId(preset.resellerId ?? "");
      setParentCompanyId(preset.parentCompanyId);
      setChildCompanyId(preset.childCompanyId ?? "");
      setWebsiteId(preset.websiteId);
    }
  }, [preset]);

  useEffect(() => {
    if (skipCascadeRef.current) {
      skipCascadeRef.current = false;
      return;
    }
    setParentCompanyId("");
    setChildCompanyId("");
    setWebsiteId("");
  }, [resellerId]);

  useEffect(() => {
    if (skipCascadeRef.current) {
      skipCascadeRef.current = false;
      return;
    }
    setChildCompanyId("");
    setWebsiteId("");
  }, [parentCompanyId]);

  useEffect(() => {
    if (skipCascadeRef.current) {
      skipCascadeRef.current = false;
      return;
    }
    setWebsiteId("");
  }, [childCompanyId]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: canFilterByResellerId,
  });
  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    { enabled: canFilterByResellerId ? resellerId.trim().length > 0 : true },
  );

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerSelectOptions = useMemo(() => {
    if (resellerOptions.length > 0) return [{ value: "", label: "All resellers" }, ...resellerOptions];
    return [
      { value: "", label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available" },
    ];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(companiesTreeQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    if (extracted.length > 0) return [{ value: "", label: "Select parent company" }, ...extracted];
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading ? "Loading parent companies…" : "No parent companies",
      },
    ];
  }, [canFilterByResellerId, resellerId, companiesTreeQuery.data, companiesTreeQuery.isLoading]);

  const childCompanyOptions = useMemo(() => {
    if (!parentCompanyId.trim()) return [{ value: "", label: "Select parent company first" }];
    const children = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    );
    if (children.length > 0) return [{ value: "", label: "All child companies (optional)" }, ...children];
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading ? "Loading child companies…" : "No child companies",
      },
    ];
  }, [parentCompanyId, companiesTreeQuery.data, companiesTreeQuery.isLoading]);

  const websitesParams = useMemo(
    () =>
      buildWebsitesInScopeParams({
        canFilterByResellerId,
        all: true,
        resellerId,
        parentCompanyId,
        childCompanyId: childCompanyId.trim() || undefined,
      }),
    [canFilterByResellerId, resellerId, parentCompanyId, childCompanyId],
  );

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(websitesParams, {
    allowResellerIdFilter: canFilterByResellerId,
    enabled:
      parentCompanyId.trim().length > 0 &&
      (canFilterByResellerId ? resellerId.trim().length > 0 : true),
  });

  const websiteSelectOptions = useMemo(() => {
    const items = websitesQuery.data?.data?.items ?? [];
    if (items.length === 0) {
      return [
        {
          value: "",
          label: websitesQuery.isFetching ? "Loading websites…" : "No websites for this selection",
        },
      ];
    }
    return [
      { value: "", label: "Select website" },
      ...items.map((w) => {
        const name = (w.name ?? "").trim() || "Website";
        const url = (w.url ?? "").trim();
        return {
          value: w.websiteId,
          label: formatWebsiteSelectLabel(name, url, w.websiteId),
        };
      }),
    ];
  }, [websitesQuery.data?.data?.items, websitesQuery.isFetching]);

  const wid = websiteId.trim();
  const detailQuery = useWebsiteAssignmentDetailQuery(wid, {
    enabled: wid.length > 0 && gates.view,
  });
  const detail = useMemo(
    () => parseWebsiteAssignmentDetail(detailQuery.data),
    [detailQuery.data],
  );

  const schedulingQuery = useServiceSchedulingQuery(wid, wid.length > 0);
  const schedulingReady =
    detail?.serviceSchedulingConfigured === true ||
    isServiceSchedulingReady(schedulingQuery.data);
  const schedulingLoading = Boolean(wid) && (schedulingQuery.isLoading || detailQuery.isLoading);

  const operatingChannels = detail?.operatingChannels ?? "internal_only";
  const allowedChannels = detail?.allowedAssignmentChannels ?? [];
  const schedulingTopics = useMemo(
    () => schedulingQuery.data?.topics ?? [],
    [schedulingQuery.data?.topics],
  );

  const defaultTopicKey = useMemo(() => {
    const active = schedulingTopics.filter(
      (t) =>
        t.isActive !== false &&
        t.routingKey.trim() &&
        t.internalDepartmentId.trim() &&
        t.externalDepartmentId.trim(),
    );
    return active[0]?.routingKey.trim() ?? schedulingTopics[0]?.routingKey.trim() ?? "";
  }, [schedulingTopics]);

  const defaultChannel = useMemo((): "Internal" | "External" => {
    if (operatingChannels === "external_only") return "External";
    return "Internal";
  }, [operatingChannels]);

  const schedulingHref = wid
    ? `/dashboard/website-assigning/website/${encodeURIComponent(wid)}/service-scheduling`
    : "";
  const rosterHref = wid ? `/dashboard/website-assigning/website/${encodeURIComponent(wid)}` : "";

  const websiteLabel =
    websiteSelectOptions.find((o) => o.value === websiteId)?.label ?? detail?.name ?? "";

  const flowStep: 1 | 2 | 3 | 4 = !wid
    ? 1
    : !schedulingReady
      ? 1
      : detail?.isFullyAssigned
        ? 4
        : 3;

  const handleContinueToScheduling = () => {
    if (!schedulingHref) return;
    router.push(schedulingHref);
  };

  if (gates.ready && !gates.view) {
    return (
      <PermissionDeniedPanel
        title="Assign website"
        description="You need page:website-assignments and website:assign (or website-assignment:view)."
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
            Assign website agents
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560 }}>
            Pick the website, configure the service schedule and agent roster — Primary, Secondary, and Backup per topic.
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
        </Box>
      </Box>

      <WebsiteAssignmentFlowStepper
        activeStep={flowStep}
        websiteId={wid || undefined}
        pickHref="/dashboard/website-assigning/assign"
        schedulingComplete={schedulingReady}
        rosterComplete={Boolean(detail?.isFullyAssigned)}
      />

      <Box sx={websiteAssignmentHeroSx}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <Assignment sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              {isEditMode && wid ? websiteLabel || "Website" : "Step 1 — Select website"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              {isEditMode && wid
                ? "Update roster below or open the full agent roster page."
                : "Choose organization and website to begin assignment."}
            </Typography>
          </Box>
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentModernCardSx}>
        {isEditMode && wid ? (
          <Box
            sx={{
              mb: 2.5,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: `${theme.palette.primary.main}10`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
              Editing assignments for
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {websiteLabel || detail?.url || "Website"}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Child: {childCompanyOptions.find((o) => o.value === childCompanyId)?.label || "—"} · Parent:{" "}
              {parentCompanyOptions.find((o) => o.value === parentCompanyId)?.label || "—"}
            </Typography>
          </Box>
        ) : null}

        {!isEditMode ? (
          <SchedulingSectionCard
            step={1}
            title="Organization & website"
            subtitle="Select reseller, parent company, child company, then the website."
          >
            <Box sx={assignWebsiteFormGridSx}>
              {canFilterByResellerId ? (
                <SelectField
                  label="Reseller"
                  value={resellerId}
                  onChange={setResellerId}
                  options={resellerSelectOptions}
                  menuMaxRows={8}
                />
              ) : null}
              <SelectField
                label="Parent company"
                value={parentCompanyId}
                onChange={setParentCompanyId}
                options={parentCompanyOptions}
                menuMaxRows={8}
                disabled={canFilterByResellerId && !resellerId.trim()}
              />
              <SelectField
                label="Child company"
                value={childCompanyId}
                onChange={setChildCompanyId}
                options={childCompanyOptions}
                menuMaxRows={8}
                disabled={!parentCompanyId.trim()}
              />
              <SelectField
                label="Website"
                value={websiteId}
                onChange={setWebsiteId}
                options={websiteSelectOptions}
                menuMaxRows={10}
                disabled={!parentCompanyId.trim()}
              />
            </Box>
          </SchedulingSectionCard>
        ) : null}

        {wid && detailQuery.isLoading ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 2 }}>
            Loading website details…
          </Typography>
        ) : null}

        {wid && detailQuery.isError ? (
          <Typography variant="body2" sx={{ color: theme.palette.error.main, mt: 2 }}>
            Could not load this website. Try again or open the agent roster page.
          </Typography>
        ) : null}

        {wid && detail && !detailQuery.isLoading ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5 }}>
              {websiteLabel}
              {detail.url ? ` · ${detail.url}` : ""}
              {" · "}
              {MODE_LABELS[detail.operatingChannels] ?? detail.operatingChannels}
            </Typography>

            {schedulingLoading ? (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
                Checking service scheduling…
              </Typography>
            ) : null}

            {!schedulingReady && !schedulingLoading ? (
              <SchedulingSectionCard step={2} title="Service scheduling" subtitle="Required before assigning agents.">
                <Box sx={emptyStatePanelSx}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Complete service scheduling first
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5 }}>
                    Set operating mode, service hours, and visitor topics. Assignment unlocks after you save
                    scheduling for this site.
                  </Typography>
                  {schedulingHref ? (
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
                  ) : null}
                </Box>
              </SchedulingSectionCard>
            ) : schedulingReady && (detail.departmentRoster?.length ?? 0) === 0 ? (
              <SchedulingSectionCard step={2} title="Service scheduling" subtitle="Topics still needed.">
                <Box sx={emptyStatePanelSx}>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    Scheduling is saved but no departments are linked yet. Add at least one complete topic
                    (internal + external department) in service scheduling.
                  </Typography>
                  {schedulingHref ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="small"
                      component={NextLink}
                      href={schedulingHref}
                      startIcon={<Schedule sx={{ fontSize: 18 }} />}
                    >
                      Open service scheduling
                    </Button>
                  ) : null}
                </Box>
              </SchedulingSectionCard>
            ) : (
              <SchedulingSectionCard
                step={3}
                title="Assign agents"
                subtitle="Channel → visitor topic → coverage blocks → Primary / Secondary / Backup per time window."
              >
                <TopicAgentRosterPanel
                  websiteId={wid}
                  operatingChannels={operatingChannels}
                  allowedChannels={allowedChannels}
                  departmentRoster={detail.departmentRoster}
                  topics={schedulingTopics}
                  canEdit={gates.assign}
                  initialChannel={defaultChannel}
                  initialTopicKey={defaultTopicKey || undefined}
                  onSaved={() => void detailQuery.refetch()}
                />
              </SchedulingSectionCard>
            )}

            {wid ? (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mt: 2.5,
                  pt: 2,
                  borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
                }}
              >
                <Typography variant="caption" sx={{ width: "100%", color: theme.app.dashboard.textMuted }}>
                  Open full pages:
                </Typography>
                {schedulingHref ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    component={NextLink}
                    href={schedulingHref}
                    startIcon={<Schedule sx={{ fontSize: 16 }} />}
                    endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                  >
                    Service scheduling
                  </Button>
                ) : null}
                {rosterHref ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    component={NextLink}
                    href={rosterHref}
                    startIcon={<Language sx={{ fontSize: 16 }} />}
                    endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                  >
                    Full agent roster
                  </Button>
                ) : null}
              </Box>
            ) : null}
          </Box>
        ) : null}

        {wid && !schedulingReady && !schedulingLoading ? (
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.app.dashboard.cardBorder}` }}>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<Schedule sx={{ fontSize: 18 }} />}
              onClick={handleContinueToScheduling}
            >
              Continue to service scheduling
            </Button>
          </Box>
        ) : null}

        {!gates.assign && gates.ready ? (
          <Typography variant="body2" sx={{ color: theme.palette.warning.main, mt: 2 }}>
            You can view assignments but do not have permission to change them.
          </Typography>
        ) : null}
      </DashboardCard>
    </Box>
  );
}
