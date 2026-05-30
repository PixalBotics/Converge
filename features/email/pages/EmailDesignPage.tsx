"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { useEmailTemplateAccess } from "../hooks/useEmailTemplateAccess";
import type { EmailTemplateBlock, EmailTemplateBlockKey } from "@/api/types/email.types";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailSectionLayout } from "../components/EmailSectionLayout";
import { EmailVisualBuilder } from "../components/email-builder/EmailVisualBuilder";
import { EmailDesignBuilderShell } from "../components/EmailDesignBuilderShell";
import { EmailDesignStudio } from "../components/EmailDesignStudio";
import { EmailFullscreenPreview } from "../components/EmailFullscreenPreview";
import { EmailTemplateVersionsDrawer } from "../components/EmailTemplateVersionsDrawer";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";
import { EmailResellerScopeGate } from "../components/EmailResellerScopeGate";
import {
  useDeleteEmailBannerMutation,
  useDeleteEmailLogoMutation,
  useDeletePlatformEmailBannerMutation,
  useDeletePlatformEmailLogoMutation,
  useEmailTemplateAssignmentQuery,
  useEmailTemplateDraftQuery,
  useEmailTemplatePublishedQuery,
  usePlatformEmailTemplateDraftQuery,
  usePlatformEmailTemplatePublishedQuery,
  usePlatformEmailTemplateVersionsQuery,
  usePublishEmailTemplateMutation,
  usePublishPlatformEmailTemplateMutation,
  useResellerEmailTemplateVersionsQuery,
  useRestorePlatformEmailTemplateVersionMutation,
  useRestoreResellerEmailTemplateVersionMutation,
  useUpdateEmailTemplateDraftMutation,
  useUpdatePlatformEmailTemplateDraftMutation,
  useUploadEmailBannerMutation,
  useUploadEmailLogoMutation,
  useUploadPlatformEmailBannerMutation,
  useUploadPlatformEmailLogoMutation,
  useUsePlatformEmailTemplateMutation,
} from "../hooks/useEmailTemplate";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { mergeTemplateBlocks, defaultStyleForBlock } from "../utils/email-block-style";
import { buildClientEmailPreviewHtml } from "../utils/build-email-preview-html";
import { DEFAULT_EMAIL_THEME, normalizeEmailTheme, type EmailTemplateTheme } from "../utils/email-theme";

function normalizeBlocksFromApi(
  blocks: EmailTemplateBlock[] | undefined,
): EmailTemplateBlock[] {
  return mergeTemplateBlocks(blocks).map((b) => ({
    ...b,
    styleJson: b.styleJson ?? defaultStyleForBlock(b.blockKey),
  }));
}

export function EmailDesignPage({ mode = "reseller" }: { mode?: "reseller" | "platform" }) {
  const theme = useTheme() as AppTheme;
  const { canView } = useEmailTemplateAccess();

  if (!canView) {
    return (
      <EmailSectionLayout title="Email design" description="Transcript email templates.">
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          You do not have permission to view email design.
        </Typography>
      </EmailSectionLayout>
    );
  }

  return <EmailDesignEditor mode={mode} />;
}

function EmailDesignEditor({ mode = "reseller" }: { mode?: "reseller" | "platform" }) {
  const isPlatform = mode === "platform";
  const theme = useTheme() as AppTheme;
  const isWide = useMediaQuery(theme.breakpoints.up("md"));
  const router = useRouter();
  const params = useParams();
  const routeResellerId =
    typeof params.resellerId === "string" ? params.resellerId.trim() : "";
  const { canView, canUpdate, canPublish } = useEmailTemplateAccess();
  const { resellerId: scopeResellerId, ready } = useEmailResellerScope();

  const activeResellerId = isPlatform ? null : routeResellerId || (ready ? scopeResellerId : null);

  const resellerDraftQuery = useEmailTemplateDraftQuery(activeResellerId, {
    enabled: canView && !isPlatform && Boolean(activeResellerId),
  });
  const platformDraftQuery = usePlatformEmailTemplateDraftQuery({
    enabled: canView && isPlatform,
  });
  const draftQuery = isPlatform ? platformDraftQuery : resellerDraftQuery;

  const resellerPublishedQuery = useEmailTemplatePublishedQuery(activeResellerId, {
    enabled: canView && !isPlatform && Boolean(activeResellerId),
  });
  const platformPublishedQuery = usePlatformEmailTemplatePublishedQuery({
    enabled: canView && isPlatform,
  });
  const publishedQuery = isPlatform ? platformPublishedQuery : resellerPublishedQuery;

  const assignmentQuery = useEmailTemplateAssignmentQuery(activeResellerId, {
    enabled: !isPlatform && Boolean(activeResellerId),
  });
  const usePlatformMutation = useUsePlatformEmailTemplateMutation(activeResellerId ?? "");

  const resellerUpdateMutation = useUpdateEmailTemplateDraftMutation(activeResellerId ?? "");
  const platformUpdateMutation = useUpdatePlatformEmailTemplateDraftMutation();
  const updateMutation = isPlatform ? platformUpdateMutation : resellerUpdateMutation;

  const resellerPublishMutation = usePublishEmailTemplateMutation(activeResellerId ?? "");
  const platformPublishMutation = usePublishPlatformEmailTemplateMutation();
  const publishMutation = isPlatform ? platformPublishMutation : resellerPublishMutation;

  const resellerUploadLogo = useUploadEmailLogoMutation(activeResellerId ?? "");
  const platformUploadLogo = useUploadPlatformEmailLogoMutation();
  const uploadLogoMutation = isPlatform ? platformUploadLogo : resellerUploadLogo;

  const resellerDeleteLogo = useDeleteEmailLogoMutation(activeResellerId ?? "");
  const platformDeleteLogo = useDeletePlatformEmailLogoMutation();
  const deleteLogoMutation = isPlatform ? platformDeleteLogo : resellerDeleteLogo;

  const resellerUploadBanner = useUploadEmailBannerMutation(activeResellerId ?? "");
  const platformUploadBanner = useUploadPlatformEmailBannerMutation();
  const uploadBannerMutation = isPlatform ? platformUploadBanner : resellerUploadBanner;

  const resellerDeleteBanner = useDeleteEmailBannerMutation(activeResellerId ?? "");
  const platformDeleteBanner = useDeletePlatformEmailBannerMutation();
  const deleteBannerMutation = isPlatform ? platformDeleteBanner : resellerDeleteBanner;

  const platformVersionsQuery = usePlatformEmailTemplateVersionsQuery({
    enabled: isPlatform && canUpdate,
  });
  const resellerVersionsQuery = useResellerEmailTemplateVersionsQuery(activeResellerId, {
    enabled: !isPlatform && Boolean(activeResellerId) && canUpdate,
  });
  const versionsQuery = isPlatform ? platformVersionsQuery : resellerVersionsQuery;

  const restorePlatformMutation = useRestorePlatformEmailTemplateVersionMutation();
  const restoreResellerMutation = useRestoreResellerEmailTemplateVersionMutation(
    activeResellerId ?? "",
  );
  const restoreMutation = isPlatform ? restorePlatformMutation : restoreResellerMutation;

  const [name, setName] = useState("Chat transcript email");
  const [primaryColor, setPrimaryColor] = useState("#1a57a5");
  const [emailTheme, setEmailTheme] = useState<EmailTemplateTheme>(DEFAULT_EMAIL_THEME);
  const [blocks, setBlocks] = useState<EmailTemplateBlock[]>(() => mergeTemplateBlocks(undefined));
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(isWide);

  useEffect(() => {
    setToolsOpen(isWide);
  }, [isWide]);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  useEffect(() => {
    const d = draftQuery.data;
    const effective = publishedQuery.data;
    const source = isPlatform
      ? d ?? effective
      : d ?? (assignmentQuery.data?.usesPlatformDefault ? effective : null);
    if (!source) return;
    setName(source.name ?? "Chat transcript email");
    setPrimaryColor(source.primaryColor ?? "#1a57a5");
    setEmailTheme(normalizeEmailTheme(source.themeJson));
    setBlocks(normalizeBlocksFromApi(source.blocks));
    setLogoUrl(source.logoUrl ?? null);
    setBannerUrl(source.bannerUrl ?? null);
    setDirty(false);
  }, [draftQuery.data, publishedQuery.data, assignmentQuery.data?.usesPlatformDefault, isPlatform]);

  useUnsavedChangesGuard(dirty);
  const markDirty = useCallback(() => setDirty(true), []);

  const previewHtml = useMemo(
    () =>
      buildClientEmailPreviewHtml({
        primaryColor,
        theme: emailTheme,
        logoUrl,
        bannerUrl,
        blocks,
        feedback: {
          ratingEnabled: true,
          goodLabel: "Good",
          poorLabel: "Poor",
          notesEnabled: false,
          notesPlaceholder: "",
          notesSubmitLabel: "Submit note",
        },
      }),
    [primaryColor, emailTheme, logoUrl, bannerUrl, blocks],
  );

  const handleSave = async () => {
    if (!canUpdate) return;
    if (!isPlatform && !activeResellerId) return;
    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        primaryColor: primaryColor.trim() || undefined,
        themeJson: emailTheme,
        blocks,
      });
      setDirty(false);
      publishAppToast({ variant: "success", message: "Draft saved." });
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Request failed.",
      });
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    if (!isPlatform && !activeResellerId) return;
    if (!window.confirm("Publish this template? Live emails will use the published version.")) return;
    try {
      if (dirty && canUpdate) {
        await updateMutation.mutateAsync({
          name: name.trim(),
          primaryColor: primaryColor.trim() || undefined,
          themeJson: emailTheme,
          blocks,
        });
        setDirty(false);
      }
      await publishMutation.mutateAsync();
      publishAppToast({ variant: "success", message: "Template published." });
      void versionsQuery.refetch();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Request failed.",
      });
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    setRestoringVersionId(versionId);
    try {
      await restoreMutation.mutateAsync(versionId);
      await draftQuery.refetch();
      setDirty(false);
    } finally {
      setRestoringVersionId(null);
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

  const usesPlatformDefault = !isPlatform && (assignmentQuery.data?.usesPlatformDefault ?? true);
  const editingPlatformDefault = !isPlatform && usesPlatformDefault && !draftQuery.data;

  const backHref = isPlatform ? EMAIL_ROUTES.designPlatform : EMAIL_ROUTES.designReseller;
  const backLabel = isPlatform ? "Platform designs" : "Reseller designs";

  const statusChip =
    !isPlatform && assignmentQuery.data ? (
      <Chip
        size="small"
        color={usesPlatformDefault ? "info" : "success"}
        variant="outlined"
        label={
          usesPlatformDefault ? "Platform default (live)" : "Custom template (live)"
        }
      />
    ) : isPlatform && publishedQuery.data?.publishedAt ? (
      <Chip size="small" color="success" variant="outlined" label="Published live" />
    ) : null;

  const isDirectEditor = !isPlatform && Boolean(routeResellerId);

  const publishedLabel = publishedQuery.data?.publishedAt
    ? `Last published ${new Date(publishedQuery.data.publishedAt).toLocaleString()}`
    : null;

  const builderContent = (
    <EmailDesignBuilderShell
      backLabel={backLabel}
      onBack={() => router.push(backHref)}
      title={isPlatform ? "Platform email builder" : "Reseller email builder"}
      subtitle={
        isPlatform
          ? "Edit the default transcript email. Save draft, then publish."
          : "Customize transcript email for this reseller."
      }
      statusChip={statusChip}
      dirty={dirty}
      saving={updateMutation.isPending}
      publishing={publishMutation.isPending}
      canSave={canUpdate}
      canPublish={canPublish}
      onSave={() => void handleSave()}
      onPublish={() => void handlePublish()}
      onVersions={() => {
        void versionsQuery.refetch();
        setVersionsOpen(true);
      }}
      onFullscreenPreview={() => setFullscreenPreview(true)}
      toolsOpen={toolsOpen}
      onToggleTools={() => setToolsOpen((v) => !v)}
    >
      {!isPlatform && assignmentQuery.data ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          {!usesPlatformDefault && canUpdate ? (
            <Button
              type="button"
              variant="secondary"
              disabled={usePlatformMutation.isPending}
              onClick={() => {
                if (
                  !window.confirm(
                    "Switch back to the platform default template? Your custom published design stays saved but will not be used for live emails.",
                  )
                ) {
                  return;
                }
                void usePlatformMutation.mutateAsync().then(() => {
                  publishAppToast({
                    variant: "success",
                    message: "Now using the platform email template.",
                  });
                  void draftQuery.refetch();
                  void publishedQuery.refetch();
                });
              }}
            >
              Use platform template
            </Button>
          ) : null}
          {editingPlatformDefault ? (
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
              Save a draft to customize — publish to replace the platform default for live emails.
            </Typography>
          ) : null}
        </Box>
      ) : null}

      <EmailDesignStudio
        toolsOpen={toolsOpen}
        onToggleTools={() => setToolsOpen((v) => !v)}
        loading={draftQuery.isLoading}
        previewHtml={previewHtml}
        device={device}
        onDeviceChange={setDevice}
        onFullscreenPreview={() => setFullscreenPreview(true)}
        publishedLabel={publishedLabel}
      >
        <EmailVisualBuilder
          name={name}
          primaryColor={primaryColor}
          theme={emailTheme}
          blocks={blocks}
          logoUrl={logoUrl}
          bannerUrl={bannerUrl}
          onNameChange={(v) => {
            setName(v);
            markDirty();
          }}
          onPrimaryColorChange={(v) => {
            setPrimaryColor(v);
            markDirty();
          }}
          onThemeChange={(t) => {
            setEmailTheme(t);
            markDirty();
          }}
          onBlocksChange={(next) => {
            setBlocks(next);
            markDirty();
          }}
          onToggleBlock={(key, enabled) => {
            setBlocks((prev) =>
              prev.map((b) => (b.blockKey === key ? { ...b, enabled } : b)),
            );
            markDirty();
          }}
          onReorderBlock={reorderBlock}
          onUploadLogo={(file) => {
            void uploadLogoMutation.mutateAsync(file).then((r) => {
              setLogoUrl(r.logoUrl);
              markDirty();
            });
          }}
          onRemoveLogo={() => {
            void deleteLogoMutation.mutateAsync().then(() => {
              setLogoUrl(null);
              markDirty();
            });
          }}
          onUploadBanner={(file) => {
            void uploadBannerMutation.mutateAsync(file).then((r) => {
              setBannerUrl(r.bannerUrl);
              markDirty();
            });
          }}
          onRemoveBanner={() => {
            void deleteBannerMutation.mutateAsync().then(() => {
              setBannerUrl(null);
              markDirty();
            });
          }}
          logoUploading={uploadLogoMutation.isPending || deleteLogoMutation.isPending}
          bannerUploading={uploadBannerMutation.isPending || deleteBannerMutation.isPending}
          disabled={!canUpdate}
        />
      </EmailDesignStudio>
    </EmailDesignBuilderShell>
  );

  const overlays = (
    <>
      <EmailTemplateVersionsDrawer
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        title="Version history"
        versions={versionsQuery.data ?? []}
        loading={versionsQuery.isLoading}
        restoringId={restoringVersionId}
        canRestore={canUpdate}
        onRestore={handleRestoreVersion}
      />

      <EmailFullscreenPreview
        open={fullscreenPreview}
        onClose={() => setFullscreenPreview(false)}
        html={previewHtml}
        device={device}
        onDeviceChange={setDevice}
        publishedLabel={publishedLabel}
      />
    </>
  );

  if (isPlatform) {
    return (
      <>
        {builderContent}
        {overlays}
      </>
    );
  }

  if (isDirectEditor) {
    return (
      <>
        {builderContent}
        {overlays}
      </>
    );
  }

  return (
    <EmailSectionLayout
      title="Reseller email design"
      description="Customize the transcript email for this reseller. Publish to switch from the platform default."
    >
      <EmailResellerScopeGate>
        {builderContent}
        {overlays}
      </EmailResellerScopeGate>
    </EmailSectionLayout>
  );
}
