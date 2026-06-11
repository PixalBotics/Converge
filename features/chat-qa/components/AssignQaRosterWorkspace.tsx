"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import Box from "@mui/material/Box";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  filterPanelDescriptionSx,
  PermissionDeniedPanel,
  SelectField,
  Typography,
} from "@/components/common";
import { ChatLivePageHeader, ChatLivePageShell } from "@/features/chat-shared";
import { QaRosterTab } from "@/features/chat-settings/components/QaRosterTab";
import { useResellerListScope } from "@/lib/auth";
import {
  buildWebsitesInScopeParams,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { websiteAssignmentItemToSelectOption } from "@/lib/websites/format-website-select-label";
import { assignWebsiteFormGridSx } from "@/components/common/AssignWebsiteModal/assign-website-modal.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  websiteAssignmentFilterGrid,
  websiteAssignmentHeroSx,
  websiteAssignmentModernCardSx,
  websiteAssignmentPageHeader,
  websiteAssignmentSectionIconSx,
} from "@/app/dashboard/website-assigning/website-assigning.styles";
import { useAuth } from "@/lib/auth";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import type { QaAssignPreset } from "../utils/qa-assign-href";

export function AssignQaRosterWorkspace({ preset }: { preset?: QaAssignPreset | null }) {
  const theme = useTheme() as AppTheme;
  const { hasOperational, hasPage, permissionsSyncing } = useAuth();
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();

  const canView =
    hasPage(PAGE.CHAT_QA_ROSTER) ||
    hasPage(PAGE.CHAT_WIDGET) ||
    hasPage(PAGE.CHAT) ||
    hasOperational(OP.qa.chatAssign);

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const skipCascadeRef = useRef(false);

  useEffect(() => {
    if (!canFilterByResellerId && sessionResellerId) {
      setResellerId(sessionResellerId);
    }
  }, [canFilterByResellerId, sessionResellerId]);

  useEffect(() => {
    if (!preset?.websiteId) return;
    skipCascadeRef.current = true;
    setResellerId(preset.resellerId ?? "");
    setParentCompanyId(preset.parentCompanyId ?? "");
    setChildCompanyId(preset.childCompanyId ?? "");
    setWebsiteId(preset.websiteId);
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

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(
    buildWebsitesInScopeParams({
      canFilterByResellerId,
      all: true,
      resellerId,
      parentCompanyId,
      childCompanyId,
    }),
    {
      enabled: Boolean(parentCompanyId.trim()),
      allowResellerIdFilter: canFilterByResellerId,
    },
  );

  const resellerOptions = useMemo(() => {
    const opts = pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "Select reseller…" }, ...opts];
  }, [resellersQuery.data]);

  const parentOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(companiesTreeQuery.data).map(
      (o) => ({ value: o.value, label: o.label }),
    );
    return [{ value: "", label: "Select parent company…" }, ...extracted];
  }, [canFilterByResellerId, resellerId, companiesTreeQuery.data]);

  const childOptions = useMemo(() => {
    if (!parentCompanyId.trim()) {
      return [{ value: "", label: "Select parent first" }];
    }
    const extracted = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    ).map((o) => ({ value: o.value, label: o.label }));
    return [{ value: "", label: "All children" }, ...extracted];
  }, [companiesTreeQuery.data, parentCompanyId]);

  const websiteOptions = useMemo(() => {
    const items = websitesQuery.data?.data?.items ?? [];
    if (!items.length) {
      return [
        {
          value: "",
          label: websitesQuery.isLoading ? "Loading websites…" : "No websites in scope",
        },
      ];
    }
    return [
      { value: "", label: "Select website…" },
      ...items.map((w) => websiteAssignmentItemToSelectOption(w)),
    ];
  }, [websitesQuery.data, websitesQuery.isLoading]);

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
        title="QA roster assign not available"
        description="Requires qa:chat:assign or page:chat-qa-roster."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Assign QA reviewers"
        subtitle="Pick a website and assign internal QA reviewers by pool. Enable QA globally under Chat settings → QA policy."
        navPreset="configure"
      />

      <Box sx={mergeSx(websiteAssignmentPageHeader, { mb: 0 })}>
        <Button
          type="button"
          variant="secondary"
          startIcon={<ArrowBack />}
          component={NextLink}
          href="/dashboard/qa/roster"
          sx={{ color: theme.app.dashboard.textMuted, alignSelf: "flex-start" }}
        >
          Back to QA roster
        </Button>
      </Box>

      <Box sx={mergeSx(websiteAssignmentHeroSx, { mb: 0 })}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <FactCheckOutlined sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              Website scope
            </Typography>
            <Typography variant="medium" sx={mergeSx(filterPanelDescriptionSx, { maxWidth: 640 })}>
              Same org picker as website assignments—then choose departments and reviewers below.
            </Typography>
          </Box>
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentModernCardSx}>
        <Box sx={mergeSx(websiteAssignmentFilterGrid, assignWebsiteFormGridSx)}>
          {canFilterByResellerId ? (
            <SelectField
              label="Reseller"
              value={resellerId}
              onChange={setResellerId}
              options={resellerOptions}
              menuMaxRows={8}
            />
          ) : null}
          <SelectField
            label="Parent company"
            value={parentCompanyId}
            onChange={setParentCompanyId}
            options={parentOptions}
            menuMaxRows={8}
            disabled={canFilterByResellerId && !resellerId.trim()}
          />
          <SelectField
            label="Child company"
            value={childCompanyId}
            onChange={setChildCompanyId}
            options={childOptions}
            menuMaxRows={8}
            disabled={!parentCompanyId.trim()}
          />
          <SelectField
            label="Website"
            value={websiteId}
            onChange={setWebsiteId}
            options={websiteOptions}
            menuMaxRows={10}
            disabled={!parentCompanyId.trim()}
          />
        </Box>
      </DashboardCard>

      {websiteId.trim() ? (
        <QaRosterTab
          websiteId={websiteId.trim()}
          parentCompanyId={parentCompanyId}
          resellerId={canFilterByResellerId ? resellerId : sessionResellerId ?? ""}
          canFilterByResellerId={canFilterByResellerId}
        />
      ) : (
        <DashboardCard sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
          <Typography fontWeight={600} sx={{ mb: 0.75, color: theme.app.text.primary }}>
            Select a website
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Choose org and website above to manage pool-wise internal QA reviewers.
          </Typography>
        </DashboardCard>
      )}
    </ChatLivePageShell>
  );
}
