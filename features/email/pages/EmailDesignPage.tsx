"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { DashboardCard, Typography, Button } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import type { EmailTemplateBlock, EmailTemplateBlockKey } from "@/api/types/email.types";
import {
  emailCard,
  emailCardFooter,
  gradientPrimaryButtonSx,
} from "../styles/email-page.styles";
import { EmailSectionLayout } from "../components/EmailSectionLayout";
import { EmailTemplateEditor } from "../components/EmailTemplateEditor";
import { EmailPreviewFrame } from "../components/EmailPreviewFrame";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";
import { EmailResellerScopeGate } from "../components/EmailResellerScopeGate";
import {
  useDeleteEmailLogoMutation,
  useEmailTemplateDraftPreviewQuery,
  useEmailTemplateDraftQuery,
  useEmailTemplatePublishedPreviewQuery,
  useEmailTemplatePublishedQuery,
  usePublishEmailTemplateMutation,
  useUpdateEmailTemplateDraftMutation,
  useUploadEmailLogoMutation,
} from "../hooks/useEmailTemplate";
import { DEFAULT_TEMPLATE_BLOCKS } from "../email.constants";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";

function defaultBlocks(): EmailTemplateBlock[] {
  return DEFAULT_TEMPLATE_BLOCKS.map((blockKey, index) => ({
    blockKey,
    enabled: true,
    sortOrder: index,
  }));
}

export function EmailDesignPage() {
  const { hasOperational } = useAuth();
  const canUpdate = hasOperational(OP.emailTemplate.update);
  const canPublish = hasOperational(OP.emailTemplate.publish);
  const { resellerId, ready } = useEmailResellerScope();
  const activeResellerId = ready ? resellerId : null;

  const draftQuery = useEmailTemplateDraftQuery(activeResellerId, { enabled: Boolean(activeResellerId) });
  const publishedQuery = useEmailTemplatePublishedQuery(activeResellerId, { enabled: Boolean(activeResellerId) });
  const [previewMode, setPreviewMode] = useState<"draft" | "published">("draft");
  const draftPreviewQuery = useEmailTemplateDraftPreviewQuery(activeResellerId, {
    enabled: Boolean(activeResellerId) && previewMode === "draft",
  });
  const publishedPreviewQuery = useEmailTemplatePublishedPreviewQuery(activeResellerId, {
    enabled: Boolean(activeResellerId) && previewMode === "published",
  });
  const previewQuery = previewMode === "draft" ? draftPreviewQuery : publishedPreviewQuery;
  const updateMutation = useUpdateEmailTemplateDraftMutation(activeResellerId ?? "");
  const publishMutation = usePublishEmailTemplateMutation(activeResellerId ?? "");
  const uploadLogoMutation = useUploadEmailLogoMutation(activeResellerId ?? "");
  const deleteLogoMutation = useDeleteEmailLogoMutation(activeResellerId ?? "");

  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [blocks, setBlocks] = useState<EmailTemplateBlock[]>(defaultBlocks);
  const [dirty, setDirty] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  useEffect(() => {
    const d = draftQuery.data;
    if (!d) return;
    setName(d.name ?? "");
    setPrimaryColor(d.primaryColor ?? "#2563eb");
    setBlocks(d.blocks?.length ? d.blocks : defaultBlocks());
    setDirty(false);
  }, [draftQuery.data]);

  useUnsavedChangesGuard(dirty);
  const markDirty = useCallback(() => setDirty(true), []);

  const handleSave = async () => {
    if (!activeResellerId || !canUpdate) return;
    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        primaryColor: primaryColor.trim() || undefined,
        blocks,
      });
      setDirty(false);
      publishAppToast({ variant: "success", message: "Draft saved." });
      void draftPreviewQuery.refetch();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Request failed.",
      });
    }
  };

  const handlePublish = async () => {
    if (!activeResellerId || !canPublish) return;
    if (!window.confirm("Publish this template? Live emails will use the published version.")) return;
    try {
      if (dirty && canUpdate) {
        await updateMutation.mutateAsync({
          name: name.trim(),
          primaryColor: primaryColor.trim() || undefined,
          blocks,
        });
        setDirty(false);
      }
      await publishMutation.mutateAsync();
      publishAppToast({ variant: "success", message: "Template published." });
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Request failed.",
      });
    }
  };

  const reorderBlock = (blockKey: EmailTemplateBlockKey, direction: "up" | "down") => {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((b) => b.blockKey === blockKey);
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= sorted.length) return prev;
      const a = sorted[idx];
      const b = sorted[swapWith];
      const aOrder = a.sortOrder;
      a.sortOrder = b.sortOrder;
      b.sortOrder = aOrder;
      return [...sorted];
    });
    markDirty();
  };

  const previewHtml = previewQuery.data?.html ?? "";

  return (
    <EmailSectionLayout
      title="Email design"
      description="Edit blocks and branding; preview uses sample data."
    >
      <EmailResellerScopeGate>
      <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1, mb: 1.5 }}>
        <Button
          type="button"
          variant={mobileTab === "editor" ? "primary" : "secondary"}
          onClick={() => setMobileTab("editor")}
        >
          Editor
        </Button>
        <Button
          type="button"
          variant={mobileTab === "preview" ? "primary" : "secondary"}
          onClick={() => setMobileTab("preview")}
        >
          Preview
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <DashboardCard
          sx={{
            ...emailCard,
            display: { xs: mobileTab === "editor" ? "block" : "none", md: "block" },
          }}
        >
          {draftQuery.isLoading ? (
            <Skeleton variant="rounded" height={280} />
          ) : (
            <EmailTemplateEditor
              name={name}
              primaryColor={primaryColor}
              blocks={blocks}
              logoUrl={draftQuery.data?.logoUrl}
              onNameChange={(v) => {
                setName(v);
                markDirty();
              }}
              onPrimaryColorChange={(v) => {
                setPrimaryColor(v);
                markDirty();
              }}
              onToggleBlock={(key, enabled) => {
                setBlocks((prev) => prev.map((b) => (b.blockKey === key ? { ...b, enabled } : b)));
                markDirty();
              }}
              onReorderBlock={reorderBlock}
              onUploadLogo={(file) => void uploadLogoMutation.mutateAsync(file)}
              onRemoveLogo={() => void deleteLogoMutation.mutateAsync()}
              logoUploading={uploadLogoMutation.isPending || deleteLogoMutation.isPending}
              disabled={!canUpdate}
            />
          )}
          <Box sx={emailCardFooter}>
            {canUpdate ? (
              <Button type="button" variant="secondary" onClick={handleSave} disabled={updateMutation.isPending}>
                Save draft
              </Button>
            ) : null}
            {canPublish ? (
              <Button
                type="button"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                onClick={handlePublish}
                disabled={publishMutation.isPending}
              >
                Publish
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => void previewQuery.refetch()}>
              Refresh preview
            </Button>
          </Box>
        </DashboardCard>

        <DashboardCard
          sx={{
            ...emailCard,
            display: { xs: mobileTab === "preview" ? "block" : "none", md: "block" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Typography variant="medium" fontWeight={600}>
              Preview
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75 }}>
              <Button
                type="button"
                variant={previewMode === "draft" ? "primary" : "secondary"}
                onClick={() => setPreviewMode("draft")}
              >
                Draft
              </Button>
              <Button
                type="button"
                variant={previewMode === "published" ? "primary" : "secondary"}
                onClick={() => setPreviewMode("published")}
                disabled={!publishedQuery.data?.publishedAt}
              >
                Published
              </Button>
            </Box>
          </Box>
          <Typography variant="small" sx={{ color: "rgba(255,255,255,0.55)", mb: 1.5 }}>
            {previewMode === "draft" ? "Draft preview with sample data" : "Live published template"}
            {publishedQuery.data?.publishedAt
              ? ` · Published ${new Date(publishedQuery.data.publishedAt).toLocaleString()}`
              : ""}
          </Typography>
          {previewQuery.isLoading ? (
            <Skeleton variant="rounded" height={360} />
          ) : previewHtml ? (
            <EmailPreviewFrame html={previewHtml} />
          ) : (
            <Typography variant="small">Save draft to generate a preview.</Typography>
          )}
        </DashboardCard>
      </Box>
      </EmailResellerScopeGate>
    </EmailSectionLayout>
  );
}
