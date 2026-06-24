"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import ThumbDownAltOutlined from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlined from "@mui/icons-material/ThumbUpAltOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import type { PlatformAgentFeedbackSettingsBody } from "@/api/types/email.types";
import { EmailBuilderInputField } from "@/features/email/components/email-builder/EmailBuilderFormField";
import { EmailBuilderSettingsGroup } from "@/features/email/styles/email-design.styled";
import {
  useDistributionFeedbackSubmissionsQuery,
  usePlatformAgentFeedbackQuery,
  useUpdatePlatformAgentFeedbackMutation,
} from "@/features/email/hooks/usePlatformAgentFeedback";

type FeedbackTab = "submissions" | "form";

function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme() as AppTheme;
  return (
    <Typography
      variant="small"
      fontWeight={700}
      sx={{
        mb: 1,
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

function feedbackDetail(row: {
  feedbackType: string;
  reasonKeys: string[];
  comment: string | null;
}): string {
  if (row.feedbackType === "note") return row.comment?.trim() || "—";
  if (row.reasonKeys.length > 0) return row.reasonKeys.join(", ");
  return row.comment?.trim() || "—";
}

export function FeedbackPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.agentFeedback.view);
  const canUpdate = hasOperational(OP.agentFeedback.update);

  const [tab, setTab] = useState<FeedbackTab>("submissions");
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [websiteFilter, setWebsiteFilter] = useState("");

  const settingsQuery = usePlatformAgentFeedbackQuery({ enabled: canView && tab === "form" });
  const updateMutation = useUpdatePlatformAgentFeedbackMutation();
  const submissionsQuery = useDistributionFeedbackSubmissionsQuery(
    submissionsPage,
    25,
    websiteFilter || undefined,
    { enabled: canView && tab === "submissions" },
  );

  const [form, setForm] = useState<PlatformAgentFeedbackSettingsBody>({});
  const [poorReasonsText, setPoorReasonsText] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data) return;
    setForm({
      ratingEnabled: settingsQuery.data.ratingEnabled,
      goodLabel: settingsQuery.data.goodLabel,
      poorLabel: settingsQuery.data.poorLabel,
      ratingRequired: settingsQuery.data.ratingRequired,
      notesEnabled: settingsQuery.data.notesEnabled,
      notesPlaceholder: settingsQuery.data.notesPlaceholder,
      notesSubmitLabel: settingsQuery.data.notesSubmitLabel,
      notesRequired: settingsQuery.data.notesRequired,
      poorFormTitle: settingsQuery.data.poorFormTitle,
      poorFormPrompt: settingsQuery.data.poorFormPrompt,
      poorSubmitLabel: settingsQuery.data.poorSubmitLabel,
      goodThankYouMessage: settingsQuery.data.goodThankYouMessage,
    });
    setPoorReasonsText(formatReasonOptions(settingsQuery.data.poorReasonOptions));
    setDirty(false);
  }, [settingsQuery.data]);

  const patch = useCallback((partial: PlatformAgentFeedbackSettingsBody) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  const preview = useMemo(
    () => ({
      ratingEnabled: form.ratingEnabled ?? true,
      goodLabel: form.goodLabel?.trim() || "Good",
      poorLabel: form.poorLabel?.trim() || "Poor",
      notesEnabled: form.notesEnabled ?? true,
      notesPlaceholder:
        form.notesPlaceholder?.trim() ||
        "Add wrap-up notes for the next agent or supervisor…",
      notesSubmitLabel: form.notesSubmitLabel?.trim() || "Submit note",
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
      publishAppToast({ variant: "success", message: "Feedback form saved." });
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Request failed.",
      });
    }
  };

  if (!canView) {
    return (
      <Box>
        <Typography variant="regularLarge" fontWeight={700} sx={{ mb: 1 }}>
          Feedback
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          You do not have permission to view feedback.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
      <Box>
        <Typography variant="regularLarge" fontWeight={700} sx={{ mb: 0.5 }}>
          Feedback
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          One global feedback form for all distribution emails. View submissions by website and
          chat below, or configure the public form recipients see.
        </Typography>
      </Box>

      <DashboardCard sx={{ p: 0, height: "auto", minHeight: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, value: FeedbackTab) => setTab(value)}
          sx={{
            minHeight: 44,
            px: { xs: 0.5, md: 1 },
            borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 44 },
          }}
        >
          <Tab value="submissions" label="Submissions" />
          <Tab value="form" label="Show feedback form" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          {tab === "submissions" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                }}
              >
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                  Distribution email feedback — website, chat, rating, and notes.
                </Typography>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel id="feedback-website-filter">Website</InputLabel>
                  <Select
                    labelId="feedback-website-filter"
                    label="Website"
                    value={websiteFilter}
                    onChange={(e) => {
                      setWebsiteFilter(e.target.value);
                      setSubmissionsPage(1);
                    }}
                  >
                    <MenuItem value="">All websites</MenuItem>
                    {(submissionsQuery.data?.websiteOptions ?? []).map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

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
                  No feedback yet. Send a distribution email and use the rating or note links.
                </Typography>
              ) : (
                <>
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Submitted</TableCell>
                          <TableCell>Website</TableCell>
                          <TableCell>Chat</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Feedback</TableCell>
                          <TableCell>Email subject</TableCell>
                          <TableCell>Recipient</TableCell>
                          <TableCell>Department</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {submissionsQuery.data?.items.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {new Date(row.submittedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{row.send.websiteName}</TableCell>
                            <TableCell>
                              {row.send.conversation ? (
                                <Link
                                  href={`/dashboard/chat-transcripts/${row.send.conversation.id}`}
                                  style={{
                                    color: theme.palette.primary.light,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                  }}
                                >
                                  #{row.send.conversation.shortId}
                                </Link>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.feedbackType === "note" ? "Note" : "Rating"}
                                sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ textTransform: "capitalize" }}>
                              {row.rating ?? "—"}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 240 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {feedbackDetail(row)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 180 }}>
                              <Typography variant="caption" noWrap title={row.send.subject}>
                                {row.send.subject}
                              </Typography>
                            </TableCell>
                            <TableCell>{row.send.recipientEmail}</TableCell>
                            <TableCell>{row.send.departmentName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                  {(submissionsQuery.data?.totalPages ?? 1) > 1 ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                        Page {submissionsPage} of {submissionsQuery.data?.totalPages ?? 1} ·{" "}
                        {submissionsQuery.data?.total ?? 0} total
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
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" },
                gap: 2,
                alignItems: "start",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                  Global form — same labels and fields for every distribution email on the
                  platform.
                </Typography>

                <EmailBuilderSettingsGroup>
                  <SectionLabel>Like / dislike (email links)</SectionLabel>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preview.ratingEnabled}
                        onChange={(e) => patch({ ratingEnabled: e.target.checked })}
                        disabled={!canUpdate || settingsQuery.isLoading}
                      />
                    }
                    label="Show rating in email"
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
                </EmailBuilderSettingsGroup>

                <EmailBuilderSettingsGroup>
                  <SectionLabel>Poor rating form</SectionLabel>
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
                  />
                  <EmailBuilderInputField
                    label="Submit button"
                    name="poorSubmitLabel"
                    value={preview.poorSubmitLabel}
                    onChange={(e) => patch({ poorSubmitLabel: e.target.value })}
                    disabled={!canUpdate}
                  />
                  <EmailBuilderInputField
                    label="Thank-you message"
                    name="goodThankYouMessage"
                    value={preview.goodThankYouMessage}
                    onChange={(e) => patch({ goodThankYouMessage: e.target.value })}
                    disabled={!canUpdate}
                    multiline
                  />
                </EmailBuilderSettingsGroup>

                <EmailBuilderSettingsGroup>
                  <SectionLabel>Additional note form</SectionLabel>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preview.notesEnabled}
                        onChange={(e) => patch({ notesEnabled: e.target.checked })}
                        disabled={!canUpdate || settingsQuery.isLoading}
                      />
                    }
                    label="Show note link in email"
                  />
                  <EmailBuilderInputField
                    label="Placeholder"
                    name="notesPlaceholder"
                    value={preview.notesPlaceholder}
                    onChange={(e) => patch({ notesPlaceholder: e.target.value })}
                    disabled={!canUpdate || !preview.notesEnabled}
                    multiline
                    minRows={2}
                  />
                  <EmailBuilderInputField
                    label="Submit button"
                    name="notesSubmitLabel"
                    value={preview.notesSubmitLabel}
                    onChange={(e) => patch({ notesSubmitLabel: e.target.value })}
                    disabled={!canUpdate || !preview.notesEnabled}
                  />
                </EmailBuilderSettingsGroup>

                {canUpdate ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => void handleSave()}
                    disabled={!dirty || updateMutation.isPending}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {updateMutation.isPending ? "Saving…" : "Save form"}
                  </Button>
                ) : null}
              </Box>

              <EmailBuilderSettingsGroup sx={{ position: { lg: "sticky" }, top: 16 }}>
                <SectionLabel>Form preview</SectionLabel>
                {preview.ratingEnabled ? (
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.app.dashboard.cardBorder}`,
                      bgcolor: alpha(theme.palette.common.black, 0.1),
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

                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                    bgcolor: alpha(theme.palette.common.black, 0.08),
                  }}
                >
                  <Typography variant="small" fontWeight={700} sx={{ mb: 0.75 }}>
                    {preview.poorFormTitle}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}
                  >
                    {preview.poorFormPrompt}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                    {preview.poorReasonOptions.slice(0, 4).map((r) => (
                      <Chip key={r} size="small" label={r} variant="outlined" />
                    ))}
                  </Box>
                  <Button type="button" variant="primary" size="small" disabled>
                    {preview.poorSubmitLabel}
                  </Button>
                </Box>

                {preview.notesEnabled ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.app.dashboard.cardBorder}`,
                      bgcolor: alpha(theme.palette.common.black, 0.08),
                    }}
                  >
                    <Typography variant="small" fontWeight={700} sx={{ mb: 1 }}>
                      Additional note
                    </Typography>
                    <Box
                      sx={{
                        p: 1.25,
                        mb: 1.5,
                        borderRadius: 1,
                        border: "1px dashed #cbd5e1",
                        fontSize: 13,
                        color: theme.app.dashboard.textMuted,
                      }}
                    >
                      {preview.notesPlaceholder}
                    </Box>
                    <Button type="button" variant="secondary" size="small" disabled>
                      {preview.notesSubmitLabel}
                    </Button>
                  </Box>
                ) : null}
              </EmailBuilderSettingsGroup>
            </Box>
          )}
        </Box>
      </DashboardCard>
    </Box>
  );
}
