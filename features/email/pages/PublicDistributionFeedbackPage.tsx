"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ThumbDownAltOutlined from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlined from "@mui/icons-material/ThumbUpAltOutlined";
import { Button, Typography } from "@/components/common";
import {
  getPublicDistributionFeedbackForm,
  submitPublicDistributionFeedback,
  type PublicDistributionFeedbackFormContext,
} from "@/api/public-distribution-feedback";

export function PublicDistributionFeedbackPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const ratingParam = searchParams.get("rating") === "poor" ? "poor" : "good";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<PublicDistributionFeedbackFormContext | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [thankYou, setThankYou] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setError("This feedback link is invalid or incomplete.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicDistributionFeedbackForm(token, ratingParam);
      setCtx(data);
      if (data.alreadySubmitted) {
        setDone(true);
        setThankYou(data.thankYouMessage ?? "Thank you for your feedback.");
      } else if (ratingParam === "good") {
        const res = await submitPublicDistributionFeedback({
          token,
          rating: "good",
        });
        setDone(true);
        setThankYou(res.thankYouMessage);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load feedback form.");
    } finally {
      setLoading(false);
    }
  }, [token, ratingParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason],
    );
  };

  const handleSubmitPoor = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitPublicDistributionFeedback({
        token,
        rating: "poor",
        reasonKeys: selectedReasons,
        comment: comment.trim() || undefined,
      });
      setDone(true);
      setThankYou(res.thankYouMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const poorOptions = useMemo(
    () => ctx?.settings?.poorReasonOptions ?? [],
    [ctx?.settings?.poorReasonOptions],
  );

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
            Feedback unavailable
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
            {thankYou || ctx?.thankYouMessage || "Your feedback has been recorded."}
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

  if (ratingParam === "good") {
    return null;
  }

  const title = ctx?.settings?.poorFormTitle ?? "Feedback";
  const prompt = ctx?.settings?.poorFormPrompt ?? "Tell us what can be improved?";
  const submitLabel = ctx?.settings?.poorSubmitLabel ?? "Submit";

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
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="small" sx={{ color: "text.secondary" }}>
            You are rating
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "#fee2e2",
              border: "2px solid #ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ThumbDownAltOutlined sx={{ color: "#dc2626", fontSize: 20 }} />
          </Box>
        </Box>

        {ctx?.send ? (
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
            Re: {ctx.send.subject} ({ctx.send.websiteLabel})
          </Typography>
        ) : null}

        <Typography variant="medium" fontWeight={600} sx={{ mb: 1.5 }}>
          {prompt}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {poorOptions.map((reason) => {
            const selected = selectedReasons.includes(reason);
            return (
              <Chip
                key={reason}
                label={reason}
                onClick={() => toggleReason(reason)}
                variant={selected ? "filled" : "outlined"}
                color={selected ? "primary" : "default"}
                sx={{ fontWeight: 600 }}
              />
            );
          })}
        </Box>

        <Typography variant="small" fontWeight={600} sx={{ mb: 0.75 }}>
          Other (Please describe below)
        </Typography>
        <Box
          component="textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
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
          disabled={submitting}
          onClick={() => void handleSubmitPoor()}
        >
          {submitting ? "Submitting…" : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
