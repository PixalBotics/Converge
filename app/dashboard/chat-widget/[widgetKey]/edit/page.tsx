"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { WebsiteWidgetConflictAlert } from "@/components/dashboard/chat-widget/WebsiteWidgetConflictAlert";
import { WidgetTypeSelectionCards } from "@/components/dashboard/chat-widget/WidgetTypeSelectionCards";
import type { JsonRecord } from "@/api/types/common.types";
import { getWidgetSnapshot, widgetResponseData } from "@/api/widgets/widgets.api";
import {
  apiWidgetTypeToDraftKind,
  patchRemoteWidgetConfiguration,
  resolveWizardKindFromDraft,
} from "@/lib/chat-widget/widget-remote-sync";
import {
  clearWizardEditHydration,
  markEditWizardHydrated,
  readChatWizardDraft,
  replaceEditWizardDraftFromApi,
  saveChatWizardDraft,
} from "@/lib/chat-widget/chat-wizard-edit";
import { loadInquiryTopicsFromScheduling } from "@/lib/chat-widget/hydrate-widget-inquiry-from-scheduling";
import { mapWidgetSnapshotToWidgetDraft } from "@/lib/chat-widget/map-widget-snapshot-to-draft";
import {
  findConflictingWebsiteWidgets,
  wizardEntryPathForKind,
} from "@/lib/chat-widget/widget-type-conflicts";
import { useWebsiteWidgetsQuery } from "@/lib/chat-widget/use-website-widgets-query";
import type { WidgetDraft, WidgetKind } from "@/lib/chat-widget/widgetDraft";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";

export default function WidgetEditTypePage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const raw = params?.widgetKey;
  const widgetKey = decodeURIComponent(
    Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""),
  ).trim();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [websiteLabel, setWebsiteLabel] = useState("—");
  const [websiteId, setWebsiteId] = useState("");
  const [selectedType, setSelectedType] = useState<WidgetKind>("chat");
  const selectedTypeRef = useRef<WidgetKind>("chat");
  const [saving, setSaving] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  useEffect(() => {
    if (!widgetKey) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void (async () => {
      try {
        clearWizardEditHydration(widgetKey);
        const res = await getWidgetSnapshot(widgetKey);
        if (cancelled) return;
        const data = widgetResponseData<JsonRecord>(res);
        const mapped = mapWidgetSnapshotToWidgetDraft(data, widgetKey);
        const wid =
          mapped.websiteId?.trim() ||
          (typeof data.websiteId === "string" ? data.websiteId : "") ||
          "";
        const wt = apiWidgetTypeToDraftKind(
          data.widgetType ?? data.widget_type ?? mapped.type,
        );
        const draftPatch: Partial<WidgetDraft> = {
          ...mapped,
          type: wt,
          websiteId: wid,
          remoteWidgetKey: widgetKey,
          widgetId: widgetKey,
        };
        if (wid) {
          const fromScheduling = await loadInquiryTopicsFromScheduling(wid);
          if (fromScheduling.length > 0) {
            draftPatch.inquiryOptions = fromScheduling;
            draftPatch.inquiryOn = true;
          }
        }
        replaceEditWizardDraftFromApi(widgetKey, draftPatch);
        markEditWizardHydrated(widgetKey);
        const website = data.website as JsonRecord | undefined;
        const label =
          website?.name ??
          website?.hostname ??
          website?.url ??
          (wid ? wid : "—");
        setWebsiteLabel(String(label));
        setWebsiteId(wid);
        setSelectedType(wt);
        selectedTypeRef.current = wt;
      } catch (e) {
        if (!cancelled) {
          setLoadError(extractApiErrorMessageForToast(e) ?? "Failed to load widget.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [widgetKey]);

  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);

  const siteWidgetsQuery = useWebsiteWidgetsQuery(websiteId, !loading && Boolean(websiteId));
  const conflicts = useMemo(
    () =>
      findConflictingWebsiteWidgets(
        siteWidgetsQuery.data ?? [],
        selectedType,
        widgetKey,
      ),
    [siteWidgetsQuery.data, selectedType, widgetKey],
  );

  const continueToWizard = () => {
    if (!widgetKey || saving) return;
    void (async () => {
      const kind = selectedTypeRef.current;
      const prev = readChatWizardDraft(widgetKey);
      const typeChanged = prev.type !== kind;
      setSaving(true);
      try {
        saveChatWizardDraft(widgetKey, { ...prev, type: kind, completed: false });
        if (typeChanged) {
          const latest = readChatWizardDraft(widgetKey);
          await patchRemoteWidgetConfiguration({
            widgetKey,
            widgetKind: resolveWizardKindFromDraft(latest),
            draft: latest,
            publishNow: false,
          });
          publishAppToast({
            variant: "success",
            message: "Widget type updated. Continue configuration in the wizard.",
          });
        }
        router.push(wizardEntryPathForKind(kind, widgetKey));
      } catch (e) {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(e) ?? "Could not save widget type.",
        });
      } finally {
        setSaving(false);
        setConflictDialogOpen(false);
      }
    })();
  };

  const handleNext = () => {
    if (conflicts.length > 0) {
      setConflictDialogOpen(true);
      return;
    }
    continueToWizard();
  };

  return (
    <WidgetFlowShell
      pageTitle="Edit widget — choose type"
      subtitle={
        loading
          ? "Loading widget…"
          : "Confirm Chat, Text Us, or both — then continue to the design wizard."
      }
      cardTitle="Widget type"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={loading || Boolean(loadError) || saving}
            onClick={handleNext}
          >
            {saving ? "Saving…" : "Continue to wizard"}
          </Button>
        </>
      }
    >
      {loadError ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 2 }}>
          {loadError}
        </Typography>
      ) : null}

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
          Website (fixed for this widget)
        </Typography>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
          {websiteLabel}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Widget key: {widgetKey || "—"}
        </Typography>
      </Box>

      <WebsiteWidgetConflictAlert
        conflicts={conflicts}
        selectedKind={selectedType}
        mode="edit"
      />

      <Box sx={{ mt: 2 }}>
        <WidgetTypeSelectionCards
          selectedType={selectedType}
          onSelect={setSelectedType}
          disabled={loading}
        />
      </Box>

      <Dialog open={conflictDialogOpen} onClose={() => !saving && setConflictDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Another widget already covers this site</DialogTitle>
        <DialogContent>
          <WebsiteWidgetConflictAlert
            conflicts={conflicts}
            selectedKind={selectedType}
            mode="edit"
          />
          <Typography variant="body2" sx={{ mt: 2, color: theme.app.dashboard.textMuted }}>
            You can go back and edit the existing widget instead, or continue if you intentionally
            want multiple embeds.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="secondary" onClick={() => setConflictDialogOpen(false)} disabled={saving}>
            Go back
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={continueToWizard} disabled={saving}>
            Continue anyway
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetFlowShell>
  );
}
