"use client";

import { useEffect, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, FormModal, InputField, SelectField, Typography } from "@/components/common";
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
import type { CannedResponseItem } from "@/services/chat/canned-responses.types";
import {
  canFetchWebsitesInOrgScope,
  parseWebsitesFromAssignmentsPayload,
} from "@/features/chat-shared/utils/website-scope-options";
import { useWebsiteCannedQuery } from "../hooks/useCannedResponses";

type DraftItem = { title: string; body: string; sortOrder: number };

const emptyItem = (): DraftItem => ({ title: "", body: "", sortOrder: 0 });

interface CannedMessagesModalProps {
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  saving: boolean;
  initialWebsiteId?: string;
  onSave: (websiteId: string, items: CannedResponseItem[]) => void;
}

export function CannedMessagesModal({
  open,
  onClose,
  canEdit,
  saving,
  initialWebsiteId = "",
  onSave,
}: CannedMessagesModalProps) {
  const theme = useTheme() as AppTheme;
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);

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

  const websiteCannedQuery = useWebsiteCannedQuery(websiteId, open && Boolean(websiteId));

  useEffect(() => {
    if (!open) return;
    setWebsiteId(initialWebsiteId);
    if (!initialWebsiteId) {
      setItems([emptyItem()]);
    }
  }, [open, initialWebsiteId]);

  useEffect(() => {
    if (!open || !websiteCannedQuery.data) return;
    const loaded = websiteCannedQuery.data.items;
    setItems(
      loaded.length > 0
        ? loaded.map((r, i) => ({
            title: r.title,
            body: r.body,
            sortOrder: r.sortOrder ?? i,
          }))
        : [emptyItem()],
    );
    if (websiteCannedQuery.data.parentCompanyId) {
      setParentCompanyId(websiteCannedQuery.data.parentCompanyId);
    }
    if (websiteCannedQuery.data.childCompanyId) {
      setChildCompanyId(websiteCannedQuery.data.childCompanyId);
    }
    if (websiteCannedQuery.data.resellerId) {
      setResellerId(websiteCannedQuery.data.resellerId);
    }
  }, [open, websiteCannedQuery.data]);

  useEffect(() => {
    setParentCompanyId("");
    setChildCompanyId("");
    setWebsiteId("");
  }, [resellerId]);

  useEffect(() => {
    setChildCompanyId("");
    setWebsiteId("");
  }, [parentCompanyId]);

  useEffect(() => {
    setWebsiteId("");
  }, [childCompanyId]);

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
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading
          ? "Loading parent companies…"
          : companiesTreeQuery.isError
            ? "Could not load parent companies"
            : "No parent companies for this reseller",
      },
    ];
  }, [
    canFilterByResellerId,
    resellerId,
    companiesTreeQuery.data,
    companiesTreeQuery.isLoading,
    companiesTreeQuery.isError,
  ]);

  const childCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first…" }];
    }
    if (!parentCompanyId.trim()) {
      return [{ value: "", label: "Select parent company first…" }];
    }
    const children = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    );
    if (children.length > 0) {
      return [{ value: "", label: "Select child company…" }, ...children];
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
    companiesTreeQuery.data,
    companiesTreeQuery.isLoading,
  ]);

  const websiteOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first…" }];
    }
    if (!parentCompanyId.trim()) {
      return [{ value: "", label: "Select parent company…" }];
    }
    if (!childCompanyId.trim()) {
      return [{ value: "", label: "Select child company…" }];
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
    canFilterByResellerId,
    childCompanyId,
    parentCompanyId,
    resellerId,
    websitesInScopeQuery.data,
    websitesInScopeQuery.isLoading,
  ]);

  const handleSave = () => {
    if (!websiteId.trim()) return;
    const payload = items
      .filter((i) => i.title.trim() && i.body.trim())
      .map((i, idx) => ({ title: i.title.trim(), body: i.body.trim(), sortOrder: idx }));
    onSave(websiteId.trim(), payload);
  };

  return (
    <FormModal
      open={open}
      title={initialWebsiteId ? "Edit canned messages" : "Add canned messages"}
      description="Choose reseller → parent → child → website, then add quick replies (title + message). Saving replaces all messages for that website."
      onClose={onClose}
      onSave={handleSave}
      primaryButtonLabel={saving ? "Saving…" : "Save"}
      primaryButtonDisabled={saving || !canEdit || !websiteId.trim()}
      maxWidth={640}
      fitContent
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
          disabled={
            !canEdit ||
            (canFilterByResellerId && !resellerId.trim()) ||
            companiesTreeQuery.isLoading
          }
          menuMaxRows={8}
        />
        {canFilterByResellerId && resellerId.trim() && companiesTreeQuery.isError ? (
          <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
            Company tree failed to load — check network or try another reseller.
          </Typography>
        ) : null}
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
          disabled={
            !canEdit ||
            websitesInScopeQuery.isLoading ||
            !childCompanyId.trim() ||
            !parentCompanyId.trim() ||
            (canFilterByResellerId && !resellerId.trim())
          }
          menuMaxRows={10}
        />
        {websiteCannedQuery.isLoading && websiteId ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading existing messages…
          </Typography>
        ) : null}

        <Typography fontWeight={600} sx={{ fontSize: 14, color: theme.app.text.primary, mt: 0.5 }}>
          Quick replies
        </Typography>

        {items.map((item, index) => (
          <Box
            key={`canned-draft-${index}`}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography fontWeight={600} sx={{ fontSize: 13 }}>
                Reply {index + 1}
              </Typography>
              {canEdit && items.length > 1 ? (
                <IconButton
                  size="small"
                  aria-label="Remove reply"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              ) : null}
            </Box>
            <InputField
              label="Title (shown in agent inbox)"
              value={item.title}
              disabled={!canEdit}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)),
                )
              }
            />
            <InputField
              label="Message"
              value={item.body}
              disabled={!canEdit}
              multiline
              minRows={2}
              sx={{ mt: 1.5 }}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((row, i) => (i === index ? { ...row, body: e.target.value } : row)),
                )
              }
            />
          </Box>
        ))}

        {canEdit ? (
          <Button
            type="button"
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setItems((prev) => [...prev, { ...emptyItem(), sortOrder: prev.length }])}
          >
            Add another reply
          </Button>
        ) : null}
      </Box>
    </FormModal>
  );
}
