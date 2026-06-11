"use client";

import { useMemo } from "react";
import PolicyOutlined from "@mui/icons-material/PolicyOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { DashboardCard, PermissionDeniedPanel, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import { useChatApiGates } from "@/lib/permissions";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { WebsiteChatSettingsRow } from "@/services/chat/chat-settings.types";
import type { QaPolicyScopeQuery } from "@/services/chat/qa-policy.api";
import { useGlobalQaPolicyQuery, useSaveGlobalQaPolicyMutation } from "../hooks/useChatSettings";
import { ChatSettingsSubnav } from "./ChatSettingsSubnav";
import { QaPolicyTab } from "./QaPolicyTab";

function toScopeQuery(filters: {
  resellerId: string;
  parentCompanyId: string;
  childCompanyId: string;
}): QaPolicyScopeQuery {
  return {
    resellerId: filters.resellerId.trim() || undefined,
    parentCompanyId: filters.parentCompanyId.trim() || undefined,
    childCompanyId: filters.childCompanyId.trim() || undefined,
  };
}

export function QaPolicyGlobalWorkspace() {
  const theme = useTheme() as AppTheme;
  const { permissionsSyncing, hasOperational, hasPage } = useAuth();
  const gates = useChatApiGates();

  const canView =
    gates.widgetSettings ||
    hasOperational(OP.qa.chatAssign) ||
    hasPage(PAGE.CHAT_QA_ROSTER);

  const canEdit =
    hasOperational(OP.chatWidget.update) || hasOperational(OP.qa.chatAssign);

  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: canView });
  const scopeQuery = useMemo(
    () => toScopeQuery(scopeFilters.filters),
    [scopeFilters.filters],
  );

  const policyQuery = useGlobalQaPolicyQuery(scopeQuery, canView);
  const savePolicy = useSaveGlobalQaPolicyMutation(scopeQuery);

  const settingsRow = useMemo((): WebsiteChatSettingsRow | null => {
    if (!policyQuery.data?.policy) return null;
    return {
      id: "global-qa-policy",
      defaultDepartmentId: null,
      defaultDepartment: null,
      operationsJson: { qa: policyQuery.data.policy },
    };
  }, [policyQuery.data?.policy]);

  if (permissionsSyncing) {
    return (
      <Typography sx={{ py: 4, color: theme.app.dashboard.textMuted }}>
        Loading permissions…
      </Typography>
    );
  }

  if (!canView) {
    return (
      <PermissionDeniedPanel
        title="QA policy not available"
        description="Requires chat-widget access or qa:chat:assign from /auth/me."
      />
    );
  }

  const view = policyQuery.data;
  const policyDisabled = !view?.policy.enabled;

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Chat settings"
        subtitle="QA policy applies to every website in your selected org scope — turn it on once, then assign reviewers per site on QA roster."
        navPreset="configure"
      />

      <ChatSettingsSubnav />

      <DashboardCard sx={{ flexShrink: 0, p: { xs: 1.5, md: 2 }, height: "auto", minHeight: 0 }}>
        <ChatScopeFiltersPanel
          compact
          filters={scopeFilters.filters}
          onPatch={scopeFilters.patchFilters}
          onReset={scopeFilters.resetFilters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          resellerOptions={scopeFilters.resellerOptions}
          parentCompanyOptions={scopeFilters.parentCompanyOptions}
          childCompanyOptions={scopeFilters.childCompanyOptions}
          websiteOptions={scopeFilters.websiteOptions}
          hideWebsiteFilter
          hint="Org filters only — saving applies this QA policy to all websites in scope (not one site at a time)."
        />
      </DashboardCard>

      <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start", mb: 2 }}>
          <PolicyOutlined sx={{ color: theme.app.dashboard.accentOrange, mt: 0.25 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} sx={{ fontSize: 16 }}>
              Global QA policy
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5, display: "block" }}
            >
              {view
                ? `${view.websiteCount} website(s) in scope · ${view.enabledWebsiteCount} with QA enabled`
                : "Loading scope…"}
            </Typography>
          </Box>
        </Box>

        {view?.mixed ? (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              p: 1.5,
              mb: 2,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              Websites in this scope have different QA settings. Saving will apply the same policy to{" "}
              <strong>all {view.websiteCount}</strong> websites.
            </Typography>
          </Box>
        ) : null}

        {policyDisabled ? (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              p: 1.5,
              mb: 2,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
            }}
          >
            <WarningAmberOutlined
              sx={{ fontSize: 18, color: theme.palette.warning.main, mt: 0.15 }}
            />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              <strong>QA is off</strong> for websites in this scope. Enable and save — then assign
              reviewers on <strong>QA roster</strong> per website.
            </Typography>
          </Box>
        ) : null}

        {policyQuery.isLoading ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading QA policy…</Typography>
        ) : policyQuery.isError || !settingsRow ? (
          <Typography color="error">Could not load QA policy.</Typography>
        ) : (
          <QaPolicyTab
            settings={settingsRow}
            canEdit={canEdit}
            saving={savePolicy.isPending}
            globalContext
            onSave={(body) => {
              const qa = (body.operationsJson?.qa ?? {}) as Record<string, unknown>;
              savePolicy.mutate(
                {
                  enabled: Boolean(qa.enabled),
                  autoAssignOnClose: qa.autoAssignOnClose !== false,
                  autoAssignOnTakeover: Boolean(qa.autoAssignOnTakeover),
                  notifyAssignedQaOnTakeover: Boolean(qa.notifyAssignedQaOnTakeover),
                  externalCanSeeWhispers: Boolean(qa.externalCanSeeWhispers),
                  assignMode:
                    String(qa.assignMode ?? "least_pending") === "round_robin"
                      ? "round_robin"
                      : "least_pending",
                  internalAssignScope:
                    String(qa.internalAssignScope ?? "website") === "pool"
                      ? "pool"
                      : "website",
                  reviewSlaHours:
                    qa.reviewSlaHours === null || qa.reviewSlaHours === undefined
                      ? null
                      : Number(qa.reviewSlaHours) || null,
                },
                {
                  onSuccess: (result) =>
                    publishAppToast({
                      message: `QA policy saved for ${result.appliedWebsiteCount} website(s)${
                        result.backfilledReviewCount
                          ? ` · ${result.backfilledReviewCount} closed chat(s) queued`
                          : ""
                      }.`,
                      variant: "success",
                    }),
                  onError: (e) =>
                    publishAppToast({
                      message: extractApiErrorMessageForToast(e, "Could not save QA policy"),
                      variant: "error",
                    }),
                },
              );
            }}
          />
        )}
      </DashboardCard>
    </ChatLivePageShell>
  );
}
