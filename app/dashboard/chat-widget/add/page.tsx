"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { Button, Typography, SelectField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { WebsiteWidgetConflictAlert } from "@/components/dashboard/chat-widget/WebsiteWidgetConflictAlert";
import { WidgetTypeSelectionCards } from "@/components/dashboard/chat-widget/WidgetTypeSelectionCards";
import { useResellerListScope } from "@/lib/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { websiteAssignmentItemToSelectOption } from "@/lib/websites/format-website-select-label";
import {
  buildWebsitesInScopeParams,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import {
  createRemoteWidgetDraftWithMeta,
  isServerWidgetDraftAlive,
} from "@/lib/chat-widget/widget-remote-sync";
import { appendWizardSaveTraceToSession } from "@/lib/chat-widget/widget-wizard-save-trace";
import {
  readChatWizardDraft,
  resetCreateWizardDraft,
  saveChatWizardDraft,
} from "@/lib/chat-widget/chat-wizard-edit";
import { loadInquiryTopicsFromScheduling } from "@/lib/chat-widget/hydrate-widget-inquiry-from-scheduling";
import type { WidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { findConflictingWebsiteWidgets, wizardEntryPathForKind } from "@/lib/chat-widget/widget-type-conflicts";
import {
  clampWidgetKind,
  pickDefaultWidgetKind,
  resolveAllowedWidgetKinds,
} from "@/lib/chat-widget/widget-kind-entitlement";
import { useWebsiteWidgetsQuery } from "@/lib/chat-widget/use-website-widgets-query";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";

type WidgetType = "chat" | "text" | "both";

export default function WidgetTypeSelectionPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();
  const { hasPage } = useAuth();
  const allowedWidgetKinds = useMemo(() => resolveAllowedWidgetKinds(hasPage), [hasPage]);
  const [selectedType, setSelectedType] = useState<WidgetType>("chat");
  /** Same as `selectedType`, updated synchronously on card click so Next never reads stale state. */
  const selectedTypeRef = useRef<WidgetType>("chat");

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");

  const [hydratedFromDraft, setHydratedFromDraft] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  useEffect(() => {
    if (!canFilterByResellerId && sessionResellerId) {
      setResellerId(sessionResellerId);
    }
  }, [canFilterByResellerId, sessionResellerId]);

  useEffect(() => {
    resetCreateWizardDraft();
    const d = readChatWizardDraft(null);
    if (d.tenantResellerId) setResellerId(d.tenantResellerId);
    else if (!canFilterByResellerId && sessionResellerId) setResellerId(sessionResellerId);
    if (d.tenantParentCompanyId) setParentCompanyId(d.tenantParentCompanyId);
    if (d.tenantChildCompanyId) setChildCompanyId(d.tenantChildCompanyId);
    if (d.websiteId) setWebsiteId(d.websiteId);
    if (d.type === "chat" || d.type === "text" || d.type === "both") {
      const clamped = clampWidgetKind(d.type, allowedWidgetKinds) ?? pickDefaultWidgetKind(allowedWidgetKinds);
      if (clamped) {
        setSelectedType(clamped);
        selectedTypeRef.current = clamped;
      }
    }
    setHydratedFromDraft(true);
  }, [canFilterByResellerId, sessionResellerId, allowedWidgetKinds]);

  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);

  useEffect(() => {
    const next = clampWidgetKind(selectedType, allowedWidgetKinds);
    if (!next || next === selectedType) return;
    setSelectedType(next);
    selectedTypeRef.current = next;
  }, [allowedWidgetKinds, selectedType]);

  const hasWidgetEntitlement = allowedWidgetKinds.length > 0;

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: hydratedFromDraft && canFilterByResellerId,
  });

  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    {
      enabled:
        hydratedFromDraft &&
        (canFilterByResellerId ? resellerId.trim().length > 0 : true),
    },
  );

  const websitesParams = useMemo(
    () =>
      buildWebsitesInScopeParams({
        canFilterByResellerId,
        all: true,
        resellerId,
        parentCompanyId,
        childCompanyId,
      }),
    [canFilterByResellerId, resellerId, parentCompanyId, childCompanyId],
  );

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(websitesParams, {
    allowResellerIdFilter: canFilterByResellerId,
    enabled:
      hydratedFromDraft &&
      parentCompanyId.trim().length > 0 &&
      childCompanyId.trim().length > 0 &&
      (canFilterByResellerId ? resellerId.trim().length > 0 : true),
  });

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerSelectOptions = useMemo(() => {
    if (resellerOptions.length === 0) {
      return [
        {
          value: "",
          label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available",
        },
      ];
    }
    return [{ value: "", label: "Select reseller" }, ...resellerOptions];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(
      companiesTreeQuery.data,
    ).map((o) => ({ value: o.value, label: o.label }));
    if (extracted.length > 0) {
      return [{ value: "", label: "Select parent company" }, ...extracted];
    }
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading
          ? "Loading parent companies…"
          : "No parent companies available",
      },
    ];
  }, [canFilterByResellerId, resellerId, companiesTreeQuery.data, companiesTreeQuery.isLoading]);

  const childCompanyRows = useMemo(() => {
    if ((canFilterByResellerId && !resellerId.trim()) || !parentCompanyId.trim()) return [];
    return extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    );
  }, [canFilterByResellerId, resellerId, parentCompanyId, companiesTreeQuery.data]);

  const childCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    if (!parentCompanyId.trim()) return [{ value: "", label: "Select parent company first" }];
    if (childCompanyRows.length > 0) {
      return [{ value: "", label: "Select child company" }, ...childCompanyRows];
    }
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading
          ? "Loading child companies…"
          : "No child companies for this parent",
      },
    ];
  }, [
    canFilterByResellerId,
    resellerId,
    parentCompanyId,
    childCompanyRows,
    companiesTreeQuery.isLoading,
  ]);

  const websiteRows = useMemo(() => {
    return websitesQuery.data?.data?.items ?? [];
  }, [websitesQuery.data?.data?.items]);

  const websiteOptions = useMemo(() => {
    if (websiteRows.length === 0) {
      return [
        {
          value: "",
          label: websitesQuery.isFetching ? "Loading websites…" : "No websites for this child company",
        },
      ];
    }
    return [
      { value: "", label: "Select website" },
      ...websiteRows.map((w) => websiteAssignmentItemToSelectOption(w)),
    ];
  }, [websiteRows, websitesQuery.isFetching]);

  /** If draft website is not in the filtered list, drop it (stale selection). */
  useEffect(() => {
    if (!websiteId || websiteRows.length === 0) return;
    const ok = websiteRows.some((w) => w.websiteId === websiteId);
    if (!ok) setWebsiteId("");
  }, [websiteRows, websiteId]);

  /** Invalidate child selection if it is not under the current parent (e.g. tree refresh). */
  useEffect(() => {
    if (!childCompanyId || childCompanyRows.length === 0) return;
    const ok = childCompanyRows.some((c) => c.value === childCompanyId);
    if (!ok) setChildCompanyId("");
  }, [childCompanyRows, childCompanyId]);

  const sitesError =
    websitesQuery.isError
      ? extractApiErrorMessageForToast(websitesQuery.error) ??
        "Unable to load websites."
      : null;

  const hierarchyReady =
    (canFilterByResellerId ? Boolean(resellerId.trim()) : true) &&
    Boolean(parentCompanyId.trim()) &&
    Boolean(childCompanyId.trim());

  const hasWebsiteChoices = websiteRows.length > 0;
  const websitesLoading =
    hierarchyReady && websitesQuery.isFetching && !websitesQuery.data;

  const canContinue =
    hydratedFromDraft &&
    hasWidgetEntitlement &&
    hierarchyReady &&
    Boolean(websiteId) &&
    hasWebsiteChoices &&
    !websitesLoading &&
    !sitesError &&
    !creatingDraft;

  const siteWidgetsQuery = useWebsiteWidgetsQuery(websiteId, canContinue || Boolean(websiteId));
  const conflicts = useMemo(
    () => findConflictingWebsiteWidgets(siteWidgetsQuery.data ?? [], selectedType),
    [siteWidgetsQuery.data, selectedType],
  );

  const runCreateAndContinue = () => {
    if (!websiteId || !hierarchyReady || creatingDraft) return;
    void (async () => {
      const prev = readChatWizardDraft(null);
      const wid = websiteId.trim();
      const kind = selectedTypeRef.current;
      let needNewRemote =
        !prev.remoteWidgetKey?.trim() ||
        prev.websiteId?.trim() !== wid ||
        prev.type !== kind;

      if (!needNewRemote && prev.remoteWidgetKey?.trim()) {
        try {
          const alive = await isServerWidgetDraftAlive(prev.remoteWidgetKey);
          if (!alive) needNewRemote = true;
        } catch (verifyErr) {
          publishAppToast({
            variant: "error",
            message:
              extractApiErrorMessageForToast(verifyErr) ??
              "Could not verify existing widget draft.",
          });
          return;
        }
      }

      const base: WidgetDraft = {
        ...prev,
        type: kind,
        websiteId: wid,
        tenantResellerId: (canFilterByResellerId ? resellerId : sessionResellerId).trim(),
        tenantParentCompanyId: parentCompanyId.trim(),
        tenantChildCompanyId: childCompanyId.trim(),
        completed: false,
      };

      setCreatingDraft(true);
      try {
        if (needNewRemote) {
          const created = await createRemoteWidgetDraftWithMeta({
            draft: base,
            widgetKind: kind,
          });
          appendWizardSaveTraceToSession({
            stepKey: "website",
            stepLabel: "Step 0 — Website & type",
            method: created.meta.method,
            path: created.meta.path,
            scope: "create",
            publishNow: created.meta.publishNow,
            requestBody: created.meta.requestBody,
            responseBody: created.meta.inner,
          });
          const fromScheduling = await loadInquiryTopicsFromScheduling(wid);
          saveChatWizardDraft(null, {
            ...base,
            remoteWidgetKey: created.widgetKey,
            widgetId: created.widgetKey,
            requiresPublishBeforeEmbed: created.requiresPublishBeforeEmbed,
            ...(fromScheduling.length > 0
              ? { inquiryOptions: fromScheduling, inquiryOn: true }
              : {}),
          });
          publishAppToast({
            variant: "success",
            message: "Draft saved on server. Continue configuration.",
          });
        } else {
          const fromScheduling = await loadInquiryTopicsFromScheduling(wid);
          saveChatWizardDraft(null, {
            ...base,
            ...(fromScheduling.length > 0
              ? { inquiryOptions: fromScheduling, inquiryOn: true }
              : {}),
          });
        }

        router.push(wizardEntryPathForKind(kind));
      } catch (e) {
        publishAppToast({
          variant: "error",
          message:
            extractApiErrorMessageForToast(e) ??
            "Could not create widget draft on the server.",
        });
      } finally {
        setCreatingDraft(false);
        setConflictDialogOpen(false);
      }
    })();
  };

  const subtitle = useMemo(() => {
    if (!hydratedFromDraft) return "Loading…";
    if (websitesLoading) return "Loading websites for the selected child company…";
    return canFilterByResellerId
      ? "Select reseller → parent company → child company, then choose a website."
      : "Select parent company → child company, then choose a website.";
  }, [hydratedFromDraft, websitesLoading, canFilterByResellerId]);

  return (
    <WidgetFlowShell
      pageTitle="Widget Type Selection"
      subtitle={subtitle}
      cardTitle="Widget Type Selection"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) return;
              if (conflicts.length > 0) {
                setConflictDialogOpen(true);
                return;
              }
              runCreateAndContinue();
            }}
          >
            {creatingDraft ? "Saving draft…" : "Next"}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
        {canFilterByResellerId ? (
          <SelectField
            label="Reseller"
            placeholder="Select reseller"
            value={resellerId}
            onChange={(v) => {
              setResellerId(v);
              setParentCompanyId("");
              setChildCompanyId("");
              setWebsiteId("");
            }}
            options={resellerSelectOptions}
            disabled={!hydratedFromDraft || resellersQuery.isLoading}
            searchPlaceholder="Search reseller…"
            menuMaxRows={10}
          />
        ) : null}
        <SelectField
          label="Parent company"
          placeholder="Select parent company"
          value={parentCompanyId}
          onChange={(v) => {
            setParentCompanyId(v);
            setChildCompanyId("");
            setWebsiteId("");
          }}
          options={parentCompanyOptions}
          disabled={
            (canFilterByResellerId && !resellerId.trim()) || companiesTreeQuery.isLoading
          }
          searchPlaceholder="Search parent company…"
          menuMaxRows={10}
        />
        <SelectField
          label="Child company"
          placeholder="Select child company"
          value={childCompanyId}
          onChange={(v) => {
            setChildCompanyId(v);
            setWebsiteId("");
          }}
          options={childCompanyOptions}
          disabled={!parentCompanyId.trim() || companiesTreeQuery.isLoading}
          searchPlaceholder="Search child company…"
          menuMaxRows={10}
        />
        <SelectField
          label="Website"
          placeholder={websitesLoading ? "Loading…" : "Select website"}
          value={websiteId}
          onChange={setWebsiteId}
          options={websiteOptions}
          disabled={!hierarchyReady || websitesLoading || !hasWebsiteChoices}
          searchPlaceholder="Search website…"
          menuMaxRows={10}
        />
        {sitesError ? (
          <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
            {sitesError}
          </Typography>
        ) : null}
        {!sitesError && hierarchyReady && !websitesLoading && !hasWebsiteChoices ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            No websites returned for this child company. Confirm website assignments in Website
            Assignments.
          </Typography>
        ) : null}
      </Box>

      {websiteId ? (
        <Box sx={{ mb: 2 }}>
          <WebsiteWidgetConflictAlert
            conflicts={conflicts}
            selectedKind={selectedType}
            mode="create"
          />
        </Box>
      ) : null}

      <WidgetTypeSelectionCards
        selectedType={selectedType}
        onSelect={(kind) => {
          setSelectedType(kind);
          selectedTypeRef.current = kind;
        }}
        allowedKinds={allowedWidgetKinds}
      />

      <Dialog open={conflictDialogOpen} onClose={() => !creatingDraft && setConflictDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>This website already has a widget</DialogTitle>
        <DialogContent>
          <WebsiteWidgetConflictAlert
            conflicts={conflicts}
            selectedKind={selectedType}
            mode="create"
          />
          <Typography variant="body2" sx={{ mt: 2, color: theme.app.dashboard.textMuted }}>
            We recommend editing the existing widget or using <strong>Chat + Text Us</strong> instead
            of adding a second embed script.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="secondary" onClick={() => setConflictDialogOpen(false)} disabled={creatingDraft}>
            Choose different type
          </Button>
          <Button
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={runCreateAndContinue}
            disabled={creatingDraft}
          >
            Create anyway
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetFlowShell>
  );
}
