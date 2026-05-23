"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ThumbDownAltOutlined from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlined from "@mui/icons-material/ThumbUpAltOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import type { PlatformAgentFeedbackSettingsBody } from "@/api/types/email.types";
import { EmailSectionLayout } from "../components/EmailSectionLayout";
import { EmailBuilderInputField } from "../components/email-builder/EmailBuilderFormField";
import { EmailBuilderSettingsGroup } from "../styles/email-design.styled";
import {
  usePlatformAgentFeedbackQuery,
  useUpdatePlatformAgentFeedbackMutation,
} from "../hooks/usePlatformAgentFeedback";

function BuilderGroupHeading({ children }: { children: React.ReactNode }) {
  const theme = useTheme() as AppTheme;
  return (
    <Typography
      variant="small"
      fontWeight={700}
      sx={{
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        color: theme.app.dashboard.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontSize: 11,
      }}
    >
      {children}
    </Typography>
  );
}

export function EmailAgentFeedbackPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.agentFeedback.view);
  const canUpdate = hasOperational(OP.agentFeedback.update);

  const query = usePlatformAgentFeedbackQuery({ enabled: canView });
  const updateMutation = useUpdatePlatformAgentFeedbackMutation();

  const [form, setForm] = useState<PlatformAgentFeedbackSettingsBody>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!query.data) return;
    setForm({
      ratingEnabled: query.data.ratingEnabled,
      goodLabel: query.data.goodLabel,
      poorLabel: query.data.poorLabel,
      ratingRequired: query.data.ratingRequired,
      notesEnabled: query.data.notesEnabled,
      notesPlaceholder: query.data.notesPlaceholder,
      notesSubmitLabel: query.data.notesSubmitLabel,
      notesRequired: query.data.notesRequired,
    });
    setDirty(false);
  }, [query.data]);

  const patch = useCallback((partial: PlatformAgentFeedbackSettingsBody) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  const preview = useMemo(
    () => ({
      ratingEnabled: form.ratingEnabled ?? true,
      goodLabel: form.goodLabel?.trim() || "Good",
      poorLabel: form.poorLabel?.trim() || "Poor",
      ratingRequired: form.ratingRequired ?? false,
      notesEnabled: form.notesEnabled ?? true,
      notesPlaceholder:
        form.notesPlaceholder?.trim() ||
        "Add wrap-up notes for the next agent or supervisor…",
      notesSubmitLabel: form.notesSubmitLabel?.trim() || "Submit note",
      notesRequired: form.notesRequired ?? false,
    }),
    [form],
  );

  const handleSave = async () => {
    if (!canUpdate) return;
    try {
      await updateMutation.mutateAsync(form);
      setDirty(false);
      publishAppToast({ variant: "success", message: "Feedback settings saved." });
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Request failed.",
      });
    }
  };

  if (!canView) {
    return (
      <EmailSectionLayout
        title="Feedback"
        description="Platform wrap-up form for agents (inquire rating and additional notes)."
      >
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          You do not have permission to view feedback settings.
        </Typography>
      </EmailSectionLayout>
    );
  }

  return (
    <EmailSectionLayout
      title="Feedback"
      description="Configure the agent wrap-up form shown in chat transcript emails — inquire (like / dislike) and additional notes."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <EmailBuilderSettingsGroup>
            <BuilderGroupHeading>Inquire (like / dislike)</BuilderGroupHeading>
            <FormControlLabel
              control={
                <Switch
                  checked={preview.ratingEnabled}
                  onChange={(e) => patch({ ratingEnabled: e.target.checked })}
                  disabled={!canUpdate || query.isLoading}
                />
              }
              label="Show rating buttons in email"
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
              <EmailBuilderInputField
                label="Good label"
                name="goodLabel"
                value={preview.goodLabel}
                onChange={(e) => patch({ goodLabel: e.target.value })}
                disabled={!canUpdate || !preview.ratingEnabled}
              />
              <EmailBuilderInputField
                label="Poor label"
                name="poorLabel"
                value={preview.poorLabel}
                onChange={(e) => patch({ poorLabel: e.target.value })}
                disabled={!canUpdate || !preview.ratingEnabled}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={preview.ratingRequired}
                  onChange={(e) => patch({ ratingRequired: e.target.checked })}
                  disabled={!canUpdate || !preview.ratingEnabled}
                />
              }
              label="Rating required before wrap-up"
            />
          </EmailBuilderSettingsGroup>

          <EmailBuilderSettingsGroup>
            <BuilderGroupHeading>Additional note</BuilderGroupHeading>
            <FormControlLabel
              control={
                <Switch
                  checked={preview.notesEnabled}
                  onChange={(e) => patch({ notesEnabled: e.target.checked })}
                  disabled={!canUpdate || query.isLoading}
                />
              }
              label="Show notes field in email"
            />
            <EmailBuilderInputField
              label="Placeholder text"
              name="notesPlaceholder"
              value={preview.notesPlaceholder}
              onChange={(e) => patch({ notesPlaceholder: e.target.value })}
              disabled={!canUpdate || !preview.notesEnabled}
              multiline
              minRows={2}
            />
            <EmailBuilderInputField
              label="Submit button label"
              name="notesSubmitLabel"
              value={preview.notesSubmitLabel}
              onChange={(e) => patch({ notesSubmitLabel: e.target.value })}
              disabled={!canUpdate || !preview.notesEnabled}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preview.notesRequired}
                  onChange={(e) => patch({ notesRequired: e.target.checked })}
                  disabled={!canUpdate || !preview.notesEnabled}
                />
              }
              label="Note required before wrap-up"
            />
          </EmailBuilderSettingsGroup>

          {canUpdate ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleSave()}
                disabled={!dirty || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving…" : "Save settings"}
              </Button>
            </Box>
          ) : null}
        </Box>

        <EmailBuilderSettingsGroup sx={{ position: { lg: "sticky" }, top: 16 }}>
          <BuilderGroupHeading>Preview</BuilderGroupHeading>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, display: "block" }}>
            How agents will see these controls in transcript emails.
          </Typography>

          {preview.ratingEnabled ? (
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 1.5,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: alpha(theme.palette.common.black, 0.12),
                textAlign: "center",
              }}
            >
              <Typography variant="small" fontWeight={700} sx={{ mb: 1.5 }}>
                Inquire
                {preview.ratingRequired ? (
                  <Box component="span" sx={{ color: theme.palette.error.light, ml: 0.5 }}>
                    *
                  </Box>
                ) : null}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    component="button"
                    type="button"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "2px solid #22c55e",
                      bgcolor: "#dcfce7",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ThumbUpAltOutlined sx={{ color: "#16a34a" }} />
                  </Box>
                  <Typography variant="caption" sx={{ display: "block", mt: 0.75 }}>
                    {preview.goodLabel}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    component="button"
                    type="button"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "2px solid #ef4444",
                      bgcolor: "#fee2e2",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ThumbDownAltOutlined sx={{ color: "#dc2626" }} />
                  </Box>
                  <Typography variant="caption" sx={{ display: "block", mt: 0.75 }}>
                    {preview.poorLabel}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : null}

          {preview.notesEnabled ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: alpha(theme.palette.common.black, 0.12),
              }}
            >
              <Typography variant="small" fontWeight={700} sx={{ mb: 1 }}>
                Additional note
                {preview.notesRequired ? (
                  <Box component="span" sx={{ color: theme.palette.error.light, ml: 0.5 }}>
                    *
                  </Box>
                ) : null}
              </Typography>
              <Box
                component="textarea"
                readOnly
                placeholder={preview.notesPlaceholder}
                sx={{
                  width: "100%",
                  minHeight: 72,
                  p: 1.25,
                  borderRadius: 1,
                  border: `1px solid ${theme.app.dashboard.cardBorder}`,
                  bgcolor: theme.app.dashboard.overlayLight,
                  fontFamily: "inherit",
                  fontSize: 13,
                  resize: "vertical",
                  mb: 1.25,
                }}
              />
              <Button type="button" variant="primary" size="small">
                {preview.notesSubmitLabel}
              </Button>
            </Box>
          ) : null}

          {!preview.ratingEnabled && !preview.notesEnabled ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Enable inquire or additional note to show a preview.
            </Typography>
          ) : null}
        </EmailBuilderSettingsGroup>
      </Box>
    </EmailSectionLayout>
  );
}
