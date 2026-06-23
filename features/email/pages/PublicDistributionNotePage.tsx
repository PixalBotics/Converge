"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Button, Typography } from "@/components/common";
import {
  getPublicDistributionNoteForm,
  submitPublicDistributionNote,
  type PublicDistributionNoteFormContext,
} from "@/api/public-distribution-feedback";

export function PublicDistributionNotePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<PublicDistributionNoteFormContext | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [thankYou, setThankYou] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setError("This note link is invalid or incomplete.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicDistributionNoteForm(token);
      setCtx(data);
      if (data.alreadySubmitted) {
        setDone(true);
        setThankYou(data.thankYouMessage ?? "Thank you for your note.");
        if (data.note) setNote(data.note);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load note form.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitPublicDistributionNote({
        token,
        note: note.trim(),
      });
      setDone(true);
      setThankYou(res.thankYouMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f1f5f9" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !ctx) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f1f5f9", p: 3 }}>
        <Box sx={{ maxWidth: 420, bgcolor: "#fff", borderRadius: 2, p: 3, boxShadow: 2 }}>
          <Typography variant="medium" fontWeight={700} sx={{ mb: 1 }}>
            Note unavailable
          </Typography>
          <Typography variant="small" sx={{ color: "text.secondary" }}>
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (done || ctx?.alreadySubmitted) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f1f5f9", p: 3 }}>
        <Box sx={{ maxWidth: 420, width: "100%", bgcolor: "#fff", borderRadius: 2, p: 3, boxShadow: 2 }}>
          <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 1 }}>
            Thank you
          </Typography>
          <Typography variant="medium" sx={{ color: "text.secondary", mb: 2 }}>
            {thankYou || ctx?.thankYouMessage || "Your note has been recorded."}
          </Typography>
          {ctx?.send ? (
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {ctx.send.subject} · {ctx.send.departmentName}
            </Typography>
          ) : null}
        </Box>
      </Box>
    );
  }

  const placeholder =
    ctx?.settings?.notesPlaceholder?.trim() ||
    "Add wrap-up notes for the next agent or supervisor…";
  const submitLabel = ctx?.settings?.notesSubmitLabel?.trim() || "Submit note";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          bgcolor: "#fff",
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(15,23,42,0.12)",
          p: { xs: 2.5, sm: 3 },
        }}
      >
        <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 1 }}>
          Additional note
        </Typography>

        {ctx?.send ? (
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
            Re: {ctx.send.subject} ({ctx.send.websiteLabel})
          </Typography>
        ) : null}

        <Box
          component="textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={placeholder}
          rows={5}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: 1.25,
            mb: 2,
            borderRadius: 1,
            border: "1px solid #cbd5e1",
            fontFamily: "inherit",
            fontSize: 14,
            resize: "vertical",
          }}
        />

        {error ? (
          <Typography variant="caption" sx={{ color: "error.main", display: "block", mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <Button
          type="button"
          variant="primary"
          fullWidth
          disabled={submitting || !note.trim()}
          onClick={() => void handleSubmit()}
        >
          {submitting ? "Submitting…" : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
