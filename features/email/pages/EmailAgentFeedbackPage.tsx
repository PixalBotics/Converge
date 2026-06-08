"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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
  useDistributionFeedbackSubmissionsQuery,
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

function parseReasonOptionsText(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatReasonOptions(options: string[] | undefined): string {
  return (options ?? []).join("\n");
}

export function EmailAgentFeedbackPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.agentFeedback.view);
  const canUpdate = hasOperational(OP.agentFeedback.update);

  const query = usePlatformAgentFeedbackQuery({ enabled: canView });
  const updateMutation = useUpdatePlatformAgentFeedbackMutation();
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const submissionsQuery = useDistributionFeedbackSubmissionsQuery(
    submissionsPage,
    20,
    { enabled: canView },
  );

  const [form, setForm] = useState<PlatformAgentFeedbackSettingsBody>({});
  const [poorReasonsText, setPoorReasonsText] = useState("");
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
      poorFormTitle: query.data.poorFormTitle,
      poorFormPrompt: query.data.poorFormPrompt,
      poorSubmitLabel: query.data.poorSubmitLabel,
      goodThankYouMessage: query.data.goodThankYouMessage,
    });
    setPoorReasonsText(formatReasonOptions(query.data.poorReasonOptions));
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
      poorFormTitle: form.poorFormTitle?.trim() || "Feedback",
      poorFormPrompt:
        form.poorFormPrompt?.trim() || "Tell us what can be improved?",
      poorSubmitLabel: form.poorSubmitLabel?.trim() || "Submit",
      goodThankYouMessage:
        form.goodThankYouMessage?.trim() || "Thank you for your feedback.",
      poorReasonOptions: parseReasonOptionsText(poorReasonsText),
    }),
    [form, poorReasonsText],
  );

  const handleSave = async () => {
    if (!canUpdate) return;
    try {
      await updateMutation.mutateAsync({
        ...form,
        poorReasonOptions: parseReasonOptionsText(poorReasonsText),
      });
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
        description="Distribution email rating links and the public poor-rating form."
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
      description="Configure like/dislike labels in distribution wrap-up emails and the public form recipients see when they click Poor."
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
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mb: 1, display: "block" }}>
              Shown in distribution wrap-up emails. Recipients click a link to rate on the public page.
            </Typography>
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
            <EmailBuilderInputField
              label="Thank-you message (after submit)"
              name="goodThankYouMessage"
              value={preview.goodThankYouMessage}
              onChange={(e) => patch({ goodThankYouMessage: e.target.value })}
              disabled={!canUpdate}
              multiline
            />
          </EmailBuilderSettingsGroup>

          <EmailBuilderSettingsGroup>
            <BuilderGroupHeading>Poor rating form (public page)</BuilderGroupHeading>
            <EmailBuilderInputField
              label="Form title"
              name="poorFormTitle"
              value={preview.poorFormTitle}
              onChange={(e) => patch({ poorFormTitle: e.target.value })}
              disabled={!canUpdate}
            />
            <EmailBuilderInputField
              label="Prompt"
              name="poorFormPrompt"
              value={preview.poorFormPrompt}
              onChange={(e) => patch({ poorFormPrompt: e.target.value })}
              disabled={!canUpdate}
            />
            <EmailBuilderInputField
              label="Reason chips (one per line)"
              name="poorReasonOptions"
              value={poorReasonsText}
              onChange={(e) => {
                setPoorReasonsText(e.target.value);
                setDirty(true);
              }}
              disabled={!canUpdate}
              multiline
              placeholder={"Long wait time\nUnhelpful response\n…"}
            />
            <EmailBuilderInputField
              label="Submit button label"
              name="poorSubmitLabel"
              value={preview.poorSubmitLabel}
              onChange={(e) => patch({ poorSubmitLabel: e.target.value })}
              disabled={!canUpdate}
            />
          </EmailBuilderSettingsGroup>

          <EmailBuilderSettingsGroup>
            <BuilderGroupHeading>Additional note (email block)</BuilderGroupHeading>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mb: 1, display: "block" }}>
              Optional notes block in the email template — separate from the public poor form.
            </Typography>
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
            In-email inquire buttons link to the public rating page.
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
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    component="span"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "2px solid #22c55e",
                      bgcolor: "#dcfce7",
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
                    component="span"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "2px solid #ef4444",
                      bgcolor: "#fee2e2",
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

          {preview.poorReasonOptions.length > 0 ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: alpha(theme.palette.common.black, 0.08),
              }}
            >
              <Typography variant="small" fontWeight={700} sx={{ mb: 0.75 }}>
                {preview.poorFormTitle}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
                {preview.poorFormPrompt}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {preview.poorReasonOptions.slice(0, 4).map((r) => (
                  <Box
                    key={r}
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 99,
                      border: `1px solid ${theme.app.dashboard.cardBorder}`,
                      fontSize: 11,
                    }}
                  >
                    {r}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </EmailBuilderSettingsGroup>
      </Box>

      <EmailBuilderSettingsGroup>
        <BuilderGroupHeading>Distribution feedback submissions</BuilderGroupHeading>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, display: "block" }}>
          Ratings submitted from distribution wrap-up email links.
        </Typography>
        {submissionsQuery.isLoading ? (
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading submissions…
          </Typography>
        ) : submissionsQuery.isError ? (
          <Typography variant="small" color="error">
            Could not load submissions.
          </Typography>
        ) : (submissionsQuery.data?.items.length ?? 0) === 0 ? (
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
            No feedback submitted yet. Send a distribution test email and use the rating links.
          </Typography>
        ) : (
          <>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Website</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissionsQuery.data?.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {new Date(row.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{row.rating}</TableCell>
                      <TableCell>{row.send.recipientEmail}</TableCell>
                      <TableCell>{row.send.websiteName}</TableCell>
                      <TableCell>{row.send.departmentName}</TableCell>
                      <TableCell>
                        {row.reasonKeys.length > 0
                          ? row.reasonKeys.join(", ")
                          : row.comment ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            {(submissionsQuery.data?.totalPages ?? 1) > 1 ? (
              <Box sx={{ display: "flex", gap: 1, mt: 1.5, alignItems: "center" }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={submissionsPage <= 1}
                  onClick={() => setSubmissionsPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  Page {submissionsPage} of {submissionsQuery.data?.totalPages ?? 1}
                </Typography>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={
                    submissionsPage >= (submissionsQuery.data?.totalPages ?? 1)
                  }
                  onClick={() => setSubmissionsPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Box>
            ) : null}
          </>
        )}
      </EmailBuilderSettingsGroup>
    </EmailSectionLayout>
  );
}
