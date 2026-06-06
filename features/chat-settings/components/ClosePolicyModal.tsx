"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FormModal, SelectField, Typography } from "@/components/common";
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
import {
  canFetchWebsitesInOrgScope,
  parseWebsitesFromAssignmentsPayload,
} from "@/features/chat-shared/utils/website-scope-options";
import {
  useSaveWebsiteChatSettingsMutation,
  useWebsiteChatSettingsQuery,
} from "../hooks/useChatSettings";
import { ClosePolicyTab } from "./ClosePolicyTab";

interface ClosePolicyModalProps {
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  initialWebsiteId?: string;
  onSaved: () => void;
  onError: (e: unknown) => void;
}

export function ClosePolicyModal({
  open,
  onClose,
  canEdit,
  initialWebsiteId = "",
  onSaved,
  onError,
}: ClosePolicyModalProps) {
  const theme = useTheme() as AppTheme;
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [saveFn, setSaveFn] = useState<(() => void) | null>(null);
  const lockScope = Boolean(initialWebsiteId.trim());
  /** Skip scope-reset effects while hydrating dropdowns from a loaded website. */
  const skipScopeResetRef = useRef(false);

  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    { enabled: open && (canFilterByResellerId ? resellerId.trim().length > 0 : true) },
  );

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: open && canFilterByResellerId,
  });

  const websitesInScopeQuery = useWebsiteAssignmentsWebsitesQuery(
    buildWebsitesInScopeParams({
      canFilterByResellerId,
      all: true,
      resellerId,
      parentCompanyId,
      childCompanyId,
    }),
    {
      enabled:
        open &&
        canFetchWebsitesInOrgScope({
          canFilterByResellerId,
          resellerId,
          parentCompanyId,
          childCompanyId,
        }),
      allowResellerIdFilter: canFilterByResellerId,
    },
  );

  const settingsQuery = useWebsiteChatSettingsQuery(websiteId, open && Boolean(websiteId));
  const saveSettings = useSaveWebsiteChatSettingsMutation(websiteId);

  useEffect(() => {
    if (!open) return;
    setSaveFn(null);
    if (initialWebsiteId.trim()) {
      setWebsiteId(initialWebsiteId.trim());
    } else {
      setWebsiteId("");
      setResellerId("");
      setParentCompanyId("");
      setChildCompanyId("");
    }
  }, [open, initialWebsiteId]);

  useEffect(() => {
    if (!open || lockScope) return;
    skipScopeResetRef.current = true;
    setParentCompanyId("");
    setChildCompanyId("");
    setWebsiteId("");
    queueMicrotask(() => {
      skipScopeResetRef.current = false;
    });
  }, [resellerId, lockScope, open]);

  useEffect(() => {
    if (!open || lockScope) return;
    if (skipScopeResetRef.current) return;
    skipScopeResetRef.current = true;
    setChildCompanyId("");
    setWebsiteId("");
    queueMicrotask(() => {
      skipScopeResetRef.current = false;
    });
  }, [parentCompanyId, lockScope, open]);

  useEffect(() => {
    if (!open || lockScope) return;
    if (skipScopeResetRef.current) return;
    setWebsiteId("");
  }, [childCompanyId, lockScope, open]);

  const resellerOptions = useMemo(() => {
    const rows = pickItemsArray(resellersQuery.data)
      .map((r) => toIdNameOption(r))
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "Select reseller…" }, ...rows];
  }, [resellersQuery.data]);

  const parentCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first…" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(companiesTreeQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    if (extracted.length > 0) {
      return [{ value: "", label: "Select parent company…" }, ...extracted];
    }
    return [{ value: "", label: companiesTreeQuery.isLoading ? "Loading…" : "No parent companies" }];
  }, [canFilterByResellerId, resellerId, companiesTreeQuery.data, companiesTreeQuery.isLoading]);

  const childCompanyOptions = useMemo(() => {
    if (!parentCompanyId.trim()) {
      return [{ value: "", label: "Select parent company first…" }];
    }
    const children = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    );
    return children.length > 0
      ? [{ value: "", label: "Select child company…" }, ...children]
      : [{ value: "", label: "No child companies" }];
  }, [parentCompanyId, companiesTreeQuery.data]);

  const websiteOptions = useMemo(() => {
    if (!childCompanyId.trim() || !parentCompanyId.trim()) {
      return [{ value: "", label: "Select company scope first…" }];
    }
    if (websitesInScopeQuery.isLoading) {
      return [{ value: "", label: "Loading websites…" }];
    }
    const scopeSites = parseWebsitesFromAssignmentsPayload(websitesInScopeQuery.data).map((w) => ({
      value: w.websiteId,
      label: w.label,
    }));
    return [{ value: "", label: "Select website…" }, ...scopeSites];
  }, [
    childCompanyId,
    parentCompanyId,
    websitesInScopeQuery.data,
    websitesInScopeQuery.isLoading,
  ]);

  const handleModalSave = () => {
    if (!websiteId.trim() || !canEdit) return;
    saveFn?.();
  };

  const handleSaveSettings = useCallback(
    (body: Parameters<typeof saveSettings.mutate>[0]) => {
      saveSettings.mutate(body, {
        onSuccess: () => {
          onSaved();
          onClose();
        },
        onError,
      });
    },
    [onClose, onError, onSaved, saveSettings],
  );

  const isEditingExisting = Boolean(initialWebsiteId);

  return (
    <FormModal
      open={open}
      title={isEditingExisting ? "Edit close policy" : "Add close policy"}
      description="Pick the website, then configure auto-close timers, fallback messages, and supervisor rules."
      onClose={onClose}
      onSave={handleModalSave}
      primaryButtonLabel={saveSettings.isPending ? "Saving…" : "Save close policy"}
      primaryButtonDisabled={
        saveSettings.isPending || !canEdit || !websiteId.trim() || settingsQuery.isLoading
      }
      maxWidth={920}
      fitContent
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!isEditingExisting ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {canFilterByResellerId ? (
              <SelectField
                label="Reseller"
                value={resellerId}
                onChange={setResellerId}
                options={resellerOptions}
                disabled={!canEdit}
                menuMaxRows={8}
              />
            ) : null}
            <SelectField
              label="Parent company"
              value={parentCompanyId}
              onChange={setParentCompanyId}
              options={parentCompanyOptions}
              disabled={!canEdit || (canFilterByResellerId && !resellerId.trim())}
              menuMaxRows={8}
            />
            <SelectField
              label="Child company"
              value={childCompanyId}
              onChange={setChildCompanyId}
              options={childCompanyOptions}
              disabled={!canEdit || !parentCompanyId.trim()}
              menuMaxRows={8}
            />
            <SelectField
              label="Website"
              value={websiteId}
              onChange={setWebsiteId}
              options={websiteOptions}
              disabled={!canEdit || !childCompanyId.trim()}
              menuMaxRows={10}
            />
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {settingsQuery.data?.website?.websiteName ||
              settingsQuery.data?.website?.websiteUrl ||
              websiteId}
          </Typography>
        )}

        {!websiteId.trim() ? (
          <Typography sx={{ py: 2, color: theme.app.dashboard.textMuted, textAlign: "center" }}>
            Select a website to configure close policy.
          </Typography>
        ) : settingsQuery.isLoading ? (
          <Typography sx={{ py: 2, color: theme.app.dashboard.textMuted }}>Loading settings…</Typography>
        ) : settingsQuery.isError || !settingsQuery.data ? (
          <Typography sx={{ color: theme.palette.error.light }}>
            Could not load settings for this website.
          </Typography>
        ) : (
          <ClosePolicyTab
            settings={settingsQuery.data.settings}
            canEdit={canEdit}
            saving={saveSettings.isPending}
            hideSaveButton
            onSaveReady={setSaveFn}
            onSave={handleSaveSettings}
          />
        )}
      </Box>
    </FormModal>
  );
}
